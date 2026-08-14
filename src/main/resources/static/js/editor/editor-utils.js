import {addHours, formatMemoCreatedAt, initCompareButtonEvent, renderBadge} from "../article/article-utils.js";
import {getArticleReleasePolicyCase} from "../article/article-release-policy-case.js";
import {renderAutoHashtags, setRightPreviews, setRightPreviewsFromContent} from "./editor-sub-area-utils.js";
import {
    applyInlineStylesToPreview,
    initPreviewViewSizeToggle,
    loadPreviewData
} from "../article/article-preview-utils.js";
import {
    addBylineUserBlock,
    categoryChangeAction,
    initCategoryOptions,
    loadCategories,
    updateBylinePreview
} from "./category-byline-utils.js";

function positionAutocompleteContainer(inputElem, resultContainer) {
    const rect = inputElem.getBoundingClientRect();
    resultContainer.style.top = rect.bottom + 'px';
    resultContainer.style.left = rect.left + 'px';
    resultContainer.style.width = rect.width + 'px';
}

function bindAutocompleteOverlayDismiss(resultContainer, onDismiss = () => {}) {
    const dismiss = () => {
        if (resultContainer.style.display === 'none') {
            return;
        }

        resultContainer.style.display = 'none';
        onDismiss();
    };

    document.addEventListener('scroll', (event) => {
        if (event.target === resultContainer) {
            return;
        }

        dismiss();
    }, true);

    window.addEventListener('resize', dismiss);

    return dismiss;
}

function getEditorAutoSaveIntervalMs() {
    const rawValue = document.getElementById('editorAutoSaveIntervalMs')?.value;
    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        return 300000;
    }

    return parsedValue;
}

/**
 * 문패/어깨 자동완성 바인딩
 *
 * @param {'series' | 'serial'} type - 'series'(문패) 또는 'serial'(어깨)
 */
export function bindPackAutocomplete(type) {
    const idMap = {
        series: { inputId: 'article_series', hiddenId: 'article_series_id' },
        serial: { inputId: 'article_serial', hiddenId: 'article_serial_id' }
    };

    if (!idMap[type]) {
        console.error(`알 수 없는 type: ${type}`);
        return;
    }

    const { inputId, hiddenId } = idMap[type];
    const inputElem = document.getElementById(inputId);
    const hiddenInput = document.getElementById(hiddenId);

    if (!inputElem || !hiddenInput) {
        console.warn('입력 요소를 찾을 수 없습니다:', inputId, hiddenId);
        return;
    }

    let lastResults = [];
    let selectedIndex = -1;

    const resultContainer = document.createElement('div');
    resultContainer.style.position = 'fixed';
    resultContainer.style.zIndex = '1000';
    resultContainer.style.background = '#fff';
    resultContainer.style.border = '1px solid #ccc';
    resultContainer.style.maxHeight = '200px';
    resultContainer.style.overflowY = 'auto';
    resultContainer.style.display = 'none';
    resultContainer.className = 'autocomplete-result';
    document.body.appendChild(resultContainer);
    const dismissResultContainer = bindAutocompleteOverlayDismiss(resultContainer, clearSelection);

    async function fetchAndRender(keyword) {
        if (!keyword) {
            dismissResultContainer();
            lastResults = [];
            return;
        }

        try {
            const res = await fetch(`/api/editor/packs/${type}?title=${encodeURIComponent(keyword)}`);
            const result = await res.json();
            const data = result.data || [];

            lastResults = data;
            selectedIndex = -1;

            if (data.length === 0) {
                dismissResultContainer();
                return;
            }

            positionAutocompleteContainer(inputElem, resultContainer);
            resultContainer.innerHTML = '';

            data.forEach((itemData, index) => {
                const item = document.createElement('div');
                item.textContent = itemData.title;
                item.dataset.index = index;
                item.style.padding = '5px';
                item.style.cursor = 'pointer';

                item.addEventListener('mouseenter', () => {
                    updateSelection(index);
                });

                item.addEventListener('mouseleave', () => {
                    clearSelection();
                });

                item.addEventListener('click', () => {
                    debouncedFetch.cancel();
                    inputElem.dataset.manualSelection = '1';
                    inputElem.value = itemData.title;
                    hiddenInput.value = itemData.id;
                    dismissResultContainer();
                });

                resultContainer.appendChild(item);
            });

            resultContainer.style.display = 'block';
        } catch (err) {
            console.error(`검색 실패(${type}):`, err);
            dismissResultContainer();
            lastResults = [];
        }
    }

    function updateSelection(index) {
        selectedIndex = index;
        Array.from(resultContainer.children).forEach((el, idx) => {
            el.style.background = (idx === index) ? '#f0f0f0' : '#fff';
        });

        const selectedEl = resultContainer.children[index];
        if (selectedEl && typeof selectedEl.scrollIntoView === 'function') {
            selectedEl.scrollIntoView({ block: 'nearest' });
        }
    }

    function clearSelection() {
        selectedIndex = -1;
        Array.from(resultContainer.children).forEach(el => {
            el.style.background = '#fff';
        });
    }

    const debouncedFetch = debounce((keyword) => fetchAndRender(keyword), 300);

    inputElem.addEventListener('input', () => {
        if (inputElem.dataset.manualSelection === '1') {
            delete inputElem.dataset.manualSelection;
            return;
        }
        const keyword = inputElem.value.trim();
        hiddenInput.value = '';
        debouncedFetch(keyword);
    });

    inputElem.addEventListener('focus', () => {
        const keyword = inputElem.value.trim();
        if (keyword) {
            debouncedFetch(keyword);
        }
    });

    inputElem.addEventListener('blur', () => {
        setTimeout(() => {
            dismissResultContainer();
            const currentValue = inputElem.value.trim();
            if (!currentValue) {
                hiddenInput.value = '';
                return;
            }

            const matched = lastResults.find(item => item.title === currentValue);

            if (matched) {
                hiddenInput.value = matched.id; // 자동 바인딩
            } else {
                hiddenInput.value = ''; // 신규 항목
            }
        }, 200);
    });

    inputElem.addEventListener('keydown', (e) => {
        const total = resultContainer.children.length;
        if (resultContainer.style.display === 'none' || total === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            debouncedFetch.cancel();
            selectedIndex = selectedIndex < 0 ? 0 : Math.min(selectedIndex + 1, total - 1);
            updateSelection(selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            debouncedFetch.cancel();
            selectedIndex = selectedIndex <= 0 ? 0 : selectedIndex - 1;
            updateSelection(selectedIndex);
        } else if (e.key === 'Enter') {
            if (selectedIndex >= 0 && selectedIndex < total) {
                e.preventDefault();
                const selectedItem = lastResults[selectedIndex];
                inputElem.value = selectedItem.title;
                hiddenInput.value = selectedItem.id;
                dismissResultContainer();
                inputElem.dataset.manualSelection = '1';
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!resultContainer.contains(e.target) && e.target !== inputElem) {
            dismissResultContainer();
        }
    });
}

/**
 * 카테고리 트리 + / - 버튼 동작 처리
 */
function initBootstrapTooltips(scope = document) {
    const tooltipApi = window.bootstrap?.Tooltip;
    if (!tooltipApi || !scope) {
        return;
    }

    const targets = scope.matches?.('[data-bs-toggle="tooltip"]')
        ? [scope]
        : Array.from(scope.querySelectorAll?.('[data-bs-toggle="tooltip"]') || []);

    targets.forEach(target => {
        tooltipApi.getOrCreateInstance(target);
    });
}

export function bindCategoryBoxAddRemoveEvents() {
    document.addEventListener('click', function (event) {
        const addButton = event.target.closest?.('.category-add-btn');

        // "+" 버튼 클릭 시
        if (addButton) {
            const originalBox = addButton.closest('.selector-box');
            const copiedBox = originalBox.cloneNode(true);

            // 초기화
            copiedBox.querySelectorAll('select').forEach(select => {
                const defaultText = select.classList.contains('depth1') ? '1ˢᵗ depth' :
                    select.classList.contains('depth2') ? '2ⁿᵈ depth' :
                        select.classList.contains('depth3') ? '3ʳᵈ depth' : '선택';
                select.innerHTML = `<option selected="" value="default">${defaultText}</option>`;
            });

            // 버튼 상태 변경
            setCategoryBoxButtonState(copiedBox, false);

            // 같은 col-md-9 안에서 마지막 .selector-box 뒤에 추가
            const container = originalBox.parentElement;
            const boxes = container.querySelectorAll('.selector-box');
            const last = boxes[boxes.length - 1];
            last.insertAdjacentElement('afterend', copiedBox);

            // 복제된 박스의 분류 로직 다시 적용
            initCategoryOptions(copiedBox);
            initBootstrapTooltips(copiedBox);
        }

        // "-" 버튼 클릭 시 삭제
        const removeButton = event.target.closest?.('.category-minus-btn');
        if (removeButton) {
            removeButton.closest('.selector-box')?.remove();
        }
    });
}

/* const CATEGORY_ROOT_META = {
    1: { label: '딜사이트' },
    2: { label: '딜사이트 플러스' }
}; */

function normalizeCategoryValue(value) {
    if (value == null || value === '' || value === 'default' || value === '-') {
        return null;
    }

    return String(value);
}

function getCategorySelections(includeEmpty = false) {
    const categories = Array.from(document.querySelectorAll('.category-selector-box')).map(box => {
        const depth1 = normalizeCategoryValue(box.querySelector('.depth1')?.value);
        const depth2 = normalizeCategoryValue(box.querySelector('.depth2')?.value);
        const depth3 = normalizeCategoryValue(box.querySelector('.depth3')?.value);

        return {
            rootId: depth1 != null ? Number(box.dataset.rootId) : null,
            depth1,
            depth2,
            depth3
        };
    });

    if (includeEmpty) {
        return categories;
    }

    return categories.filter(category => category.rootId != null);
}

function serializeCategorySelections(categories = getCategorySelections(false)) {
    return JSON.stringify(
        categories
            .map(category => ({
                rootId: category.rootId == null ? null : Number(category.rootId),
                depth1: normalizeCategoryValue(category.depth1),
                depth2: normalizeCategoryValue(category.depth2),
                depth3: normalizeCategoryValue(category.depth3)
            }))
            .sort((left, right) => {
                if ((left.rootId ?? 0) !== (right.rootId ?? 0)) {
                    return (left.rootId ?? 0) - (right.rootId ?? 0);
                }

                return `${left.depth1 ?? ''}:${left.depth2 ?? ''}:${left.depth3 ?? ''}`
                    .localeCompare(`${right.depth1 ?? ''}:${right.depth2 ?? ''}:${right.depth3 ?? ''}`);
            })
    );
}

function setOriginalCategorySnapshot(categories = getCategorySelections(false)) {
    const container = document.querySelector('.category-selector');
    if (!container) {
        return;
    }

    container.dataset.originalCategories = serializeCategorySelections(categories);
}

function getOriginalCategorySnapshot() {
    const container = document.querySelector('.category-selector');
    return container?.dataset.originalCategories || '[]';
}

const CATEGORY_MODAL_ROOT_IDS = [1, 2];

async function fetchEditorCategoryTree(rootId) {
    const response = await fetch(`/api/editor/categories/${rootId}/tree`);
    if (!response.ok) {
        throw new Error(`failed to load category tree: ${rootId}`);
    }

    const result = await response.json();
    return result.data || [];
}

function buildCategoryTreeFromFlat(rootId, categories) {
    if (!Array.isArray(categories) || categories.length === 0) {
        return {
            rootId,
            label: `Root ${rootId}`,
            children: []
        };
    }

    const [rootCategory, ...descendants] = categories;
    const byId = new Map(
        descendants.map(category => [
            category.id,
            {
                ...category,
                children: []
            }
        ])
    );

    descendants.forEach(category => {
        const current = byId.get(category.id);
        const parent = byId.get(category.parentId);

        if (parent) {
            parent.children.push(current);
        }
    });

    return {
        rootId,
        label: rootCategory.name || `Root ${rootId}`,
        children: descendants
            .filter(category => category.parentId === rootCategory.id)
            .map(category => byId.get(category.id))
    };
}

async function loadCategoryModalTree() {
    return Promise.all(CATEGORY_MODAL_ROOT_IDS.map(async (rootId) => {
        const categories = await fetchEditorCategoryTree(rootId);
        return buildCategoryTreeFromFlat(rootId, categories);
    }));
}

function buildCategoryRadioHtml({ level, rootId, depth1, depth2, depth3 }) {
    const inputId = [
        'modal-category',
        rootId,
        depth1?.id,
        depth2?.id,
        depth3?.id || level
    ].join('-');

    const label = depth3?.name || depth2?.name || '';
    const depth3Id = depth3?.id ?? '';
    const depth3Name = depth3?.name ?? '';
    return `
        <div class="form-check form-check-inline me-3 mb-2">
            <input
                class="form-check-input category-modal-radio"
                type="radio"
                name="category-modal-selection"
                id="${inputId}"
                data-level="${level}"
                data-root-id="${rootId}"
                data-depth1-id="${depth1.id}"
                data-depth1-label="${escapeHtml(depth1.name)}"
                data-depth2-id="${depth2.id}"
                data-depth2-label="${escapeHtml(depth2.name)}"
                data-depth3-id="${depth3Id}"
                data-depth3-label="${escapeHtml(depth3Name)}"
            >
            <label class="form-check-label" for="${inputId}">
                ${escapeHtml(label)}
            </label>
        </div>
    `;
}

function getCategoryModalSelectionKey(target) {
    if (!target) {
        return '';
    }

    const isInput = target instanceof Element && target.classList.contains('category-modal-radio');
    const rootId = isInput ? target.dataset.rootId : target.rootId;
    const depth1Id = isInput ? target.dataset.depth1Id : target.depth1;
    const depth2Id = isInput ? target.dataset.depth2Id : target.depth2;
    const depth3Id = isInput ? (target.dataset.depth3Id || '') : (target.depth3 ?? '');

    return [rootId, depth1Id, depth2Id, depth3Id].join(':');
}

function renderDepth2Rows(root, depth1) {
    const rows = [];
    const hasAnyDepth3 = depth1.children.some(depth2 => Array.isArray(depth2.children) && depth2.children.length > 0);

    if (hasAnyDepth3) {
        depth1.children.forEach((depth2, index) => {
            const hasDepth3 = Array.isArray(depth2.children) && depth2.children.length > 0;
            const rowClass = index > 0 ? 'w-100 pt-2 border-top' : 'w-100';

            if (!hasDepth3) {
                rows.push(`
                    <div class="${rowClass}">
                        <div class="d-flex flex-wrap align-items-center">
                            ${buildCategoryRadioHtml({
                                level: 2,
                                rootId: root.rootId,
                                depth1,
                                depth2
                            })}
                        </div>
                    </div>
                `);
                return;
            }

            rows.push(`
                <div class="${rowClass}">
                    <div class="mb-2">${escapeHtml(depth2.name)}</div>
                    <div class="ps-3 d-flex flex-wrap align-items-center category-modal-depth3-list">
                        ${depth2.children.map(depth3 => buildCategoryRadioHtml({
                            level: 3,
                            rootId: root.rootId,
                            depth1,
                            depth2,
                            depth3
                        })).join('')}
                    </div>
                </div>
            `);
        });

        return rows.join('');
    }

    let pendingLeafNodes = [];
    const hasRenderedRows = () => rows.length > 0;

    const flushPendingLeafNodes = () => {
        if (pendingLeafNodes.length === 0) {
            return;
        }

        rows.push(`
            <div class="w-100 d-flex flex-wrap align-items-center ${hasRenderedRows() ? 'pt-2 border-top' : ''}">
                ${pendingLeafNodes.map(depth2 => buildCategoryRadioHtml({
                    level: 2,
                    rootId: root.rootId,
                    depth1,
                    depth2
                })).join('')}
            </div>
        `);

        pendingLeafNodes = [];
    };

    depth1.children.forEach(depth2 => {
        const hasDepth3 = Array.isArray(depth2.children) && depth2.children.length > 0;

        if (!hasDepth3) {
            pendingLeafNodes.push(depth2);
            return;
        }

        flushPendingLeafNodes();

        rows.push(`
            <div class="w-100 ${hasRenderedRows() ? 'pt-2 border-top' : ''}">
                <div class="mb-2">${escapeHtml(depth2.name)}</div>
                <div class="ps-3 d-flex flex-wrap align-items-center category-modal-depth3-list">
                    ${depth2.children.map(depth3 => buildCategoryRadioHtml({
                        level: 3,
                        rootId: root.rootId,
                        depth1,
                        depth2,
                        depth3
                    })).join('')}
                </div>
            </div>
        `);
    });

    flushPendingLeafNodes();

    return rows.join('');
}

function renderCategoryModalTree(tree) {
    const body = document.getElementById('category-modal-body');
    if (!body) {
        return;
    }

    body.innerHTML = tree.map(root => `
        <section class="mb-4" data-root-id="${root.rootId}">
            <div class="d-flex flex-column gap-1 mb-3">
                <strong>${escapeHtml(root.label)}</strong>
            </div>
            <div class="d-flex flex-column gap-2">
                ${root.children.map(depth1 => `
                    <div class="border rounded px-3 py-2">
                        <div class="fw-bold mb-2">${escapeHtml(depth1.name)}</div>
                        ${renderDepth2Rows(root, depth1)}
                    </div>
                `).join('')}
            </div>
        </section>
    `).join('');
}

function syncCategoryModalSelectionFromBox(modalElement, box) {
    if (!modalElement || !box) {
        return;
    }

    const category = {
        rootId: Number(box.dataset.rootId),
        depth1: normalizeCategoryValue(box.querySelector('.depth1')?.value),
        depth2: normalizeCategoryValue(box.querySelector('.depth2')?.value),
        depth3: normalizeCategoryValue(box.querySelector('.depth3')?.value)
    };
    const selectedKey = getCategoryModalSelectionKey(category);

    modalElement.querySelectorAll('.category-modal-radio').forEach(radio => {
        radio.checked = getCategoryModalSelectionKey(radio) === selectedKey;
    });
}

function getSelectedCategoryFromModal(modalElement) {
    const radio = modalElement.querySelector('.category-modal-radio:checked');
    if (!radio) {
        return null;
    }

    return {
        rootId: Number(radio.dataset.rootId),
        depth1: radio.dataset.depth1Id,
        depth2: radio.dataset.depth2Id,
        depth3: normalizeCategoryValue(radio.dataset.depth3Id)
    };
}

function setCategoryBoxButtonState(box, isAddButton) {
    const actionButton = box.querySelector('.str-btn');
    if (!actionButton) {
        return;
    }

    actionButton.classList.remove('btn-primary', 'btn-danger', 'category-add-btn', 'category-minus-btn');

    if (isAddButton) {
        actionButton.classList.add('btn-primary', 'category-add-btn');
        actionButton.textContent = '+';
        return;
    }

    actionButton.classList.add('btn-danger', 'category-minus-btn');
    actionButton.textContent = '-';
}

async function populateCategoryBox(box, category) {
    const depth1 = box.querySelector('.depth1');
    const depth2 = box.querySelector('.depth2');
    const depth3 = box.querySelector('.depth3');

    if (!depth1 || !depth2 || !depth3) {
        return;
    }

    delete depth1.dataset.loaded;
    delete depth2.dataset.loaded;
    delete depth3.dataset.loaded;

    await loadCategories(box.dataset.rootId, depth1, category.depth1);

    if (!category.depth1) {
        depth2.innerHTML = '<option selected="" value="default">2ⁿᵈ depth</option>';
        depth3.innerHTML = '<option selected="" value="default">3ʳᵈ depth</option>';
        return;
    }

    await loadCategories(category.depth1, depth2, category.depth2);

    if (!category.depth2) {
        depth3.innerHTML = '<option selected="" value="default">3ʳᵈ depth</option>';
        return;
    }

    const depth3Count = await loadCategories(category.depth2, depth3, category.depth3);

    if (depth3Count === 0) {
        depth3.innerHTML = '<option selected disabled value="-">-</option>';
        depth1.dataset.loaded = '1';
        depth2.dataset.loaded = '1';
        depth3.dataset.loaded = '1';
        return;
    }

    if (!category.depth3) {
        const emptyOption = document.createElement('option');
        emptyOption.value = '-';
        emptyOption.textContent = '-';
        depth3.insertBefore(emptyOption, depth3.firstElementChild?.nextSibling || null);
        depth3.value = '-';
    }

    depth1.dataset.loaded = '1';
    depth2.dataset.loaded = '1';
    depth3.dataset.loaded = '1';
}

function resetCategoryBox(box) {
    const depth1 = box.querySelector('.depth1');
    const depth2 = box.querySelector('.depth2');
    const depth3 = box.querySelector('.depth3');

    if (!depth1 || !depth2 || !depth3) {
        return;
    }

    delete depth1.dataset.loaded;
    delete depth2.dataset.loaded;
    delete depth3.dataset.loaded;

    depth1.innerHTML = '<option selected="" value="default">1ˢᵗ depth</option>';
    depth2.innerHTML = '<option selected="" value="default">2ⁿᵈ depth</option>';
    depth3.innerHTML = '<option selected="" value="default">3ʳᵈ depth</option>';
}

async function applyModalCategoryToBox(box, category) {
    if (!box || !category) {
        return;
    }

    resetCategoryBox(box);
    await populateCategoryBox(box, category);
    updateBylinePreview();
}

export function initCategoryModal() {
    const openButtons = document.querySelectorAll('.open-category-modal-btn');
    const modalElement = document.getElementById('category-modal');
    const loadingElement = document.getElementById('category-modal-loading');
    const bodyElement = document.getElementById('category-modal-body');
    const applyButton = document.getElementById('btn-select-category');
    let activeBox = null;

    if (openButtons.length === 0 || !modalElement || !loadingElement || !bodyElement || !applyButton) {
        return;
    }

    if (modalElement.dataset.categoryModalBound === '1') {
        return;
    }

    modalElement.dataset.categoryModalBound = '1';

    document.addEventListener('click', async (event) => {
        const openButton = event.target.closest('.open-category-modal-btn');
        if (!openButton) {
            return;
        }

        event.preventDefault();
        activeBox = openButton.closest('.category-selector-box');
        if (!activeBox) {
            return;
        }

        if (modalElement.dataset.loading === '1') {
            return;
        }

        modalElement.dataset.loading = '1';
        loadingElement.classList.remove('d-none');
        bodyElement.classList.add('d-none');
        bodyElement.innerHTML = '';
        applyButton.disabled = true;

        try {
            const targetRootId = Number(activeBox.dataset.rootId);
            const tree = (await loadCategoryModalTree()).filter(root => root.rootId === targetRootId);
            renderCategoryModalTree(tree);
            syncCategoryModalSelectionFromBox(modalElement, activeBox);
            loadingElement.classList.add('d-none');
            bodyElement.classList.remove('d-none');
            window.bootstrap?.Modal?.getOrCreateInstance(modalElement)?.show();
        } catch (error) {
            console.error('failed to load category modal tree', error);
            loadingElement.classList.add('d-none');
            bodyElement.innerHTML = '<div class="text-danger">카테고리 정보를 불러오지 못했습니다.</div>';
            bodyElement.classList.remove('d-none');
            window.bootstrap?.Modal?.getOrCreateInstance(modalElement)?.show();
        } finally {
            modalElement.dataset.loading = '0';
            applyButton.disabled = false;
        }
    });

    applyButton.addEventListener('click', async () => {
        applyButton.disabled = true;

        try {
            const category = getSelectedCategoryFromModal(modalElement);
            if (activeBox && category) {
                await applyModalCategoryToBox(activeBox, category);
            }
            window.bootstrap?.Modal?.getInstance(modalElement)?.hide();
        } finally {
            applyButton.disabled = false;
        }
    });
}


export function bindReporterAutocomplete() {
    const inputElem = document.getElementById('reporterSearchInput');
    let lastResults = [];
    let selectedIndex = -1;
    if (!inputElem) {
        console.warn('기자 검색 input을 찾을 수 없습니다.');
        return;
    }

    // 드롭다운 컨테이너 생성
    const resultContainer = document.createElement('div');
    resultContainer.style.position = 'fixed';
    resultContainer.style.zIndex = '1000';
    resultContainer.style.background = '#fff';
    resultContainer.style.border = '1px solid #ccc';
    resultContainer.style.maxHeight = '200px';
    resultContainer.style.overflowY = 'auto';
    resultContainer.style.display = 'none';
    resultContainer.className = 'autocomplete-result';
    document.body.appendChild(resultContainer);
    const dismissResultContainer = bindAutocompleteOverlayDismiss(resultContainer, clearSelection);

    async function fetchAndRender(keyword) {
        if (!keyword) {
            dismissResultContainer();
            lastResults = [];
            selectedIndex = -1;
            return;
        }

        try {
            const res = await fetch(`/api/editor/users?name=${encodeURIComponent(keyword)}`);
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            const result = await res.json();
            const data = result.data || [];
            lastResults = data;
            selectedIndex = -1;

            positionAutocompleteContainer(inputElem, resultContainer);

            resultContainer.innerHTML = '';
            if (data.length === 0) {
                const item = document.createElement('div');
                item.textContent = '검색 결과 없음';
                item.style.padding = '5px';
                resultContainer.appendChild(item);
            } else {
                data.forEach((item, index) => {
                    const div = document.createElement('div');
                    div.textContent = `${item.name}`;
                    div.dataset.index = index;
                    div.style.padding = '5px';
                    div.style.cursor = 'pointer';

                    div.addEventListener('mouseenter', () => {
                        updateSelection(index);
                    });
                    div.addEventListener('mouseleave', () => {
                        clearSelection();
                    });

                    // ✅ click -> mousedown으로 변경
                    div.addEventListener('mousedown', () => {
                        selectResult(index);
                    });

                    resultContainer.appendChild(div);
                });
            }

            resultContainer.style.display = 'block';
        } catch (err) {
            console.error('기자 검색 실패:', err);
            dismissResultContainer();
            lastResults = [];
            selectedIndex = -1;
        }
    }

    function updateSelection(index) {
        selectedIndex = index;
        Array.from(resultContainer.children).forEach((el, idx) => {
            el.style.background = (idx === index) ? '#f0f0f0' : '#fff';
        });

        const selectedEl = resultContainer.children[index];
        if (selectedEl && typeof selectedEl.scrollIntoView === 'function') {
            selectedEl.scrollIntoView({ block: 'nearest' });
        }
    }

    function clearSelection() {
        selectedIndex = -1;
        Array.from(resultContainer.children).forEach((el) => {
            el.style.background = '#fff';
        });
    }

    function selectResult(index) {
        const selectedItem = lastResults[index];
        if (!selectedItem) return;

        debouncedFetch.cancel();
        inputElem.dataset.manualSelection = '1';
        inputElem.value = selectedItem.name;
        inputElem.dataset.selectedId = selectedItem.id;
        inputElem.dataset.selectedByline = selectedItem.byline || '';
        dismissResultContainer();
        clearSelection();
        void setupReporterByline();
    }

    const debouncedFetch = debounce(fetchAndRender, 300);

    inputElem.addEventListener('input', () => {
        if (inputElem.dataset.manualSelection === '1') {
            delete inputElem.dataset.manualSelection;
            return;
        }
        const keyword = inputElem.value.trim();
        inputElem.dataset.selectedId = '';
        inputElem.dataset.selectedByline = '';
        debouncedFetch(keyword);
    });

    inputElem.addEventListener('focus', () => {
        const keyword = inputElem.value.trim();
        if (keyword) {
            debouncedFetch(keyword);
        }
    });

    inputElem.addEventListener('blur', () => {
        dismissResultContainer();
        debouncedFetch.cancel();
        clearSelection();
    });

    inputElem.addEventListener('keydown', (e) => {
        const total = lastResults.length;
        if (resultContainer.style.display === 'none' || total === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            debouncedFetch.cancel();
            selectedIndex = selectedIndex < 0 ? 0 : Math.min(selectedIndex + 1, total - 1);
            updateSelection(selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            debouncedFetch.cancel();
            selectedIndex = selectedIndex <= 0 ? 0 : selectedIndex - 1;
            updateSelection(selectedIndex);
        } else if (e.key === 'Enter') {
            if (selectedIndex >= 0 && selectedIndex < total) {
                e.preventDefault();
                selectResult(selectedIndex);
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!resultContainer.contains(e.target) && e.target !== inputElem) {
            dismissResultContainer();
        }
    });
}

/**
 * 바이라인 기자 등장 영역 제어
 */
export function toggleBylineLiveAlertPlaceholder({ useNewsroom, useAnonymous } = {}) {
    const alertBox = document.getElementById('liveAlertPlaceholder');
    const bylinePreview = document.getElementById('byline-preview');

    const customBylineCheck = document.getElementById('custom-byline-check');
    const alertBtn = document.getElementById('AlertBtn');
    const reporterSearchInput = document.getElementById('reporterSearchInput');

    // 기본값: DOM에서 가져오고, 인자 있으면 인자 우선
    const _useNewsroom = useNewsroom ?? document.getElementById('byline-newsroom').checked;
    const _useAnonymous = useAnonymous ?? document.getElementById('byline-anonymous').checked;

    if (_useNewsroom) {
        // 편집국 바이라인 사용 여부 동작
        alertBox.classList.add('d-none'); // 숨기기
        alertBox.classList.remove('d-flex');   // 기존 flex 제거
        bylinePreview.value = '딜사이트 편집국';
        bylinePreview.disabled = true;
        customBylineCheck.checked = true;
        customBylineCheck.disabled = true;
        reporterSearchInput.disabled = true;
        if (alertBtn) {
            alertBtn.classList.add('disabled');          // Bootstrap 스타일
            alertBtn.style.pointerEvents = 'none';       // 클릭 자체 막기
        }
    } else if (_useAnonymous) {
        // 기타 바이라인 사용 여부 동작
        alertBox.classList.add('d-none');
        alertBox.classList.remove('d-flex');   // 기존 flex 제거 (선택 사항)
        bylinePreview.disabled = false;
        customBylineCheck.checked = true;
        customBylineCheck.disabled = true;
        reporterSearchInput.disabled = true;
        if (alertBtn) {
            alertBtn.classList.add('disabled');          // Bootstrap 스타일
            alertBtn.style.pointerEvents = 'none';       // 클릭 자체 막기
        }
        customBylineCheckEvent()
    } else {
        alertBox.classList.remove('d-none');   // 보임
        alertBox.classList.add('d-flex');      // 다시 flex 적용
        bylinePreview.disabled = true;
        customBylineCheck.checked = false;
        customBylineCheck.disabled = false;
        reporterSearchInput.disabled = false;
        if (alertBtn) {
            alertBtn.classList.remove('disabled');
            alertBtn.style.pointerEvents = '';
        }
        updateBylinePreview();
    }
}

export function customBylineCheckEvent({useCustomBylineCheck} = {}) {
    const _useCustomBylineCheck = useCustomBylineCheck ?? document.getElementById('custom-byline-check').checked;
    const bylinePreview = document.getElementById('byline-preview');

    if (_useCustomBylineCheck) {
        bylinePreview.classList.add('highlight-input');
        bylinePreview.disabled = false;
    } else {
        // 선택 해제
        bylinePreview.classList.remove('highlight-input');
        bylinePreview.disabled = true;
        updateBylinePreview();
    }
}

export function removeBylineAlert(buttonEl) {
    const alertBox = document.getElementById('liveAlertPlaceholder');
    const alertItems = alertBox.querySelectorAll('.alert');

    if (alertItems.length <= 1) {
        alert('최소 1명 이상 지정해야 합니다.\n모두 삭제하고 싶다면 "기타 바이라인 사용"을 체크 한 뒤 사용해주세요.');
        return;
    }

    const alertItem = buttonEl.closest('.alert');
    alertItem.remove();

    updateBylinePreview();
}


/**
 * 기자 검색 input에서 선택된 기자를 byline에 추가하고 input을 초기화합니다.
 */
export async function setupReporterByline() {
    const reporterInput = document.getElementById('reporterSearchInput');
    const alertContainer = document.getElementById('liveAlertPlaceholder');

    if (!reporterInput || !alertContainer) {
        console.warn('필수 요소가 없습니다.');
        return;
    }

    const userName = reporterInput.value;
    const userId = reporterInput.dataset.selectedId;
    const userByline = reporterInput.dataset.selectedByline || '';

    if (!userId) {
        alert('검색 결과에 없는 기자는 추가할 수 없습니다. 목록에서 기자를 선택해 주세요.');
        return;
    }

    try {
        await addBylineUserBlock(userId, userName, alertContainer, userByline);

        // input 초기화
        reporterInput.value = '';
        reporterInput.dataset.selectedId = '';
        reporterInput.dataset.selectedByline = '';
    } catch (err) {
        console.error('기자 추가 처리 중 오류:', err);
        alert('기자 정보를 추가하는데 실패했습니다.');
    }
}


function validateArticleForm() {
    // 제목 검증
    const title = document.getElementById('article_title').value;
    if (title.length === 0) {
        alert('제목을 입력해주세요.');
        return false;
    }

    // 엠바고 검증
    const now = new Date();

    const releaseAt = document.getElementById('releaseAt')?.value;
    const memberReleaseAt = document.getElementById('memberReleaseAt')?.value;
    const plusReleaseAt = document.getElementById('plusReleaseAt')?.value;

    const dPlusEmbChecked = document.getElementById('d-plus-embargo-check')?.checked;
    const dEmbChecked = document.getElementById('d-embargo-check')?.checked;

    const dPlusDate = document.querySelector('input[name="d-plus-embargo-date"]')?.value;
    const dPlusHour = document.getElementById('d-plus-embargo-hour')?.value;
    const dPlusMinute = document.getElementById('d-plus-embargo-minute')?.value;

    const dDate = document.querySelector('input[name="d-embargo-date"]')?.value;
    const dHour = document.getElementById('d-embargo-hour')?.value;
    const dMinute = document.getElementById('d-embargo-minute')?.value;

    let dPlusDateTime = null;
    let dDateTime = null;

    const hasDReleaseAt = releaseAt != null && releaseAt !== '';
    const hasMemberReleaseAt = memberReleaseAt != null && memberReleaseAt !== '';
    const hasPlusReleaseAt = plusReleaseAt != null && plusReleaseAt !== '';

    if ((hasDReleaseAt || hasMemberReleaseAt) && !hasPlusReleaseAt && dPlusEmbChecked) {
        alert('D에 이미 출고되고 D+에 출고되지 않은 기사는 D+ 예약출고를 설정할 수 없습니다.');
        return false;
    }

    const hasDPlusTimeOnly = (plusReleaseAt === '' && dPlusEmbChecked && !dPlusDate && (dPlusHour || dPlusMinute));
    if (hasDPlusTimeOnly) {
        alert('D+ 엠바고 날짜를 입력해주세요.');
        return false;
    }

    const hasDTimeOnly = (releaseAt === '' && memberReleaseAt === '' && dEmbChecked && !dDate && (dHour || dMinute));
    if (hasDTimeOnly) {
        alert('D 엠바고 날짜를 입력해주세요.');
        return false;
    }

    // D+ 날짜 구성
    if (plusReleaseAt==='' && dPlusEmbChecked) {
        if (dPlusDate && (!dPlusHour || !dPlusMinute)) {
            alert('D+ 엠바고 시간을 선택해주세요.');
            return false;
        }
        if (!dPlusDate || !dPlusHour || !dPlusMinute) {
            alert('D+ 엠바고가 체크되어 있으나 날짜 또는 시간이 입력되지 않았습니다.');
            return false;
        }

        dPlusDateTime = new Date(`${dPlusDate}T${dPlusHour.padStart(2, '0')}:${dPlusMinute.padStart(2, '0')}:00`);
        if (dPlusDateTime < now) {
            alert('D+ 엠바고 시간이 현재 시간보다 이전입니다.');
            return false;
        }
    }

    // D 날짜 구성
    if (releaseAt==='' && memberReleaseAt==='' && dEmbChecked) {
        if (dDate && (!dHour || !dMinute)) {
            alert('D 엠바고 시간을 선택해주세요.');
            return false;
        }
        if (!dDate || !dHour || !dMinute) {
            alert('D 엠바고가 체크되어 있으나 날짜 또는 시간이 입력되지 않았습니다.');
            return false;
        }

        dDateTime = new Date(`${dDate}T${dHour.padStart(2, '0')}:${dMinute.padStart(2, '0')}:00`);
        if (dDateTime < now) {
            alert('D 엠바고 시간이 현재 시간보다 이전입니다.');
            return false;
        }
    }

    // D+ > D 순서 체크
    if (dPlusEmbChecked && dEmbChecked && dPlusDateTime && dDateTime) {
        if (dPlusDateTime > dDateTime) {
            alert('D+ 엠바고 시간이 D 엠바고 시간보다 나중일 수 없습니다.');
            return false;
        }
    }

    // 바이라인 검증
    const byline = document.getElementById('byline-preview').value;
    if (byline.length === 0) {
        alert('바이라인을 입력해주세요.');
        return false;
    }

    // 출처 검증
    const sourceTypes = Array.from(document.querySelectorAll('input[name="sourceTypes"]:checked'))
        .map(el => el.value);
    if (sourceTypes.length === 0) {
        alert('출처 관리를 1개 이상 선택해주세요.');
        return false;
    }

    // 분류 검증
    const boxes = Array.from(document.querySelectorAll('.category-selector-box'));

    let hasPartialEmpty = false;
    let hasAnySelected = false;

    boxes.forEach(box => {
        const getValue = (selector) => box.querySelector(selector).value;
        const depth1 = getValue('.depth1');
        const depth2 = getValue('.depth2');
        const depth3 = getValue('.depth3');

        const isDepth1Default = depth1 === 'default';
        const isDepth2Default = depth2 === 'default';
        const isDepth3Default = depth3 === 'default';

        if (!(isDepth1Default && isDepth2Default && isDepth3Default)) {
            hasAnySelected = true;
        }

        if (
            (isDepth1Default || isDepth2Default || isDepth3Default) &&
            !(isDepth1Default && isDepth2Default && isDepth3Default)
        ) {
            hasPartialEmpty = true;
        }
    });

    // D+ 또는 D 엠바고 설정 시, 해당 카테고리가 선택되어야 함
    const allBoxes = Array.from(document.querySelectorAll('.category-selector-box'));
    const isCategoryBoxSelected = (box) => {
        return normalizeCategoryValue(box.querySelector('.depth1')?.value) != null &&
            normalizeCategoryValue(box.querySelector('.depth2')?.value) != null &&
            box.querySelector('.depth3')?.value !== 'default';
    };

    const isPlusCategorySelected = allBoxes.some((box) => {
        return box.dataset.siteType === 'plus' && isCategoryBoxSelected(box);
    });

    const isDealCategorySelected = allBoxes.some((box) => {
        return box.dataset.siteType === 'dealsite' && isCategoryBoxSelected(box);
    });

    if (dPlusEmbChecked && !isPlusCategorySelected) {
        alert('D+ 엠바고가 설정된 경우, Dealsite Plus 분류를 1개 이상 선택해야 합니다.');
        return false;
    }

    if (dEmbChecked && !isDealCategorySelected) {
        alert('D 엠바고가 설정된 경우, Dealsite 분류를 1개 이상 선택해야 합니다.');
        return false;
    }

    if (!hasAnySelected) {
        alert('분류를 1개 이상 선택해주세요.');
        return false;
    }

    if (hasPartialEmpty) {
        alert('선택하지 않은 분류 단계가 있습니다. 모두 선택해주세요.');
        return false;
    }

    // 전송옵션 검증
    const mode = document.getElementById('mode').value;
    if (hasDeskingAuthority() && mode === 'edit') {
        const extDFlagCheck = document.getElementById('ext-d-flag').checked;
        const extDPlusFlagCheck = document.getElementById('ext-d-plus-flag').checked;
        const extPortalFlagCheck = document.getElementById('ext-portal-flag').checked;
        const extHtsFlagCheck = document.getElementById('ext-hts-flag').checked;

        if (dEmbChecked && !extDFlagCheck && !extHtsFlagCheck && releaseAt==="") {
            // 출고되지 않은 상태일때만 검증
            alert('D 엠바고를 설정한 경우 전송 옵션에서 D 또는 HTS를 선택해야 합니다.');
            return false;
        }

        if (dPlusEmbChecked && !extDPlusFlagCheck && plusReleaseAt==="") {
            // 출고되지 않은 상태일때만 검증
            alert('D+ 엠바고를 설정한 경우 전송 옵션에서 D+를 선택해야 합니다.');
            return false;
        }

        if (extPortalFlagCheck && !extDFlagCheck) {
            alert("전송옵션 '포탈'을 선택한 경우 'D'를 같이 선택해야 합니다.");
            return false;
        }

        if (extHtsFlagCheck && !extDFlagCheck && extDPlusFlagCheck) {
            alert("'D+'만 선택한 상태에서는 'HTS'를 함께 선택할 수 없습니다. 'D'를 추가로 선택해 주세요.");
            return false;
        }

        if (!extDPlusFlagCheck && !extDFlagCheck && !extHtsFlagCheck) {
            alert('전송 옵션에서 D 또는 D+ 또는 HTS 중 1개 이상 선택해야 합니다.');
            return false;
        }

        if (extDFlagCheck && !isDealCategorySelected) {
            alert('전송옵션 D가 선택된 경우, Dealsite 분류를 1개 이상 선택해야 합니다.');
            return false;
        }

        if (extDPlusFlagCheck && !isPlusCategorySelected) {
            alert('전송옵션 D+가 선택된 경우, Dealsite Plus 분류를 1개 이상 선택해야 합니다.');
            return false;
        }
    }
    return true;
}

function getSaveArticleDto(rampadState) {
    // 속성
    const attributeType = document.querySelector('input[name="attributeType"]:checked')?.value || null;

    // 엠바고
    const dPlusChecked = document.getElementById('d-plus-embargo-check')?.checked;
    const dChecked = document.getElementById('d-embargo-check')?.checked;

    const dPlusDate = document.querySelector('input[name="d-plus-embargo-date"]')?.value;
    const dPlusHour = document.getElementById('d-plus-embargo-hour')?.value;
    const dPlusMinute = document.getElementById('d-plus-embargo-minute')?.value;

    const dDate = document.querySelector('input[name="d-embargo-date"]')?.value;
    const dHour = document.getElementById('d-embargo-hour')?.value;
    const dMinute = document.getElementById('d-embargo-minute')?.value;

    let plusReleaseScheduleTime = null;
    let releaseScheduleTime = null;

    if (dPlusChecked && dPlusDate && dPlusHour && dPlusMinute) {
        plusReleaseScheduleTime = `${dPlusDate}T${dPlusHour.padStart(2, '0')}:${dPlusMinute.padStart(2, '0')}:00`;
    }
    if (dChecked && dDate && dHour && dMinute) {
        releaseScheduleTime = `${dDate}T${dHour.padStart(2, '0')}:${dMinute.padStart(2, '0')}:00`;
    }

    // 바이라인
    const isCustomByline = document.getElementById('custom-byline-check').checked;
    const bylinePreview = document.getElementById('byline-preview').value;

    const bylineUsers = Array.from(document.querySelectorAll('.byline-box2 input[name="userId"]')).map(input => ({
        userId: input.value
    }));

    const userNewsroomByline = document.getElementById('byline-newsroom').checked;
    const useAnonymousByline = document.getElementById('byline-anonymous').checked;
    // 편집국, 기타 바이라인 사용하는 경우 article_users에 유저 정보 저장 안함
    const reporters = (userNewsroomByline || useAnonymousByline) ? null : bylineUsers;

    // 분류
    const categories = getCategorySelections(false).map(category => ({
        rootId: category.rootId == null ? null : String(category.rootId),
        depth1: category.depth1,
        depth2: category.depth2,
        depth3: category.depth3
    }));

    // 내용
    const content = window.mainEditor?.getData() || '';

    // 출처관리
    const sourceTypes = Array.from(document.querySelectorAll('input[name="sourceTypes"]:checked'))
        .map(el => el.value);

    // 자동 해시태그
    const tagItems = document.querySelectorAll("#hashtag-auto .hashtag-item");
    const autoHashtag = Array.from(tagItems)
        .map((el) => el.textContent.trim()) // 버튼 안 글자까지 포함될 수 있음
        .map((txt) => txt.replace(/\s*×$/, "").trim()) // 필요하다면 'X' 버튼 글자 제거
        .filter(Boolean)
        .join(",");

    // 직접입력 해시태그
    const manualHashtag = document.getElementById('hashtag-manual').value;

    // 워터마크
    const hasWatermark = document.getElementById('has-watermark').checked;

    // 선택된 관련기사
    const relatedArticleIds = Array.from(
        document.querySelectorAll(".related-article-result .list-group li[data-id]")
    )
        .map(li => li.dataset.id?.trim())
        .filter(Boolean)
        .map(Number);

    // 선택된 관련종목
    const relatedKrxIds = Array.from(
        document.querySelectorAll(".related-krx-result .list-group li[data-id]")
    )
        .map(li => li.dataset.id?.trim())
        .filter(Boolean)
        .map(Number);

    const clipIds = collectArticleClipIds();

    return {
        rampadId: rampadState==null ? null : rampadState.rampadId,
        seriesId: document.getElementById('article_series_id').value,
        seriesTitle: document.getElementById('article_series').value,
        serialId: document.getElementById('article_serial_id').value,
        serialTitle: document.getElementById('article_serial').value,
        coverId: document.getElementById('coverId').value,
        photoSeqId: document.getElementById('photoSeqId').value,
        title: document.getElementById('article_title').value,
        subTitle: document.getElementById('article_sub_title').value,
        content: content,
        titleColor: document.getElementById('selected-color-value').value,
        hashtags: manualHashtag,
        autoHashtags: autoHashtag,
        byline: bylinePreview,
        isCustomByline: isCustomByline,
        sourceTypes: sourceTypes,
        attributeType: attributeType,
        categories: categories,
        reporters: reporters,
        relatedArticleIds: relatedArticleIds,
        relatedKrxIds: relatedKrxIds,
        clipIds: clipIds,
        plusReleaseScheduleTime: plusReleaseScheduleTime,
        releaseScheduleTime: releaseScheduleTime,
        isMySpace: false,
        hasWatermark:hasWatermark
    };
}

function getSaveMySpaceDto(rampadState = null) {
    return {
        ...getSaveArticleDto(rampadState),
        isMySpace: true,
        state: 'MY_SPACE'
    };
}

export async function saveArticle(rampadState) {
    // 데이터 검증
    if (!validateArticleForm()) return;

    const dto = getSaveArticleDto(rampadState);
    // console.log('save dto: ', dto);

    try {
        const url = '/api/articles';
        const response = await postWithCsrf(url, dto);

        if (response.ok) {
            await response.json();
            // 저장 성공 후 이동
            window.removeEventListener('beforeunload', handleBeforeUnload); // 화면 이탈 경고 제거
            window.location.href = '/article/my';
        } else {
            const error = await response.text();
            alert('저장 실패: ' + error);
        }
    } catch (err) {
        console.error(err);
        alert('에러 발생: ' + err.message);
    }
}

export async function saveMySpace(rampadState) {
    // 내용
    const content = window.mainEditor?.getData() || '';
    const dto = {
        rampadId: rampadState.rampadId,
        seriesId: document.getElementById('article_series_id').value,
        seriesTitle: document.getElementById('article_series').value,
        serialId: document.getElementById('article_serial_id').value,
        serialTitle: document.getElementById('article_serial').value,
        title: document.getElementById('article_title').value,
        subTitle: document.getElementById('article_sub_title').value,
        content: content,
        isMySpace: true
    };
    Object.assign(dto, getSaveMySpaceDto(rampadState));

    try {
        const url = '/api/articles';
        const response = await postWithCsrf(url, dto);

        if (response.ok) {
            await response.json();
            window.removeEventListener('beforeunload', handleBeforeUnload); // 화면 이탈 경고 제거
            window.location.href = '/article/myspace';
        } else {
            const error = await response.text();
            alert('저장 실패: ' + error);
        }
    } catch (err) {
        console.error(err);
        alert('에러 발생: ' + err.message);
    }
}

/**
 * 자동저장
 */
export function startAutoSaveInterval(tabKey, rampadState) {
    const AUTO_SAVE_INTERVAL_MS = getEditorAutoSaveIntervalMs();

    let lastTitle = null;
    let lastSubtitle = null;
    let lastContent = null;

    setInterval(async () => {
        const title = document.getElementById('article_title').value.trim();
        const subtitle = document.getElementById('article_sub_title').value.trim();
        // CKEditor5의 getData()를 통해 콘텐츠 추출
        const content = window.mainEditor?.getData() || '';

        // 빈 값 스킵
        if (content === '<p>&nbsp;</p>' || title === '') {
            // console.log('자동저장 스킵: 내용 없음');
            return;
        }

        // 제목, 부제목, 내용 모두 동일하면 스킵
        if (title === lastTitle && subtitle === lastSubtitle && content === lastContent) {
            // console.log('자동저장 스킵: 변경사항 없음');
            return;
        }

        const payload = {
            rampadId: rampadState.rampadId,
            ramkey: tabKey,
            title: title,
            subtitle: subtitle,
            content: content
        };
        // console.log(payload);

        const apiUrl = '/api/editor/autosave';
        try {
            const response = await postWithCsrf(apiUrl, payload);

            if (!response.ok) {
                console.error(
                    '자동저장 실패:',
                    response.status,
                    response.statusText
                );
                return;
            }

            const result = await response.json();

            // API가 반환하는 rampadId를 업데이트
            rampadState.rampadId = result.data;

            console.log(
                '자동저장 완료:',
                `(${new Date().toLocaleTimeString()})`
            );

            // 저장 성공 시 현재 값들을 기억
            lastTitle = title;
            lastSubtitle = subtitle;
            lastContent = content;
            showArticleTempAutoSaveNotice(`자동저장 (저장시간: ${formatCurrentTimeForTempNotice()})`);

        } catch (error) {
            console.error(
                '자동저장 예외 발생:',
                error,
                `(${new Date().toLocaleTimeString()})`
            );
        }
    }, AUTO_SAVE_INTERVAL_MS);
}

function normalizeNullableNumber(value) {
    if (value == null) {
        return null;
    }

    const trimmed = String(value).trim();
    if (trimmed === '') {
        return null;
    }

    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
}

function buildArticleTempDto() {
    return {
        title: document.getElementById('article_title')?.value ?? '',
        subTitle: document.getElementById('article_sub_title')?.value ?? '',
        content: window.mainEditor?.getData() || ''
    };
}

let articleTempNoticeTimeoutId = null;

function showArticleTempAutoSaveNotice(message) {
    const noticeEl = document.getElementById('article-temp-save-notice');
    if (!noticeEl) {
        return;
    }

    const noticeTextEl = noticeEl.querySelector('.editor-temp-save-notice-text');
    if (!noticeTextEl) {
        return;
    }

    if (articleTempNoticeTimeoutId) {
        window.clearTimeout(articleTempNoticeTimeoutId);
    }

    noticeTextEl.textContent = message;
    noticeEl.classList.remove('is-visible');

    window.requestAnimationFrame(() => {
        noticeEl.classList.add('is-visible');
    });

    articleTempNoticeTimeoutId = window.setTimeout(() => {
        noticeEl.classList.remove('is-visible');
    }, 2200);
}

function formatArticleTempUpdatedAt(updatedAt) {
    if (!updatedAt) {
        return '';
    }

    return String(updatedAt)
        .replace('T', ' ')
        .replace(/\.\d+$/, '')
        .slice(0, 19);
}

function formatCurrentTimeForTempNotice() {
    return new Date().toLocaleTimeString('ko-KR', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

async function previewArticleTemp(tempData) {
    const modalEl = document.getElementById('view-modal');
    if (!modalEl) {
        throw new Error('기사 미리보기 모달을 찾을 수 없습니다.');
    }

    const articleId = tempData?.articleId || document.getElementById('articleId')?.value;
    if (!articleId) {
        throw new Error('기사 ID가 없어 자동저장 미리보기를 불러올 수 없습니다.');
    }

    const response = await fetch(`/api/articles/${articleId}/temp/preview`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.message || '자동저장 미리보기를 불러오지 못했습니다.');
    }

    const data = result?.data || {};
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    const articlePack = modalEl.querySelector('.article-pack');
    const titleEl = modalEl.querySelector('.title');
    const bylineEl = modalEl.querySelector('.byline');
    const subTitleEl = modalEl.querySelector('.sub-title');
    const part1El = modalEl.querySelector('.content-part1');
    const part2El = modalEl.querySelector('.content-part2');
    const part3El = modalEl.querySelector('.content-part3');
    const mainContentsEl = modalEl.querySelector('.read-news-main-contents');
    const relativeNewsEl = modalEl.querySelector('.rnmc-relative-news');
    const part3AreaEl = part3El?.closest('.content-area');
    const previewClipWrapEl = modalEl.querySelector('.preview-clip-wrap');
    const previewClipListEl = modalEl.querySelector('.preview-clip-list');
    const relativeStockWrapEl = modalEl.querySelector('.relative-stock-wrap');
    const mobileKeywordWrapEl = modalEl.querySelector('.rec-keywords-wrap2');
    const viewOnSiteButton = modalEl.querySelector('#btnAllowViewOnSite');
    const printButton = modalEl.querySelector('#printButton');

    if (articlePack) {
        articlePack.innerHTML = '';
        articlePack.style.display = 'none';
    }

    if (titleEl) {
        titleEl.textContent = data.title || '';
    }

    if (bylineEl) {
        bylineEl.innerHTML = '';
        bylineEl.style.display = 'none';
    }

    if (subTitleEl) {
        if (data.subTitle) {
            subTitleEl.textContent = data.subTitle;
            subTitleEl.style.whiteSpace = 'pre-line';
            subTitleEl.style.display = '';
        } else {
            subTitleEl.textContent = '';
            subTitleEl.style.display = 'none';
        }
    }

    if (part1El) {
        part1El.innerHTML = Array.isArray(data.contentList) ? data.contentList.join('<p><br></p>') : '';
    }

    if (part2El) {
        part2El.innerHTML = '';
    }

    if (part3El) {
        part3El.innerHTML = '';
    }

    if (mainContentsEl) {
        mainContentsEl.style.display = 'none';
    }

    if (relativeNewsEl) {
        relativeNewsEl.style.display = 'none';
    }

    if (part3AreaEl) {
        part3AreaEl.style.display = 'none';
    }

    if (previewClipWrapEl) {
        previewClipWrapEl.classList.add('d-none');
    }

    if (previewClipListEl) {
        previewClipListEl.innerHTML = '';
    }

    if (relativeStockWrapEl) {
        relativeStockWrapEl.innerHTML = '';
    }

    if (mobileKeywordWrapEl) {
        mobileKeywordWrapEl.innerHTML = '';
        mobileKeywordWrapEl.style.display = 'none';
    }

    if (viewOnSiteButton) {
        viewOnSiteButton.classList.add('d-none');
    }

    if (printButton) {
        printButton.style.visibility = 'hidden';
        printButton.disabled = true;
    }

    modalEl.dataset.hasWatermark = 'false';
    applyInlineStylesToPreview(modalEl);
    initPreviewViewSizeToggle();
    modal.show();

    return modalEl;
}

async function previewCurrentArticle(articleId) {
    const modalEl = document.getElementById('view-modal');
    if (!modalEl) {
        throw new Error('기사 미리보기 모달을 찾을 수 없습니다.');
    }

    if (!articleId) {
        throw new Error('기사 ID가 없어 현재 저장본 미리보기를 불러올 수 없습니다.');
    }

    const response = await fetch(`/api/articles/${articleId}/basic-preview`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.message || '현재 저장본 미리보기를 불러오지 못했습니다.');
    }

    const data = result?.data || {};
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    const articlePack = modalEl.querySelector('.article-pack');
    const titleEl = modalEl.querySelector('.title');
    const bylineEl = modalEl.querySelector('.byline');
    const subTitleEl = modalEl.querySelector('.sub-title');
    const part1El = modalEl.querySelector('.content-part1');
    const part2El = modalEl.querySelector('.content-part2');
    const part3El = modalEl.querySelector('.content-part3');
    const mainContentsEl = modalEl.querySelector('.read-news-main-contents');
    const relativeNewsEl = modalEl.querySelector('.rnmc-relative-news');
    const part3AreaEl = part3El?.closest('.content-area');
    const previewClipWrapEl = modalEl.querySelector('.preview-clip-wrap');
    const previewClipListEl = modalEl.querySelector('.preview-clip-list');
    const relativeStockWrapEl = modalEl.querySelector('.relative-stock-wrap');
    const mobileKeywordWrapEl = modalEl.querySelector('.rec-keywords-wrap2');
    const viewOnSiteButton = modalEl.querySelector('#btnAllowViewOnSite');
    const printButton = modalEl.querySelector('#printButton');

    if (articlePack) {
        articlePack.innerHTML = '';
        articlePack.style.display = 'none';
    }

    if (titleEl) {
        titleEl.textContent = data.title || '';
    }

    if (bylineEl) {
        bylineEl.innerHTML = '';
        bylineEl.style.display = 'none';
    }

    if (subTitleEl) {
        if (data.subTitle) {
            subTitleEl.textContent = data.subTitle;
            subTitleEl.style.whiteSpace = 'pre-line';
            subTitleEl.style.display = '';
        } else {
            subTitleEl.textContent = '';
            subTitleEl.style.display = 'none';
        }
    }

    if (part1El) {
        part1El.innerHTML = Array.isArray(data.contentList) ? data.contentList.join('<p><br></p>') : '';
    }

    if (part2El) {
        part2El.innerHTML = '';
    }

    if (part3El) {
        part3El.innerHTML = '';
    }

    if (mainContentsEl) {
        mainContentsEl.style.display = 'none';
    }

    if (relativeNewsEl) {
        relativeNewsEl.style.display = 'none';
    }

    if (part3AreaEl) {
        part3AreaEl.style.display = 'none';
    }

    if (previewClipWrapEl) {
        previewClipWrapEl.classList.add('d-none');
    }

    if (previewClipListEl) {
        previewClipListEl.innerHTML = '';
    }

    if (relativeStockWrapEl) {
        relativeStockWrapEl.innerHTML = '';
    }

    if (mobileKeywordWrapEl) {
        mobileKeywordWrapEl.innerHTML = '';
        mobileKeywordWrapEl.style.display = 'none';
    }

    if (viewOnSiteButton) {
        viewOnSiteButton.classList.add('d-none');
    }

    if (printButton) {
        printButton.style.visibility = 'hidden';
        printButton.disabled = true;
    }

    modalEl.dataset.hasWatermark = 'false';
    applyInlineStylesToPreview(modalEl);
    initPreviewViewSizeToggle();
    modal.show();

    return modalEl;
}

function showArticleTempRestoreModal(tempData) {
    const modalEl = document.getElementById('article-temp-restore-modal');
    if (!modalEl || typeof bootstrap === 'undefined') {
        return Promise.resolve(false);
    }

    return new Promise((resolve) => {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        const articleId = tempData?.articleId || document.getElementById('articleId')?.value;
        const loadButton = modalEl.querySelector('[data-role="load-article-temp"]');
        const previewButton = modalEl.querySelector('[data-role="preview-article-temp"]');
        const currentPreviewButton = modalEl.querySelector('[data-role="preview-article-current"]');
        const savedAtEl = modalEl.querySelector('#article-temp-saved-at');
        const formattedUpdatedAt = formatArticleTempUpdatedAt(tempData?.updatedAt);

        if (savedAtEl) {
            savedAtEl.textContent = formattedUpdatedAt
                ? `마지막 자동저장: ${formattedUpdatedAt}`
                : '';
        }

        initBootstrapTooltips(modalEl);

        let resolved = false;
        let previewMode = false;

        const cleanup = () => {
            loadButton?.removeEventListener('click', handleLoad);
            previewButton?.removeEventListener('click', handlePreview);
            currentPreviewButton?.removeEventListener('click', handleCurrentPreview);
            modalEl.removeEventListener('hidden.bs.modal', handleHidden);
        };

        const settle = (result) => {
            if (resolved) {
                return;
            }

            resolved = true;
            cleanup();
            resolve(result);
        };

        const handleLoad = () => {
            settle(true);
            modal.hide();
        };

        const handleHidden = () => {
            if (previewMode) {
                return;
            }

            settle(false);
        };

        const handlePreview = async (event) => {
            event?.preventDefault?.();

            if (!previewButton || previewButton.disabled) {
                return;
            }

            previewButton.disabled = true;
            const originalText = previewButton.textContent;
            previewButton.textContent = '불러오는 중...';

            try {
                previewMode = true;

                modalEl.addEventListener('hidden.bs.modal', async () => {
                    try {
                        const previewModalEl = await previewArticleTemp(tempData);
                        previewModalEl.addEventListener('hidden.bs.modal', () => {
                            previewMode = false;
                            modal.show();
                        }, { once: true });
                    } catch (error) {
                        previewMode = false;
                        modal.show();
                        alert(error.message || '자동저장 미리보기를 불러오지 못했습니다.');
                    }
                }, { once: true });

                modal.hide();
            } finally {
                previewButton.disabled = false;
                previewButton.textContent = originalText;
            }
        };

        const handleCurrentPreview = async (event) => {
            event?.preventDefault?.();

            if (!currentPreviewButton || currentPreviewButton.disabled) {
                return;
            }

            currentPreviewButton.disabled = true;
            const originalText = currentPreviewButton.textContent;
            currentPreviewButton.textContent = '불러오는 중..';

            try {
                previewMode = true;

                modalEl.addEventListener('hidden.bs.modal', async () => {
                    try {
                        const previewModalEl = await previewCurrentArticle(articleId);
                        previewModalEl.addEventListener('hidden.bs.modal', () => {
                            previewMode = false;
                            modal.show();
                        }, { once: true });
                    } catch (error) {
                        previewMode = false;
                        modal.show();
                        alert(error.message || '현재 저장본 미리보기를 불러오지 못했습니다.');
                    }
                }, { once: true });

                modal.hide();
            } finally {
                currentPreviewButton.disabled = false;
                currentPreviewButton.textContent = originalText;
            }
        };

        loadButton?.addEventListener('click', handleLoad, { once: true });
        previewButton?.addEventListener('click', handlePreview);
        currentPreviewButton?.addEventListener('click', handleCurrentPreview);
        modalEl.addEventListener('hidden.bs.modal', handleHidden);
        modal.show();
    });
}

async function applyArticleTempData(tempData) {
    if (!tempData) {
        return;
    }

    const setValue = (id, value, dispatchInput = false) => {
        const element = document.getElementById(id);
        if (!element) {
            return;
        }

        element.value = value ?? '';
        if (dispatchInput) {
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    const closeAutocompleteResults = () => {
        document.querySelectorAll('.autocomplete-result').forEach((element) => {
            element.style.display = 'none';
        });
    };

    setValue('article_title', tempData.title, true);
    setValue('article_sub_title', tempData.subTitle, true);
    closeAutocompleteResults();

    await setMainEditorContent(tempData.content);
    setRightPreviewsFromContent(tempData.content);
}

export async function checkAndPromptLoadArticleTemp(articleId, articleTempState) {
    if (!articleId) {
        return;
    }

    try {
        const response = await fetch(`/api/articles/${articleId}/temp`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            return;
        }

        const result = await response.json();
        const tempData = result?.data;
        if (!tempData) {
            return;
        }

        articleTempState.tempId = tempData.id ?? null;

        const shouldLoad = await showArticleTempRestoreModal(tempData);
        if (!shouldLoad) {
            return;
        }

        await applyArticleTempData(tempData);
        articleTempState.lastSnapshot = JSON.stringify(buildArticleTempDto());
        showArticleTempAutoSaveNotice('자동저장된 내용을 불러왔습니다.');
    } catch (error) {
        console.error('failed to load article temp', error);
    }
}

export function startArticleTempAutoSaveInterval(articleId, articleTempState) {
    const AUTO_SAVE_INTERVAL_MS = getEditorAutoSaveIntervalMs();

    articleTempState.lastSnapshot = JSON.stringify(buildArticleTempDto());

    setInterval(async () => {
        const payload = buildArticleTempDto();
        const title = (payload.title || '').trim();
        const content = payload.content || '';

        if (title === '' || content === '<p>&nbsp;</p>') {
            return;
        }

        const snapshot = JSON.stringify(payload);
        if (snapshot === articleTempState.lastSnapshot) {
            return;
        }

        try {
            const response = await postWithCsrf(`/api/articles/${articleId}/temp`, payload);
            if (!response.ok) {
                console.error('article temp save failed', response.status, response.statusText);
                return;
            }

            const result = await response.json();
            if (!result?.success) {
                if (handleEditingLockLostInEditor(result.message)) {
                    return;
                }
                console.error('article temp save rejected', result?.message);
                return;
            }

            articleTempState.tempId = result?.data?.id ?? null;
            articleTempState.lastSnapshot = snapshot;
            showArticleTempAutoSaveNotice(`자동저장 (저장시간: ${formatCurrentTimeForTempNotice()})`);
        } catch (error) {
            console.error('article temp save error', error);
        }
    }, AUTO_SAVE_INTERVAL_MS);
}

function applyImportantToEditorTableCells(editor) {
    const editable = editor?.ui?.view?.editable?.element;
    if (!editable) {
        return;
    }

    const cells = editable.querySelectorAll('th, td');
    cells.forEach(cell => {
        const borderColor = cell.style.borderColor;
        const borderWidth = cell.style.borderWidth;

        if (borderColor) {
            cell.style.setProperty('border-color', borderColor, 'important');
        }

        if (borderWidth) {
            cell.style.setProperty('border-width', borderWidth, 'important');
        }
    });
}

async function setMainEditorContent(content) {
    if (window.editorReady) {
        await window.editorReady;
    }

    const editor = window.mainEditor;
    if (!editor?.setData) {
        console.warn('CKEditor 인스턴스가 존재하지 않거나 초기화되지 않았습니다.');
        return false;
    }

    const nextContent = content || '';
    editor.setData(nextContent);
    editor.originalContent = nextContent;

    if (!editor.__importantTableCellListenerBound) {
        editor.editing.view.document.on('change', () => {
            applyImportantToEditorTableCells(editor);
        });
        editor.__importantTableCellListenerBound = true;
    }

    setTimeout(() => {
        applyImportantToEditorTableCells(editor);
    }, 0);

    return true;
}

/**
 * rampadId로 자동저장 데이터를 불러와
 * 제목, 부제목, 내용을 세팅합니다.
 * @param {number|string} rampadId
 */
export async function loadRampad(rampadId) {
    if (!rampadId) {
        console.error('rampadId가 필요합니다.');
        return;
    }

    const apiUrl = `/api/rampads/${rampadId}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorJson = await response.json();
            alert(`${errorJson.message}`);
            return;
        }

        const result = await response.json();

        // 응답에서 title, subTitle, content 가져오기
        const { title, subTitle, content } = result.data;

        // DOM에 세팅
        const articleTitleInput = document.getElementById('article_title');
        articleTitleInput.value = title || '';
        articleTitleInput.dispatchEvent(new Event('input', { bubbles: true }));
        document.getElementById('article_sub_title').value = subTitle || '';
        await setMainEditorContent(content);
        setRightPreviewsFromContent(content);
    } catch (err) {
        alert('자동저장 데이터를 불러오지 못했습니다.');
    }
}

/**
 * 기사상세 요청 함수
 * @returns {Promise<void>}
 */
export async function getArticleDetail() {
    const articleId = document.getElementById('articleId').value;
    const apiUrl = `/api/articles/${articleId}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorJson = await response.json();
            alert(`${errorJson.message}`);
            return;
        }

        const result = await response.json();
        return result.data;

    } catch (err) {
        console.log(err);
        alert('기사상세 데이터 가져오는 도중 오류 발생');
    }
}

const NON_DESK_ACCESSIBLE_ARTICLE_STATES = new Set([
    'WRITING',
    'WRITING_DONE',
    'EDIT_REQUEST'
]);

function leaveEditorPage() {
    window.removeEventListener('beforeunload', handleBeforeUnload);

    const referrer = document.referrer;
    window.location.href = referrer || '/article/my';
}

function canAccessArticleDetail(state) {
    return hasAuthority('ARTICLE_DESK') || NON_DESK_ACCESSIBLE_ARTICLE_STATES.has(state);
}

/**
 * 수정화면 기사 정보 가져오는 함수
 * @returns {Promise<boolean>}
 */
export async function bindArticleDetailData() {
    const data = await getArticleDetail();
    if (!data) {
        leaveEditorPage();
        return false;
    }

    if (!canAccessArticleDetail(data.state)) {
        alert('해당 상태의 기사 상세 페이지에 접근할 수 없습니다.');
        leaveEditorPage();
        return false;
    }

    // console.log("article detail data", data);

    try {
        // == 평가 ==
        renderEvaluation(data);

        // 에디터 데이터 입력 (CKEditor5)
        /** CKEditor5는 내부적으로 복잡한 상태 관리와 데이터 모델을 사용하기 때문에,
         * 단순히 innerHTML로 DOM을 조작하면 에디터 내부 상태와 실제 UI가 불일치하게 되어,
         * 데이터 유실, 포맷 손상, undo/redo 오류 등이 발생할 수 있음.
         * 따라서 공식 API인 setData()를 사용해 데이터를 주입하는 것이 가장 안전하고 권장되는 방식이다.
         */
        await setMainEditorContent(data.content);

        // === 기본 필드 바인딩 및 원본 저장 ===
        const bindInput = (id, value) => {
            const el = document.getElementById(id);
            el.value = value || '';
            el.dataset.original = value || '';
        };

        bindInput('article_title', data.title);
        document.getElementById('article_title').dispatchEvent(new Event('input', { bubbles: true }));
        bindInput('selected-color-value', data.titleColor);
        bindInput('article_sub_title', data.subTitle);

        bindInput('article_series_id', data.seriesId);
        bindInput('article_series', data.seriesTitle);
        bindInput('article_serial_id', data.serialId);
        bindInput('article_serial', data.serialTitle);

        bindInput('releaseAt', data.releasedAt);
        bindInput('memberReleaseAt', data.memberReleasedAt);
        bindInput('plusReleaseAt', data.plusReleasedAt);

        bindInput('coverId', data.coverId);

        // === 해시태그 ===
        bindInput('hashtag-manual', data.hashtags); // 직접입력 해시태그
        renderAutoHashtags(data.autoHashtags)

        // === 메모 카운트 ===
        document.getElementById('memoCount').textContent = data.memoCount;

        // === 출처 바인딩 ===
        const sourceTypes = data.sourceTypes || [];
        document.querySelectorAll('input[name="sourceTypes"]').forEach(el => {
            el.checked = sourceTypes.includes(el.value);
        });

        // 출처 원본 저장 (비교용 hidden 엘리먼트 사용)
        let sourceTypesHolder = document.getElementById('sourceTypesData');
        if (!sourceTypesHolder) {
            sourceTypesHolder = document.createElement('div');
            sourceTypesHolder.id = 'sourceTypesData';
            sourceTypesHolder.style.display = 'none';
            document.body.appendChild(sourceTypesHolder);
        }
        sourceTypesHolder.dataset.original = JSON.stringify(sourceTypes);

        // === 기사 속성 바인딩 ===
        if (data.attributeType) {
            const attrInput = document.querySelector(`input[name="attributeType"][value="${data.attributeType}"]`);
            if (attrInput) {
                attrInput.checked = true;
                attrInput.dataset.original = "true";
            }
        }

        // === 엠바고 바인딩 ===
        bindEmbargoDataFromDetail(data);

        // === 카테고리 바인딩 ===
        await bindCategoriesLazy(data.categories);

        // === 기자 바인딩 ===
        await bindByline(data.byline, data.isCustomByline, data.reporters);

        const watermarkchecked = document.getElementById('has-watermark');
        if (watermarkchecked) {
            // data.hasWatermark가 true이면 체크됨, false이면 해제됨
            watermarkchecked.checked = (data.hasWatermark === true || data.hasWatermark === "true");
        }

        // === 전송 옵션 (데스크인 경우에만) ===
        if (hasDeskingAuthority()) {
            const bindCheckbox = (id, value) => {
                const el = document.getElementById(id);
                el.checked = value === true;
                el.dataset.original = String(value === true); // 문자열 비교
            };

            // 인포머셜
            bindCheckbox('is-infomercial', data.isInfomercial);

            bindCheckbox('ext-d-flag', data.extDFlag);
            bindCheckbox('ext-d-plus-flag', data.extDPlusFlag);
            bindCheckbox('ext-portal-flag', data.extPortalFlag);
            bindCheckbox('ext-hts-flag', data.extHtsFlag);

            // delayedRelease가 true(지연출고 상태)이면 → 체크박스는 false여야 함
            bindCheckbox('delayed-release', !data.delayedRelease);
            bindCheckbox('immediate-release', data.immediateRelease);

            const immediateReleaseWrapper = document.getElementById('immediate-release-form-check');
            if (immediateReleaseWrapper) {
                const articleState = String(data.state || '').toUpperCase();
                immediateReleaseWrapper.classList.remove('d-none');
                const immediateReleaseCheckbox = document.getElementById('immediate-release');
                if (immediateReleaseCheckbox) {
                    immediateReleaseCheckbox.disabled = articleState === 'RELEASED';
                }
            }

            // D 체크박스 요소
            const dCheckbox = document.getElementById('ext-d-flag');
            // 포털 체크박스 요소
            const portalCheckbox = document.getElementById('ext-portal-flag');
            // 포털 체크박스 요소
            const htsCheckbox = document.getElementById('ext-hts-flag');

            // D 체크 해제될 때 포털, HTS도 같이 해제
            dCheckbox.addEventListener('change', function () {
                if (!this.checked) {
                    portalCheckbox.checked = false;
                    htsCheckbox.checked = false;
                    console.log("D 체크 해제됨 → 포털, HTS도 자동 해제");
                }
            });

            // 출고 상황 정보 표출
            if (data.state==="RELEASED" || data.state==="EMBARGO") {
                const badgeHtml = renderBadge(data);
                const noticeArea = document.getElementById('notice-article-state');
                noticeArea.classList.remove('d-none');
                noticeArea.innerHTML = `기사 출고 현황 : ${badgeHtml}`;
            }

        }

        // === 관련종목 바인딩 ===
        renderRelatedKrx(data);

        // === 관련기사 바인딩 ===
        renderRelatedArticle(data)

        // === 첨부파일 바인딩 ===
        renderArticleClipList(data.clipInfoList);

        // === 하단 버튼 ===
        if (hasDeskingAuthority()) {
            switch (data.state) {
                case 'RELEASED': // 출고
                case 'EMBARGO':  // 예약출고
                case 'EDIT_REQUEST': // 반려버튼 눌러서 수정요청 상태
                    renderEditorButtons({canRelease: false, canReject: false, canDelete: true});
                    break;
                default:
                    renderEditorButtons({canRelease: true, canReject: true, canDelete: true});
            }

            const articleStateLabel = document.getElementById("articleStateLabel")
            articleStateLabel.textContent = data.stateLabel;
        }


        // === 썸네일 이미지 표시 ===
        setRightPreviews(data);

        return true;
    } catch (e) {
        console.error(e);
        alert("기사 데이터 바인딩 도중 에러 발생");
        return false;
    }
}

// 평가
function renderEvaluation(data) {
    const evaluationEnabled = data.evaluationEnabled;
    if (!evaluationEnabled) return;

    const evaluationAreas = document.querySelectorAll(".evaluationArea");
    const evaluationSelect = document.getElementById("evaluation");
    const grade = data.grade ?? "";

    evaluationAreas.forEach(el => {
        el.classList.remove('d-none');
    });

    if (evaluationSelect) {
        evaluationSelect.value = grade;
        evaluationSelect.dataset.original = grade;
    }
}

// 선택되어있는 관련종목 렌더 함수
function renderRelatedKrx(data) {
    const resultBox = document.querySelector(".related-krx-result");
    const selectedList = document.querySelector(".related-krx-result .list-group");
    if (!resultBox || !selectedList) return;

    // 초기화
    selectedList.innerHTML = "";

    const items = Array.isArray(data && data.relatedKrxes)
        ? data.relatedKrxes
        : [];

    if (items.length === 0) {
        resultBox.style.display = "none";
        return;
    }

    // 보이기
    resultBox.style.display = "block";

    // li[data-id]로 선택 리스트 구성
    const fragment = document.createDocumentFragment();
    const seen = new Set();
    const originalIds = [];

    items.forEach(function (item) {
        const idStr = String(item.krxId);
        if (seen.has(idStr)) return;
        seen.add(idStr);
        originalIds.push(idStr);

        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.dataset.id = idStr;
        li.innerHTML =
            item.name +
            ' <button type="button" class="btn btn-danger hide-bn"><i class="ri-close-line"></i></button>';

        fragment.appendChild(li);
    });

    selectedList.appendChild(fragment);
    // 원본 관련종목 ID 문자열 저장 (수정 비교용)
    selectedList.dataset.original = originalIds.join(",");
}

// 선택되어있는 관련기사 렌더 함수
function renderRelatedArticle(data) {
    const resultBox = document.querySelector(".related-article-result");
    const selectedList = document.querySelector(".related-article-result .list-group");
    if (!resultBox || !selectedList) return;

    // 초기화
    selectedList.innerHTML = "";

    const items = Array.isArray(data && data.relatedArticles)
        ? data.relatedArticles
        : [];

    if (items.length === 0) {
        resultBox.style.display = "none";
        return;
    }

    // 보이기
    resultBox.style.display = "block";

    // li[data-id]로 선택 리스트 구성
    const fragment = document.createDocumentFragment();
    const seen = new Set();
    const originalIds = [];

    items.forEach(function (item) {
        const idStr = String(item.relatedArticleId);
        if (seen.has(idStr)) return;
        seen.add(idStr);
        originalIds.push(idStr);

        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.dataset.id = idStr;
        li.innerHTML =
            `<span role="button"
                class="article-preview-trigger"
                data-article-id="${idStr}">${escapeHtml(item.relatedArticleTitle)}</span>` +
            ' <button type="button" class="btn btn-danger hide-bn"><i class="ri-close-line"></i></button>';

        fragment.appendChild(li);
    });

    selectedList.appendChild(fragment);
    // 원본 관련종목 ID 문자열 저장 (수정 비교용)
    selectedList.dataset.original = originalIds.join(",");
}

// 에디터 안에 액션 버튼 렌더 함수
function renderArticleClipList(clipInfoList) {
    const previewContainer = document.getElementById('file-previews');
    if (!previewContainer) return;

    previewContainer.querySelectorAll('.editor-clip-card').forEach((element) => element.remove());

    const clips = Array.isArray(clipInfoList) ? clipInfoList : [];
    clips.forEach((clip) => {
        previewContainer.appendChild(createEditorClipCardElement(clip));
    });
}

export function initArticleClipDropzone() {
    const dropzoneEl = document.getElementById('articleClipDropzone');
    const previewContainer = document.getElementById('file-previews');
    const templateEl = document.getElementById('uploadPreviewTemplate');

    if (!dropzoneEl || !previewContainer || !templateEl || typeof Dropzone === 'undefined') {
        return;
    }

    if (dropzoneEl.dataset.clipDropzoneBound === '1') {
        return;
    }

    Dropzone.autoDiscover = false;

    const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');
    const headers = {};

    if (csrfToken && csrfHeader) {
        headers[csrfHeader] = csrfToken;
    }

    const dz = new Dropzone(dropzoneEl, {
        url: '/api/clip/upload',
        method: 'post',
        paramName: 'upload',
        headers,
        previewsContainer: '#file-previews',
        previewTemplate: templateEl.innerHTML,
        uploadMultiple: false,
        parallelUploads: 1,
        createImageThumbnails: false,
    });

    dz.on('success', (file, response) => {
        file.previewElement?.remove();

        if (!response?.success || !response?.data?.id) {
            alert(response?.message || '파일 업로드에 실패했습니다.');
            return;
        }

        previewContainer.appendChild(createEditorClipCardElement(response.data));
    });

    dz.on('error', (file, errorMessage, xhr) => {
        file.previewElement?.remove();

        let message = '파일 업로드 중 오류가 발생했습니다.';
        if (typeof errorMessage === 'string' && errorMessage.trim()) {
            message = errorMessage;
        } else if (errorMessage?.message) {
            message = errorMessage.message;
        }

        if (xhr?.responseText) {
            try {
                const parsed = JSON.parse(xhr.responseText);
                message = parsed.message || message;
            } catch (_) {
                // ignore parse error
            }
        }

        alert(message);
    });

    dropzoneEl.dataset.clipDropzoneBound = '1';
}

function createEditorClipCardElement(clip) {
    const wrapper = document.createElement('div');
    wrapper.className = 'editor-clip-card';
    wrapper.dataset.clipId = clip.id;

    const fileName = sanitizeClipFileName(clip.title || 'FILE');
    const extension = (fileName.split('.').pop() || '').toUpperCase();
    const fileSize = formatClipFileSize(clip.size);
    const isImage = isImageClip(fileName, clip.url);
    const downloadUrl = clip.fileKey
        ? `/api/files/download?key=${encodeURIComponent(clip.fileKey)}&filename=${encodeURIComponent(fileName)}`
        : null;

    const thumbnailHtml = isImage
        ? `<img src="${clip.url}" class="avatar-sm rounded bg-light me-1" alt="">`
        : `
            <div class="avatar-sm">
                <span class="avatar-title rounded bg-light text-body">
                    ${escapeHtml(extension || 'FILE')}
                </span>
            </div>
        `;

    wrapper.innerHTML = `
        <div class="card mt-1 mb-0 shadow-none border">
            <div class="p-2">
                <div class="row align-items-center">
                    <div class="col-auto">
                        ${thumbnailHtml}
                    </div>
                    <div class="col ps-0">
                        ${downloadUrl
                            ? `<a href="javascript:void(0);" data-download-url="${downloadUrl}" data-download-filename="${escapeHtml(fileName)}" class="d-block text-muted fw-bold text-break ps-2 btn-download-clip-title">${escapeHtml(fileName)}</a>`
                            : `<span class="d-block text-muted fw-bold text-break ps-2">${escapeHtml(fileName)}</span>`
                        }
                        <p class="mb-0 ps-2">${fileSize}</p>
                    </div>
                    <div class="col-auto">
                        <a href="javascript:void(0);" class="btn btn-link btn-lg text-danger btn-remove-clip">
                            <i class="ri-delete-bin-line"></i>
                        </a>
                    </div>
                </div>
            </div>
            <input type="hidden" name="clipIds" value="${clip.id}">
        </div>
    `;

    wrapper.querySelector('.btn-remove-clip')?.addEventListener('click', () => {
        wrapper.remove();
    });

    wrapper.querySelector('.btn-download-clip-title')?.addEventListener('click', async (event) => {
        event.preventDefault();
        const url = event.currentTarget.dataset.downloadUrl;
        const downloadFileName = event.currentTarget.dataset.downloadFilename || fileName;
        await downloadClipFile(url, downloadFileName);
    });

    return wrapper;
}

async function downloadClipFile(url, fileName) {
    if (!url) return;

    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName || 'download';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
        console.error(error);
        alert('파일 다운로드 중 오류가 발생했습니다.');
    }
}

function sanitizeClipFileName(value) {
    const rawValue = String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
    return rawValue || 'FILE';
}

function formatClipFileSize(size) {
    const numericSize = Number(size);
    if (!Number.isFinite(numericSize)) return '';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let currentSize = numericSize;

    while (currentSize >= 1024 && unitIndex < units.length - 1) {
        currentSize /= 1024;
        unitIndex += 1;
    }

    return `${currentSize.toFixed(currentSize < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

function isImageClip(fileName, fileUrl = '') {
    return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(`${fileName} ${fileUrl}`.toLowerCase());
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function renderEditorButtons({canRelease, canReject, canDelete}) {
    const container = document.getElementById('editor-actions');
    if (!container) return;

    // 기존 버튼 초기화
    container.innerHTML = '';

    if (canRelease) {
        const releaseBtn = document.createElement('button');
        releaseBtn.type = 'button';
        releaseBtn.className = 'btn btn-info btn-release-in-editor';
        releaseBtn.textContent = '출고';
        container.appendChild(releaseBtn);
    }

    if (canReject) {
        const rejectBtn = document.createElement('button');
        rejectBtn.type = 'button';
        rejectBtn.className = 'btn btn-outline-secondary mx-2 btn-reject-in-editor';
        rejectBtn.textContent = '반려';
        container.appendChild(rejectBtn);
    }

    if (canDelete) {
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-outline-secondary btn-delete-in-editor';
        deleteBtn.textContent = '삭제';
        container.appendChild(deleteBtn);
    }
}


export async function bindMyspaceDetailData() {
    const data = await getArticleDetail();
    // console.log("myspace detail data", data);

    if (data.state!=='MY_SPACE') {
        alert("해당 기사는 더이상 Myspace 이어쓰기를 할 수 없는 기사입니다. 내 기사 화면으로 이동합니다.")
        window.removeEventListener('beforeunload', handleBeforeUnload); // 화면 이탈 경고 제거
        window.location.href = '/article/my';
        return;
    }

    try {
        // 에디터 데이터 입력 (CKEditor5)
        /** CKEditor5는 내부적으로 복잡한 상태 관리와 데이터 모델을 사용하기 때문에,
         * 단순히 innerHTML로 DOM을 조작하면 에디터 내부 상태와 실제 UI가 불일치하게 되어,
         * 데이터 유실, 포맷 손상, undo/redo 오류 등이 발생할 수 있음.
         * 따라서 공식 API인 setData()를 사용해 데이터를 주입하는 것이 가장 안전하고 권장되는 방식이다.
         */
        await setMainEditorContent(data.content);

        // === 기본 필드 바인딩 및 원본 저장 ===
        const bindInput = (id, value) => {
            const el = document.getElementById(id);
            el.value = value || '';
            el.dataset.original = value || '';
        };

        bindInput('article_title', data.title);
        document.getElementById('article_title').dispatchEvent(new Event('input', { bubbles: true }));
        bindInput('article_sub_title', data.subTitle);

        bindInput('article_series_id', data.seriesId);
        bindInput('article_series', data.seriesTitle);
        bindInput('article_serial_id', data.serialId);
        bindInput('article_serial', data.serialTitle);

        // === 썸네일 이미지 표시 ===
        setRightPreviews(data);

    } catch (e) {
        console.error(e);
        alert("Myspace 데이터 바인딩 도중 에러 발생");
    }
}





/**
 * 수정 화면에서 바이라인 정보 바인딩
 * @param byline
 * @param isCustomByline
 * @param reporters
 * @returns {Promise<void>}
 */
async function bindByline(byline, isCustomByline, reporters) {
    const bylinePreviewEl = document.getElementById('byline-preview');
    const customBylineCheckEl = document.getElementById('custom-byline-check');
    const newsroomCheckEl = document.getElementById('byline-newsroom');
    const anonymousCheckEl = document.getElementById('byline-anonymous');

    const resetCheckStates = () => {
        newsroomCheckEl.checked = false;
        newsroomCheckEl.dataset.original = 'false';

        anonymousCheckEl.checked = false;
        anonymousCheckEl.dataset.original = 'false';
    };

    if (Array.isArray(reporters) && reporters.length > 0) {
        // 기자 목록 표시
        const container = document.getElementById('liveAlertPlaceholder');
        container.innerHTML = '';

        for (const r of reporters) {
            await addBylineUserBlock(r.userId, r.userName, container, r.byline);
        }
        // .byline-box2 내부 input에 대해서만 data-original 세팅
        const bylineUserInputs = document.querySelectorAll('.byline-box2 input[name="userId"]');
        bylineUserInputs.forEach((input) => {
            input.dataset.original = input.value;
        });

        // 체크박스 상태 설정
        toggleBylineLiveAlertPlaceholder({ useNewsroom: false, useAnonymous: false });

        customBylineCheckEl.checked = isCustomByline;
        customBylineCheckEl.dataset.original = String(isCustomByline);

        customBylineCheckEvent({ useCustomBylineCheck: isCustomByline });

        // preview 값 설정
        const previewVal = byline;
        bylinePreviewEl.value = previewVal;
        bylinePreviewEl.dataset.original = previewVal;

        resetCheckStates();
    } else {
        // 편집국 or 익명 바이라인 처리
        const isNewsroom = byline === '딜사이트 편집국';

        newsroomCheckEl.checked = isNewsroom;
        newsroomCheckEl.dataset.original = String(isNewsroom);

        anonymousCheckEl.checked = !isNewsroom;
        anonymousCheckEl.dataset.original = String(!isNewsroom);

        toggleBylineLiveAlertPlaceholder({ useNewsroom: isNewsroom, useAnonymous: !isNewsroom });

        bylinePreviewEl.value = byline;
        bylinePreviewEl.dataset.original = byline;

        customBylineCheckEl.checked = true;
        customBylineCheckEl.dataset.original = 'true';
    }
}


/**
 * 수정화면에서 카테고리 바인딩
 * @param categories
 * @returns {Promise<void>}
 */
async function bindCategoriesLazy(categories) {
    const container = document.querySelector('.category-selector');
    if (!container) {
        console.error('bindCategoriesLazy: .category-selector 요소가 없습니다.');
        return;
    }

    const template1 = container.querySelector('.category-selector-box[data-root-id="1"]');
    const template2 = container.querySelector('.category-selector-box[data-root-id="2"]');

    if (!template1 || !template2) {
        console.error('템플릿 박스가 없습니다.');
        return;
    }

    // 기존 복제된 박스 제거
    container.querySelectorAll('.category-selector-box[data-root-id="1"]:not(:first-child)').forEach(el => el.remove());
    container.querySelectorAll('.category-selector-box[data-root-id="2"]:not(:first-child)').forEach(el => el.remove());

    const groups = {
        1: categories.filter(c => c.rootId === 1),
        2: categories.filter(c => c.rootId === 2)
    };

    for (const [rootIdStr, cats] of Object.entries(groups)) {
        const rootId = parseInt(rootIdStr, 10);
        const template = rootId === 1 ? template1 : template2;
        const parent = template.parentElement;
        let first = true;

        if (cats.length === 0) {
            initCategoryOptions(template);
            continue;
        }

        for (const cat of cats) {
            let box;
            if (first) {
                box = template;
                first = false;
            } else {
                box = template.cloneNode(true);

                // + 버튼 → - 버튼
                setCategoryBoxButtonState(box, false);

                parent.appendChild(box);
                initBootstrapTooltips(box);
            }

            // dataset에 값 + 라벨 저장
            box.dataset.depth1 = cat.depth1 || '';
            box.dataset.depth1Label = cat.depth1Label || '';
            box.dataset.depth2 = cat.depth2 || '';
            box.dataset.depth2Label = cat.depth2Label || '';
            box.dataset.depth3 = cat.depth3 || '';
            box.dataset.depth3Label = cat.depth3Label || '';
            box.dataset.rootId = cat.rootId || '';

            // ✅ data-original 저장
            const setSelect = (selector, value) => {
                const select = box.querySelector(selector);
                if (!select) return;

                select.value = value || 'default';
                select.dataset.original = (value === null || value === undefined || value === '') ? 'default' : value;
            };

            setSelect('.depth1', cat.depth1);
            setSelect('.depth2', cat.depth2);
            setSelect('.depth3', cat.depth3);

            // <select> 초기화 + 이벤트 바인딩
            initLazyCategoryBox(box);
            categoryChangeAction(box);
        }
    }

    setOriginalCategorySnapshot(categories);
}

/**
 * 수정 화면에서 카테고리 이벤트 바인딩
 * @param box
 */
function initLazyCategoryBox(box) {
    const depth1 = box.querySelector('.depth1');
    const depth2 = box.querySelector('.depth2');
    const depth3 = box.querySelector('.depth3');

    const savedDepth1 = box.dataset.depth1;
    const savedDepth2 = box.dataset.depth2 === "null" || box.dataset.depth2 === "" ? "-" : box.dataset.depth2;
    const savedDepth3 = box.dataset.depth3 === "null" || box.dataset.depth3 === "" ? "-" : box.dataset.depth3;

    const savedLabel1 = box.dataset.depth1Label || '1ˢᵗ depth';
    const savedLabel2 = box.dataset.depth2Label || '2ⁿᵈ depth';
    const savedLabel3 = box.dataset.depth3Label || '3ʳᵈ depth';

    // 초기 option 표시
    depth1.innerHTML = savedDepth1
        ? `<option value="${savedDepth1}" selected>${savedLabel1}</option>`
        : `<option value="default" selected>1ˢᵗ depth</option>`;

    depth2.innerHTML = savedDepth2 && savedDepth2 !== '-'
        ? `<option value="${savedDepth2}" selected>${savedLabel2}</option>`
        : `<option value="default" selected>2ⁿᵈ depth</option>`;

    depth3.innerHTML = savedDepth3 && savedDepth3 !== '-'
        ? `<option value="${savedDepth3}" selected>${savedLabel3}</option>`
        : `<option value="-" selected disabled>-</option>`;

    // depth1 focus 로딩
    depth1.addEventListener('focus', async () => {
        if (depth1.dataset.loaded) return;
        await loadCategories(box.dataset.rootId, depth1, savedDepth1);

        if (savedDepth1 && savedDepth1 !== '-') {
            depth1.value = savedDepth1;
        }
        depth1.dataset.loaded = '1';
    });

    // depth2 focus 로딩
    depth2.addEventListener('focus', async () => {
        if (depth2.dataset.loaded) return;

        const parentId = depth1.value !== 'default' ? depth1.value : savedDepth1;

        await loadCategories(parentId, depth2);
        if (savedDepth2 && savedDepth2 !== '-') {
            depth2.value = savedDepth2;
        }
        depth2.dataset.loaded = '1';
    });

    // depth3 focus 로딩
    depth3.addEventListener('focus', async () => {
        if (depth3.dataset.loaded) return;

        if (savedDepth3==='-') return;

        const parentId = depth2.value !== 'default' ? depth2.value : savedDepth2;

        await loadCategories(parentId, depth3);
        if (savedDepth3 && savedDepth3 !== '-') {
            depth3.value = savedDepth3;
        }
        depth3.dataset.loaded = '1';
    });
}

/**
 * 동일 name을 가진 체크박스 그룹 중 하나만 선택 가능하도록 제어하는 함수
 * @param {string} groupName - 체크박스의 name 속성 값 (예: 'attributeType')
 */
export function initSingleCheckboxGroup(groupName) {
    const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                checkboxes.forEach(other => {
                    if (other !== e.target) {
                        other.checked = false;
                    }
                });
            }
        });
    });
}

function buildUpdateEvaluationDto() {
    const dto = {};

    // 1. 현재 select 박스에서 선택된 값 가져오기
    const selectedEvaluation = document.getElementById("evaluation")?.value || "";

    // 2. data-original에 저장된 기존 값 가져오기
    const originalEvaluation = document.getElementById('evaluation')?.dataset.original || "";

    // 3. 현재 값과 기존 값이 다를 경우에만 DTO에 추가
    if (selectedEvaluation !== originalEvaluation) {
        dto.grade = selectedEvaluation;
    }

    return dto;
}

function buildUpdateSourceDto() {
    const dto = {};
    const selected = Array.from(document.querySelectorAll('input[name="sourceTypes"]:checked')).map(el => el.value);
    const original = JSON.parse(document.getElementById('sourceTypesData')?.dataset.original || '[]');
    if (JSON.stringify(selected.sort()) !== JSON.stringify(original.sort())) {
        dto.sourceTypes = selected;
    }
    return dto;
}

function buildUpdateCategoryDto() {
    const dto = {};
    const rootIdMap = {
        1: 'dCategories',
        2: 'dPlusCategories'
    };

    if (serializeCategorySelections() === getOriginalCategorySnapshot()) {
        return dto;
    }

    for (const [rootIdStr, key] of Object.entries(rootIdMap)) {
        const rootId = parseInt(rootIdStr, 10);
        dto[key] = getCategorySelections(false)
            .filter(category => category.rootId === rootId)
            .map(category => ({
                rootId: String(rootId),
                depth1: category.depth1,
                depth2: category.depth2,
                depth3: category.depth3
            }));
    }

    return dto;
}

function buildUpdateBylineDto() {
    const dto = {};

    const bylineEl = document.getElementById('byline-preview');
    const customCheck = document.getElementById('custom-byline-check');
    const newsroomCheck = document.getElementById('byline-newsroom');
    const anonymousCheck = document.getElementById('byline-anonymous');

    const curr = bylineEl?.value || '';
    const orig = bylineEl?.dataset.original || '';

    const isCustom = customCheck?.checked;
    const isNewsroom = newsroomCheck?.checked;
    const isAnon = anonymousCheck?.checked;

    const origCustom = customCheck?.dataset.original === 'true';
    const origNewsroom = newsroomCheck?.dataset.original === 'true';
    const origAnon = anonymousCheck?.dataset.original === 'true';

    const bylineChanged =
        curr !== orig ||
        isCustom !== origCustom ||
        isNewsroom !== origNewsroom ||
        isAnon !== origAnon;

    const reporterInputs = Array.from(document.querySelectorAll('.byline-box2 input[name="userId"]'));

    const shouldCheckReporter =
        !isNewsroom && !isAnon; // 편집국 or 익명 바이라인은 reporter 비교 안 함

    const reporterChanged = shouldCheckReporter &&
        reporterInputs.some((el, i) => {
            return el.value !== el.dataset.original;
        });

    if (bylineChanged || reporterChanged) {
        dto.byline = curr;
        dto.isCustomByline = isCustom;
        dto.reporters = (isNewsroom || isAnon)
            ? []
            : reporterInputs.map(el => ({
                userId: el.value
            }));
    } else {
    }

    return dto;
}

function buildUpdateRelatedKrsDto() {
    function areSameIdSets(a, b) {
        if (a.length !== b.length) return false;
        const sa = new Set(a);
        if (sa.size !== new Set(b).size) return false; // 중복 여부 상이
        for (const id of sa) {
            if (!b.includes(id)) return false;
        }
        return true;
    }

    const dto = {};

    const container = document.querySelector('.related-krx-result')
    const ul = container.querySelector('ul.list-group');

    // 원본값 파싱
    const originalVal = (ul.dataset.original || '').trim();
    const originalIds = originalVal
        ? originalVal.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    // 현재 선택값 수집
    const currentIds = Array.from(ul.querySelectorAll('li[data-id]'))
        .map(li => String(li.dataset.id).trim())
        .filter(Boolean);

    const isSame = areSameIdSets(originalIds, currentIds);

    if (!isSame) {
        // 관련 종목 수정된 경우
        dto.relatedKrxIds = currentIds;
    }

    return dto;
}

function buildUpdateRelatedArticleDto() {
    function areSameIdSets(a, b) {
        if (a.length !== b.length) return false;
        const sa = new Set(a);
        if (sa.size !== new Set(b).size) return false; // 중복 여부 상이
        for (const id of sa) {
            if (!b.includes(id)) return false;
        }
        return true;
    }

    const dto = {};

    const container = document.querySelector('.related-article-result')
    const ul = container.querySelector('ul.list-group');

    // 원본값 파싱
    const originalVal = (ul.dataset.original || '').trim();
    const originalIds = originalVal
        ? originalVal.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    // 현재 선택값 수집
    const currentIds = Array.from(ul.querySelectorAll('li[data-id]'))
        .map(li => String(li.dataset.id).trim())
        .filter(Boolean);

    const isSame = areSameIdSets(originalIds, currentIds);

    if (!isSame) {
        // 관련 종목 수정된 경우
        dto.relatedArticleIds = currentIds;
    }

    return dto;
}

function buildEmbargoTime(prefix) {
    const checkboxId = prefix === 'plus' ? 'd-plus-embargo-check' : 'd-embargo-check';
    const hourId = prefix === 'plus' ? 'd-plus-embargo-hour' : 'd-embargo-hour';
    const minuteId = prefix === 'plus' ? 'd-plus-embargo-minute' : 'd-embargo-minute';
    const dateSelector = prefix === 'plus' ? 'input[name="d-plus-embargo-date"]' : 'input[name="d-embargo-date"]';

    const checked = document.getElementById(checkboxId)?.checked;
    const ymd = document.querySelector(dateSelector)?.value || '';
    const hour = document.getElementById(hourId)?.value || '';
    const minute = document.getElementById(minuteId)?.value || '';

    if (checked && ymd && hour && minute) {
        return `${ymd}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
    } else {
        return null;
    }
}

function buildBasicArticleDto() {
    const dto = {};

    const titleEl = document.getElementById('article_title');
    const titleColorEl = document.getElementById('selected-color-value');
    const subTitleEl = document.getElementById('article_sub_title');
    const seriesIdEl = document.getElementById('article_series_id');
    const seriesTitleEl = document.getElementById('article_series');
    const serialIdEl = document.getElementById('article_serial_id');
    const serialTitleEl = document.getElementById('article_serial');
    const bylineEl = document.getElementById('byline-preview');
    const customCheckEl = document.getElementById('custom-byline-check');
    const contentVal = window.mainEditor?.getData() || '';
    const attributeVal = document.querySelector('input[name="attributeType"]:checked')?.value ?? null;
    const manualHashtagEl = document.getElementById('hashtag-manual');
    const coverIdEl = document.getElementById('coverId');
    const photoSeqIdEl = document.getElementById('photoSeqId');
    const hasWatermarkCheckEl = document.getElementById('has-watermark');

    // 제목, 부제목, 제목색, 내용
    dto.title = titleEl.value;
    dto.subTitle = subTitleEl.value;
    dto.titleColor = titleColorEl.value;
    dto.content = contentVal;

    // 문패/어깨
    dto.seriesTitle = seriesTitleEl.value;
    dto.seriesId = seriesTitleEl.value!=="" ? seriesIdEl.value : null;
    dto.serialTitle = serialTitleEl.value;
    dto.serialId = serialTitleEl.value!=="" ? serialIdEl.value : null;

    // 바이라인
    dto.byline = bylineEl.value;
    dto.isCustomByline = customCheckEl?.checked;
    // 속성
    dto.attributeType = attributeVal;
    // 엠바고 시간
    dto.plusReleaseScheduleTime = buildEmbargoTime('plus');
    dto.releaseScheduleTime = buildEmbargoTime('d');
    // 직접입력 해시태그
    dto.hashtags = manualHashtagEl.value.trim();
    dto.coverId = coverIdEl.value.trim();
    //대표 이미지
    dto.photoSeqId = photoSeqIdEl.value.trim();
    dto.clipIds = collectArticleClipIds();
    //  워터마트
    dto.hasWatermark =  hasWatermarkCheckEl?.checked;

    // 자동입력 해시태그
    const tagItems = document.querySelectorAll("#hashtag-auto .hashtag-item");
    dto.autoHashtags = Array.from(tagItems)
        .map((el) => el.textContent.trim()) // 버튼 안 글자까지 포함될 수 있음
        .map((txt) => txt.replace(/\s*×$/, "").trim()) // 필요하다면 'X' 버튼 글자 제거
        .filter(Boolean)
        .join(",");

    // 데스크의 경우 전송옵션, 인포머셜 값
    if (hasDeskingAuthority()) {
        ['is-infomercial', 'ext-d-flag', 'ext-d-plus-flag', 'ext-portal-flag', 'ext-hts-flag', 'delayed-release', 'immediate-release'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) {
                return;
            }
            const camelKey = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            if (id==='delayed-release') {
                dto[camelKey] = !el.checked; // delayed-release 체크박스는 '지연출고 없음' 인 경우에 체크되기 때문에 넘기는 값은 반대를 넘겨야함
            } else {
                dto[camelKey] = el.checked;
            }
        });


    }
    return dto;
}

function collectArticleClipIds() {
    return Array.from(document.querySelectorAll('#file-previews input[name="clipIds"]'))
        .map((input) => Number(input.value))
        .filter((id) => Number.isInteger(id) && id > 0);
}

export function buildUpdatedArticleDto() {
    const dto = {};

    /*
        1. 기본 articles 테이블 컬럼 값들은 수정 여부 감지 없이 매번 값 전송함
           -> PUT 기능에 가까움
     */
    Object.assign(dto, buildBasicArticleDto());

    /*
        2. articles 테이블과 연관 관계인 테이블
           -> article_evaluation, article_users, article_categories, article_details, article_krx 관련 데이터는 수정 여부 감지 후 수정 된 경우에만 값 전송함
           -> PATCH 기능에 가까움
     */
    Object.assign(dto, buildUpdateEvaluationDto()); // article_evaluation
    Object.assign(dto, buildUpdateSourceDto()); // article_details
    Object.assign(dto, buildUpdateCategoryDto()); // article_categories
    Object.assign(dto, buildUpdateBylineDto()); // article_users
    Object.assign(dto, buildUpdateRelatedKrsDto()); // article_krxes
    Object.assign(dto, buildUpdateRelatedArticleDto()); // related_articles

    return dto;
}

export async function updateArticle() {
    const articleId = document.getElementById('articleId').value;

    if (!validateArticleForm()) return;

    const safeReturnUrl = getSafeReturnUrl();

    const dto = buildUpdatedArticleDto();
    // console.log(dto);

    try {
        const response = await patchWithCsrf(`/api/articles/${articleId}`, dto);

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert("수정되었습니다.");
                window.removeEventListener('beforeunload', handleBeforeUnload); // 화면 이탈 경고 제거

                // 리스트로 이동
                if (safeReturnUrl) {
                    window.location.href = safeReturnUrl;
                    return;
                }
                const referrer = document.referrer;
                if (referrer) {
                    window.location.href = referrer;
                } else {
                    // fallback: 기본 이동 경로
                    window.location.href = '/article/my';
                }
            } else {
                if (handleEditingLockLostInEditor(result.message)) {
                    return;
                }
                alert(result.message);
            }
        } else {
            const error = await response.text();
            alert('수정 실패: ' + error);
        }
    } catch (err) {
        console.error(err);
        alert('에러 발생: ' + err.message);
    }
}

export async function updateArticleInMySpaceContinue(stateToUpdate) {
    const articleId = document.getElementById('articleId').value;

    let dto;
    let redirectUrl;
    if (stateToUpdate==='WRITING_DONE') {
        // 마이스페이스 이어쓰기에서 '저장' 눌렀을때
        if (!validateArticleForm()) return;
        dto = getSaveArticleDto();
        dto.state = 'WRITING_DONE';
        dto.isMySpace = true;
        redirectUrl = '/article/my';
    } else {
        // 마이스페이스 이어쓰기에서 'my space 저장' 눌렀을때
        const content = window.mainEditor?.getData() || '';
        dto = {
            seriesId: document.getElementById('article_series_id').value,
            seriesTitle: document.getElementById('article_series').value,
            serialId: document.getElementById('article_serial_id').value,
            serialTitle: document.getElementById('article_serial').value,
            title: document.getElementById('article_title').value,
            subTitle: document.getElementById('article_sub_title').value,
            content: content,
            state: 'MY_SPACE',
            isMySpace: true
        };
        Object.assign(dto, getSaveMySpaceDto());
        redirectUrl = '/article/myspace';
    }

    try {
        const response = await patchWithCsrf(`/api/articles/myspace/${articleId}`, dto);

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert("저장되었습니다.");
                window.removeEventListener('beforeunload', handleBeforeUnload); // 화면 이탈 경고 제거
                window.location.href = redirectUrl;
            } else {
                alert(result.message);
                window.removeEventListener('beforeunload', handleBeforeUnload); // 화면 이탈 경고 제거
                window.location.href = '/article/my';
            }
        } else {
            const error = await response.text();
            alert('저장 실패: ' + error);
        }
    } catch (err) {
        console.error(err);
        alert('에러 발생: ' + err.message);
    }
}

// beforeunload 핸들러 함수 (화면 이탈 알림)
export function handleBeforeUnload(event) {

    event.preventDefault();
    event.returnValue = ''; // Chrome에서는 이 값이 있어야 경고창이 뜸
}


let editorExitUnlockBound = false;
let editorExitUnlockRequested = false;

function getEditorExitUnlockRequestData() {
    const articleId = document.getElementById('articleId')?.value;
    const csrfToken = document.querySelector("meta[name='_csrf']")?.getAttribute('content');

    if (!articleId || !csrfToken) {
        return null;
    }

    return {
        url: `/api/articles/${articleId}/unlock`,
        csrfToken
    };
}

export function requestEditorExitUnlock() {
    if (editorExitUnlockRequested) {
        return false;
    }

    const requestData = getEditorExitUnlockRequestData();
    if (!requestData) {
        return false;
    }

    editorExitUnlockRequested = true;

    const body = new URLSearchParams({ _csrf: requestData.csrfToken });

    if (navigator.sendBeacon?.(requestData.url, body)) {
        return true;
    }

    fetch(requestData.url, {
        method: 'POST',
        credentials: 'include',
        keepalive: true,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: body.toString()
    }).catch(() => {
        // 화면 종료 시점 요청 실패는 별도 처리하지 않는다.
    });

    return true;
}

export function bindEditorExitUnlock() {
    if (editorExitUnlockBound) {
        return;
    }

    editorExitUnlockBound = true;

    window.addEventListener('pagehide', (event) => {
        if (event.persisted) {
            return;
        }

        requestEditorExitUnlock();
    });
}

/**
 * 엠바고 설정 영역 이벤트 바인딩 함수
 */
function getFlatpickerInstance(embInput) {
    if (!embInput) return null;

    // 기존 인스턴스가 있으면 재사용
    if (embInput._flatpickr) {
        return embInput._flatpickr;
    }

    // 없으면 새로 초기화
    const commonFlatpickrOptions = {
        altInput: true,
        disableMobile: true,
        dateFormat: "Y-m-d",
        altFormat: "Y-m-d",
        allowInput: false,
        locale: "ko"
    };

    return flatpickr(embInput, commonFlatpickrOptions);
}

function getEmbargoElements(prefix) {
    return {
        checkbox: document.getElementById(`${prefix}-embargo-check`),
        dateInput: document.querySelector(`input[name="${prefix}-embargo-date"]`),
        hourSelect: document.getElementById(`${prefix}-embargo-hour`),
        minuteSelect: document.getElementById(`${prefix}-embargo-minute`),
        flatpickrInstance: getFlatpickerInstance(document.querySelector(`input[name="${prefix}-embargo-date"]`)),
    };
}

function resetEmbargoField({ checkbox, dateInput, hourSelect, minuteSelect, flatpickrInstance }) {
    if (flatpickrInstance && typeof flatpickrInstance.clear === "function") {
        try {
            flatpickrInstance.clear();
        } catch (e) {
            if (dateInput) dateInput.value = '';
        }
    }
    if (dateInput) dateInput.value = '';
    if (hourSelect) hourSelect.value = '';
    if (minuteSelect) minuteSelect.value = '';
    if (checkbox) checkbox.checked = false;
}

export function updateEmbargoButtonState() {
    const embargoButton = document.querySelector('.embargo-btn');

    const dPlus = getEmbargoElements('d-plus');
    const d = getEmbargoElements('d');

    const isChecked = d.checkbox?.checked || dPlus.checkbox?.checked;

    if (isChecked) {
        embargoButton.textContent = '예약출고가 설정됐습니다.';
        embargoButton.classList.remove('btn-secondary');
        embargoButton.classList.add('btn-danger');
    } else {
        embargoButton.textContent = '예약출고 설정';
        embargoButton.classList.remove('btn-danger');
        embargoButton.classList.add('btn-secondary');
    }
}

export function bindEmbargoEvent() {
    const embargoBox = document.querySelector('.embargo-box');
    const embargoButton = document.querySelector('.embargo-btn');
    const clearButton = document.querySelector('#embargo-clear');

    const dPlus = getEmbargoElements('d-plus');
    const d = getEmbargoElements('d');
    const transmissionOptionLabels = {
        'ext-d-plus-flag': 'D+',
        'ext-d-flag': 'D',
        'ext-hts-flag': 'HTS',
        'ext-portal-flag': '포털',
    };
    let embargoTransmissionNoticeTimer = null;
    let embargoTransmissionNoticeHideTimer = null;

    const showEmbargoTransmissionNotice = (labels) => {
        const notice = document.getElementById('notice-embargo-transmission-options');
        if (!notice || labels.length === 0) {
            return;
        }

        if (embargoTransmissionNoticeTimer) {
            window.clearTimeout(embargoTransmissionNoticeTimer);
        }
        if (embargoTransmissionNoticeHideTimer) {
            window.clearTimeout(embargoTransmissionNoticeHideTimer);
        }

        notice.textContent = `전송옵션 ${labels.join(', ')}도 해제되었습니다.`;
        notice.classList.remove('is-visible');
        notice.classList.remove('d-none');

        window.requestAnimationFrame(() => {
            notice.classList.add('is-visible');
        });

        embargoTransmissionNoticeTimer = window.setTimeout(() => {
            notice.classList.remove('is-visible');
            embargoTransmissionNoticeTimer = null;

            embargoTransmissionNoticeHideTimer = window.setTimeout(() => {
                notice.classList.add('d-none');
                notice.textContent = '';
                embargoTransmissionNoticeHideTimer = null;
            }, 300);
        }, 1500);
    };

    const syncReleaseOptionsByTransmissionOptions = () => {
        const immediateRelease = document.getElementById('immediate-release');
        const delayedRelease = document.getElementById('delayed-release');
        const extDFlag = document.getElementById('ext-d-flag');
        const extDPlusFlag = document.getElementById('ext-d-plus-flag');

        if (!extDFlag || !extDPlusFlag) {
            return;
        }

        if (extDFlag.checked && extDPlusFlag.checked) {
            return;
        }

        if (immediateRelease) {
            immediateRelease.checked = false;
        }
        if (delayedRelease) {
            delayedRelease.checked = false;
        }
    };

    const bindDependentReleaseOptionEvents = () => {
        const immediateRelease = document.getElementById('immediate-release');

        if (immediateRelease && immediateRelease.dataset.immediateReleaseBound !== 'true') {
            immediateRelease.dataset.immediateReleaseBound = 'true';

            immediateRelease.addEventListener('change', () => {
                if (!immediateRelease.checked) {
                    return;
                }

                ['ext-d-flag', 'ext-d-plus-flag', 'ext-portal-flag', 'ext-hts-flag', 'delayed-release'].forEach(id => {
                    const checkbox = document.getElementById(id);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
                if (dPlus.checkbox) dPlus.checkbox.checked = false;
                if (d.checkbox) d.checkbox.checked = false;
                updateEmbargoButtonState();
            });
        }

        ['ext-d-flag', 'ext-d-plus-flag'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', syncReleaseOptionsByTransmissionOptions);
        });

        syncReleaseOptionsByTransmissionOptions();
    };

    const uncheckTransmissionOptions = (ids) => {
        const uncheckedLabels = [];

        ids.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox && checkbox.checked) {
                checkbox.checked = false;
                uncheckedLabels.push(transmissionOptionLabels[id] || id);
            }
        });
        syncReleaseOptionsByTransmissionOptions();

        return uncheckedLabels;
    };

    const syncTransmissionOptionsByEmbargo = (embargoElements, transmissionOptionIds) => {
        const checkbox = embargoElements.checkbox;
        if (checkbox && !checkbox.checked) {
            showEmbargoTransmissionNotice(uncheckTransmissionOptions(transmissionOptionIds));
        }
    };

    const autoCheckWhenEmbargoTimeComplete = ({ checkbox, dateInput, hourSelect, minuteSelect }) => {
        if (!checkbox || checkbox.disabled) return;

        const hasDate = Boolean(dateInput?.value?.trim());
        const hasHour = Boolean(hourSelect?.value?.trim());
        const hasMinute = Boolean(minuteSelect?.value?.trim());

        if (hasDate && hasHour && hasMinute && !checkbox.checked) {
            checkbox.checked = true;
            updateEmbargoButtonState();
        }
    };

    const bindAutoCheckEvents = (embargoElements) => {
        const { dateInput, hourSelect, minuteSelect } = embargoElements;

        dateInput?.addEventListener('change', () => autoCheckWhenEmbargoTimeComplete(embargoElements));
        dateInput?.addEventListener('input', () => autoCheckWhenEmbargoTimeComplete(embargoElements));
        hourSelect?.addEventListener('change', () => autoCheckWhenEmbargoTimeComplete(embargoElements));
        minuteSelect?.addEventListener('change', () => autoCheckWhenEmbargoTimeComplete(embargoElements));
    };

    if (embargoButton) {
        embargoButton.addEventListener('click', (event) => {
            event.preventDefault();
            embargoBox?.classList.toggle('d-none');
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', (event) => {
            event.preventDefault();
            resetEmbargoField(dPlus);
            resetEmbargoField(d);
            uncheckTransmissionOptions(['ext-d-plus-flag', 'ext-d-flag', 'ext-hts-flag', 'ext-portal-flag']);
            updateEmbargoButtonState();
        });
    }

    dPlus.checkbox?.addEventListener('change', () => {
        syncTransmissionOptionsByEmbargo(dPlus, ['ext-d-plus-flag']);
        updateEmbargoButtonState();
    });
    d.checkbox?.addEventListener('change', () => {
        syncTransmissionOptionsByEmbargo(d, ['ext-d-flag', 'ext-hts-flag', 'ext-portal-flag']);
        updateEmbargoButtonState();
    });
    bindAutoCheckEvents(dPlus);
    bindAutoCheckEvents(d);
    bindDependentReleaseOptionEvents();

    updateEmbargoButtonState();
}

/**
 * 기사상세 로드시
 */
export function bindEmbargoDataFromDetail(data) {
    const embargoBox = document.querySelector('.embargo-box');
    const embargoNotice = document.getElementById('embargo-notice');
    const embargoMessages = [];

    // --- helpers ---
    function hasOption(selectEl, value2digits) {
        const v = String(value2digits).padStart(2, '0');
        return [...selectEl.options].some(opt => opt.value === v);
    }

    // 새 값을 option으로 보장하고 선택까지 수행
    // ❗ systemReserved=true 는 "새로 추가되는 경우에만" disabled로 추가 (기존 option은 건드리지 않음)
    function ensureSelectValue(selectEl, value2digits, { systemReserved = false } = {}) {
        const v = String(value2digits).padStart(2, '0');
        let option = [...selectEl.options].find(opt => opt.value === v);
        if (!option) {
            option = document.createElement('option');
            option.value = v;
            option.textContent = v;
            if (systemReserved) option.disabled = true; // 새로 추가될 때만 비활성화
            selectEl.appendChild(option);
        }
        selectEl.value = v; // 로직상 자동 선택
        return v;
    }

    function applyEmbargoData({
                                  releaseAt,
                                  releaseScheduleTime,
                                  dateInputName,
                                  hourId,
                                  minuteId,
                                  checkboxId,
                                  label
                              }) {
        const dateInput = document.querySelector(`input[name="${dateInputName}"]`);
        const hourSelect = document.getElementById(hourId);
        const minuteSelect = document.getElementById(minuteId);
        const checkbox = document.getElementById(checkboxId);
        const fpInstance = getFlatpickerInstance(dateInput);

        // 이미 출고된 경우 비활성화
        if (releaseAt) {
            fpInstance.set('clickOpens', false);
            dateInput.disabled = true;
            hourSelect.disabled = true;
            minuteSelect.disabled = true;
            checkbox.disabled = true;
            embargoMessages.push(label);
        }

        if (releaseScheduleTime) {
            const dt = new Date(releaseScheduleTime);
            fpInstance.setDate(dt, true);

            // 시: 기본 option(00~24) 외 값이 들어올 가능성 거의 없지만 동일 로직으로 처리
            const hh = ensureSelectValue(hourSelect, dt.getHours(), { systemReserved: false });

            // 분: 42, 57 등 5분 단위 외 값이 들어올 수 있음
            // 기존 option에 없으면 "시스템 예약"으로 비활성화된 option을 추가(표시는 되지만 사용자는 선택 불가)
            const minuteExists = hasOption(minuteSelect, dt.getMinutes());
            const mm = ensureSelectValue(minuteSelect, dt.getMinutes(), { systemReserved: !minuteExists });

            checkbox.checked = true;

            // original dataset 설정 (local 날짜 기준)
            const yyyy = dt.getFullYear();
            const mmMonth = (dt.getMonth() + 1).toString().padStart(2, '0');
            const dd = dt.getDate().toString().padStart(2, '0');
            dateInput.dataset.original = `${yyyy}-${mmMonth}-${dd}`;
            hourSelect.dataset.original = hh;
            minuteSelect.dataset.original = mm;
            checkbox.dataset.original = "true";
        }

        return !!releaseScheduleTime;
    }

    function disableEmbargoField({
                                     dateInputName,
                                     hourId,
                                     minuteId,
                                     checkboxId,
                                     clear = false
                                 }) {
        const dateInput = document.querySelector(`input[name="${dateInputName}"]`);
        const hourSelect = document.getElementById(hourId);
        const minuteSelect = document.getElementById(minuteId);
        const checkbox = document.getElementById(checkboxId);
        const fpInstance = getFlatpickerInstance(dateInput);

        if (clear) {
            resetEmbargoField({
                checkbox,
                dateInput,
                hourSelect,
                minuteSelect,
                flatpickrInstance: fpInstance
            });
        }

        fpInstance?.set('clickOpens', false);
        if (dateInput) dateInput.disabled = true;
        if (hourSelect) hourSelect.disabled = true;
        if (minuteSelect) minuteSelect.disabled = true;
        if (checkbox) checkbox.disabled = true;
    }

    // D+ 엠바고
    const hasDPlus = applyEmbargoData({
        releaseAt: data.plusReleasedAt,
        releaseScheduleTime: data.plusReleaseScheduleTime,
        dateInputName: 'd-plus-embargo-date',
        hourId: 'd-plus-embargo-hour',
        minuteId: 'd-plus-embargo-minute',
        checkboxId: 'd-plus-embargo-check',
        label: 'D+'
    });

    // D(회원) 이미 출고된 경우도 엠바고 수정 불가
    const hasDMember = applyEmbargoData({
        releaseAt: data.memberReleasedAt,
        releaseScheduleTime: data.memberReleaseScheduleTime==null ? data.releaseScheduleTime : data.memberReleaseScheduleTime,
        dateInputName: 'd-embargo-date',
        hourId: 'd-embargo-hour',
        minuteId: 'd-embargo-minute',
        checkboxId: 'd-embargo-check',
        label: 'D(회원)'
    });

    // D 엠바고
    const hasD = applyEmbargoData({
        releaseAt: data.releasedAt,
        releaseScheduleTime: data.memberReleaseScheduleTime==null ? data.releaseScheduleTime : data.memberReleaseScheduleTime,
        dateInputName: 'd-embargo-date',
        hourId: 'd-embargo-hour',
        minuteId: 'd-embargo-minute',
        checkboxId: 'd-embargo-check',
        label: 'D'
    });

    const cannotScheduleDPlusAfterDRelease = Boolean(data.releasedAt || data.memberReleasedAt) && !data.plusReleasedAt;
    if (cannotScheduleDPlusAfterDRelease) {
        disableEmbargoField({
            dateInputName: 'd-plus-embargo-date',
            hourId: 'd-plus-embargo-hour',
            minuteId: 'd-plus-embargo-minute',
            checkboxId: 'd-plus-embargo-check',
            clear: true
        });
    }

    // 엠바고 설정 제한 안내
    if (embargoMessages.length > 0 && embargoNotice) {
        embargoNotice.textContent = `※ ${embargoMessages.join(', ')}에 출고된 기사는 엠바고 설정을 변경할 수 없습니다.`;
        embargoNotice.style.display = 'block';

        // D, D+ 두개 다 이미 출고된 경우 초기화 버튼 동작하지 못하도록 처리
        if (embargoMessages.length >= 2) {
            // 초기화 버튼도 diable 처리
            const clearBtn = document.getElementById("embargo-clear");
            clearBtn.disabled = true;
            // 글자색만 강제로 살리기
            clearBtn.style.color = "#222";       // 원하는 색
            clearBtn.style.opacity = "0.65";     // Bootstrap 기본 회색 처리 유지
            clearBtn.style.pointerEvents = "none"; // 클릭 차단
        }
    }

    if (cannotScheduleDPlusAfterDRelease && embargoNotice) {
        const dPlusRestrictionMessage = 'D에 출고되고 D+에 출고되지 않은 기사는 D+ 예약출고를 설정할 수 없습니다.';
        embargoNotice.textContent = embargoNotice.textContent
            ? `${embargoNotice.textContent}\n※ ${dPlusRestrictionMessage}`
            : `※ ${dPlusRestrictionMessage}`;
        embargoNotice.style.whiteSpace = 'pre-line';
        embargoNotice.style.display = 'block';
    }

    // 버튼 상태 및 엠바고 박스 노출
    updateEmbargoButtonState();
    if ((hasDPlus || hasD) && embargoBox) {
        embargoBox.classList.remove('d-none');
    }
}

export function bindForceUnlockButtonClick() {
    document.addEventListener('click', async function (e) {
        const button = e.target.closest('.btn-force-unlock');
        if (!button) return;

        const articleId = document.getElementById('articleId').value;
        if (!articleId) {
            alert('기사 ID가 없습니다.');
            return;
        }

        try {
            const url = `/api/articles/${articleId}/editing-user/force`;
            const res = await postWithCsrf(url);
            const result = await res.json();

            if (result.data) {
                // 성공 시 페이지 새로고침 또는 수정 페이지 이동 등
                const query = window.location.search || '';
                window.location.href = `/article/${articleId}/edit${query}`;
            } else {
                alert(`강제 해제 실패: ${result.message}`);
            }
        } catch (error) {
            console.error('강제 해제 중 오류:', error);
            alert('강제 해제 요청 중 오류가 발생했습니다.');
        }
    });
}

export function initOffCanvasEvent() {
    const form = document.querySelector('.comment-area-box');
    const memoInsertButton = form.querySelector('.btn-insert-memo');
    const memoTextarea = form.querySelector('textarea[name="memo-text"]');
    const timeline = document.querySelector('.memo-box .time-line');

    const articleId = document.getElementById('articleId').value;

    // 1️⃣ 메모 버튼 클릭 시 실행되는 공통 로직
    memoInsertButton.addEventListener('click', async () => {
        const content = memoTextarea.value.trim();
        if (!content) {
            alert('메모 내용을 입력해주세요.');
            return;
        }

        try {
            const res = await postWithCsrf(`/api/articles/${articleId}/memo`, {
                memo: content
            });

            memoTextarea.value = '';
            const result = await res.json();
            const data = result.data;

            // '메모가 없습니다' 안내 제거
            const emptyMsg = timeline.querySelector('.text-muted.p-3');
            if (emptyMsg) {
                timeline.removeChild(emptyMsg);
            }

            const commentEl = document.createElement('div');
            commentEl.className = 'd-flex bg-body-tertiary rounded-3 p-2 my-2';
            commentEl.innerHTML = `
                <img src="${data.profileImg}"
                     class="me-2 rounded-circle"
                     height="30"
                     alt="${data.actionUserName}" />
                <div class="w-100">
                    <h5 class="mt-0 mb-0">
                        <span class="float-end text-muted">${formatMemoCreatedAt(data.createdAt)}</span>
                        <span class="fw-bolder">${data.actionUserName}</span>님
                    </h5>
                    <p class="mt-1 mb-0 text-muted">${data.memo || ''}</p>
                </div>
            `;
            // 작성한 메모 추가
            timeline.prepend(commentEl);

            // 메모 버튼 숫자 동기화
            const countSpan = document.getElementById('memoCount');
            if (countSpan) {
                const currentCount = parseInt(countSpan.textContent, 10) || 0;
                countSpan.textContent = currentCount + 1;
            }

        } catch (error) {
            console.error('메모 작성 실패:', error);
            alert('메모 저장 중 오류가 발생했습니다.');
        }
    });

    // 2️⃣ btn-memo 클릭 시 메모 목록 로딩
    document.addEventListener('click', async (event) => {
        const target = event.target.closest('.btn-editor-memo');
        if (!target) return;

        event.preventDefault();

        timeline.innerHTML = '';
        memoTextarea.value = '';

        try {
            const response = await fetch(`/api/editor/${articleId}/history`);

            const result = await response.json();
            const data = result.data;
            console.log(data);

            if (!Array.isArray(data) || data.length === 0) {
                timeline.innerHTML = `<div class="text-muted p-3">메모가 없습니다.</div>`;
                return;
            }

            for (const item of data) {
                if (item.action==='메모') {
                    timeline.appendChild(getMemoElement(item));
                } else {
                    timeline.appendChild(getActionElement(item));
                }
            }
            initCompareButtonEvent();
        } catch (error) {
            console.error('메모 로딩 실패:', error);
            timeline.innerHTML = `<div class="text-danger p-3">메모를 불러오는 중 오류가 발생했습니다.</div>`;
        }
    });
}

function getMemoElement(item) {
    const commentEl = document.createElement('div');
    commentEl.className = 'd-flex bg-body-tertiary rounded-3 p-2 my-2';
    commentEl.innerHTML = `
                    <img src="${item.profileImg}"
                         class="me-2 rounded-circle"
                         height="30"
                         alt="${item.actionUserName}" />
                    <div class="w-100">
                        <h5 class="mt-0 mb-0">
                            <span class="float-end text-muted">${formatMemoCreatedAt (item.createdAt)}</span>
                            <span class="fw-bolder">${item.actionUserName}</span>님
                        </h5>
                        <p class="mt-1 mb-0 text-muted">${item.memo || ''}</p>
                    </div>
                `;
    return commentEl;
}

function getActionElement(item) {
    const checkboxIdPrefix = 'history-ckBox';
    const id = `${checkboxIdPrefix}-${item.id}`;
    const dateStr = formatMemoCreatedAt(item.createdAt);
    const action = item.action || '';
    const user = item.actionUserName || '';
    const docId = `${item.id}`;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isDisabled = (action !== '작성' && action !== '수정') || isMobile;
    const isCheckedAllowed = !isDisabled;

    const wrapper = document.createElement('div');
    wrapper.className = `form-check mt-2 ${isDisabled ? ' disabled' : ''}`;

    // 👇 구조를 명확하게 보기 좋게 작성
    wrapper.innerHTML = `
        <input 
            type="checkbox"
            id="${id}"
            class="form-check-input ${isCheckedAllowed ? 'compare-checkbox' : ''}"
            ${isCheckedAllowed ? `data-doc-id="${docId}"` : 'disabled'}>
        
        <label class="form-check-label" for="${id}">
            <span class="fw-bolder">${user}</span> 님 ${action}
        </label>

        <span class="float-end">${dateStr}</span>
    `;

    return wrapper;
}

export function initArticleTitleColorPicker() {
    //--------------------------- 제목 색상 변경 ---------------------------//
    const articleTitleInput = document.getElementById('article_title');
    const selectedColorInput = document.getElementById('selected-color-value');
    const colorPickerButton = document.querySelector('.color-picker-button');
    // 초기 색상 설정
    const initialColor = selectedColorInput.value || '#222222';

    articleTitleInput.style.color = initialColor;
    colorPickerButton.style.backgroundColor = initialColor;
    // 초기화
    const pickr = Pickr.create({
        el: '.color-picker-button',
        theme: 'classic',
        default: initialColor,
        swatches: [
            '#e31e2f',
            '#ce8240',
            '#11a74d',
            '#017acd',
            '#222222',
            '#555555',
            '#999999',
            '#ccced1',
        ],
        components: {
            preview: false,
            opacity: false,
            hue: false,
            interaction: {
                hex: false,
                rgba: false,
                hsla: false,
                input: false,
                clear: false,
                save: false
            }
        }
    });
    // Pickr 이벤트
    pickr.on('change', (color, source, instance) => {
        const hexColor = color.toHEXA().toString();
        selectedColorInput.value = hexColor;
        articleTitleInput.style.color = hexColor;
        instance.setColor(hexColor);
    });
    pickr.on('init', instance => {
        colorPickerButton.style.backgroundColor = instance.getColor() ? instance.getColor().toHEXA().toString() : '';
    })
    pickr.on('hide', instance => {
        colorPickerButton.style.backgroundColor = instance.getColor() ? instance.getColor().toHEXA().toString() : '';
    });
}

export function initAutoResizeTextArea() {
    //--------------------------- 제목, 부제목 textarea 단락 높이 ---------------------------//
    const textareas = document.querySelectorAll('.all_textarea');

    // 1) 공통: 자동 리사이즈 함수
    function autoResize(el) {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    }

    textareas.forEach((ta) => {
        // 입력 시
        ta.addEventListener('input', () => autoResize(ta));
        // 초기 1회 (내용이 이미 있을 때)
        requestAnimationFrame(() => autoResize(ta));
    });
}

export function initArticleTitleCharacterCount() {
    const articleTitleInput = document.getElementById('article_title');
    if (!articleTitleInput || articleTitleInput.dataset.characterCountBound === '1') {
        return;
    }

    const characterCount = document.createElement('span');
    characterCount.className = 'article-title-character-count input-group-text bg-transparent text-body-secondary px-2';
    characterCount.setAttribute('aria-live', 'polite');

    const updateCharacterCount = () => {
        characterCount.textContent = Array.from(articleTitleInput.value).length;
    };

    articleTitleInput.dataset.characterCountBound = '1';
    articleTitleInput.insertAdjacentElement('afterend', characterCount);
    articleTitleInput.addEventListener('input', updateCharacterCount);
    updateCharacterCount();
}



export function bindActionBtnClickEventInEditor() {
    document.addEventListener('click', async (e) => {
        const target = e.target;

        const handlers = {
            'btn-release-in-editor': () => handleReleaseInEditor(),
            'btn-reject-in-editor': () => handleChangeStateInEditor('REJECT', '반려'),
            'btn-delete-in-editor': () => handleDeleteInEditor(),
        };

        Object.keys(handlers).forEach((cls) => {
            // 버튼 또는 버튼 내부 요소 클릭 모두 인식
            if (target.closest(`.${cls}`)) {
                blurActiveTextarea()
                handlers[cls]();
            }
        });
    });
}

// 현재 작성된 기사 상태 저장
async function saveCurrContents(action = '') {
    const articleId = document.getElementById('articleId').value;

    // 반려인 경우 검증 제외
    if (action!=='REJECT' && !validateArticleForm()) {
        // 검증 실패는 진행 중단 신호
        throw new Error('폼 검증 실패');
    }

    const dto = buildUpdatedArticleDto();
    dto.keepEditingLock = true;

    try {
        const response = await patchWithCsrf(`/api/articles/${articleId}`, dto);
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                window.removeEventListener('beforeunload', handleBeforeUnload); // 화면 이탈 경고 제거
                return dto;
            } else {
                if (handleEditingLockLostInEditor(result.message)) {
                    throw new Error(EDITING_LOCK_LOST_REDIRECT_ERROR);
                }
                alert(result.message);
                throw new Error(result.message);
            }
        } else {
            const errorTxt = await response.text();
            alert('수정 실패: ' + errorTxt);
            throw new Error(errorTxt);
        }
    } catch (err) {
        if (err.message === EDITING_LOCK_LOST_REDIRECT_ERROR) {
            throw err;
        }
        alert('수정 에러 발생: ' + err.message);
        throw err;
    }
}


// 출고 버튼 클릭
export async function handleReleaseInEditor() {
    let dto;
    try {
        dto = await saveCurrContents();
    } catch {
        // 저장 실패면 이후 로직 진행 금지
        return;
    }

    const caseInput = {
        extDFlag: dto.extDFlag,
        extDPlusFlag: dto.extDPlusFlag,
        delayedRelease: dto.delayedRelease,
        releaseScheduleTime: dto.releaseScheduleTime,
        plusReleaseScheduleTime: dto.plusReleaseScheduleTime
    };
    const policyCase = dto.immediateRelease ? null : getArticleReleasePolicyCase(caseInput);

    const modal = document.getElementById('modal-release-box');
    modal.querySelector('.card-title').textContent = dto.title || '';
    modal.querySelector('.card-sub-title').textContent = dto.subTitle || '';
    const modalReleaseContentEl = document.getElementById('release-box-content');

    // 101: 보도자료, 125: 공시모음, 52: 인사부고, 124: 뉴스모음
    const EXCEPTION_CATEGORY_IDS = ["101", "125", "52", "124"];
    dto.hasExceptionCategory = Array
        .from(document.querySelectorAll('.category-selector-box .depth2'))
        .some(selectEl => EXCEPTION_CATEGORY_IDS.includes(selectEl.value));

    const releasePlan = getExpectedReleasePlanInEditor(policyCase, dto);
    modalReleaseContentEl.innerHTML = renderBadge(releasePlan);

    const instance = bootstrap.Modal.getOrCreateInstance(modal);
    instance.show();

    // 확인/취소 버튼 핸들링 (한 번만 바인딩되도록 once)
    const btnConfirm = modal.querySelector('[data-role="confirm-release"]');
    const btnCancel = modal.querySelector('[data-role="cancel-release"], .btn-close');

    // 이전에 붙은 리스너가 중복 실행되지 않도록 once 사용
    btnConfirm?.addEventListener('click', async () => {
        await handleChangeStateInEditor('RELEASE', '출고', { skipSave: true });
        instance.hide();
    }, {once: true});

    btnCancel?.addEventListener('click', () => {
        window.location.reload();
        instance.hide();
    }, {once: true});
}

export async function handleChangeStateInEditor(action, actionName, options = {}) {
    if (!options.skipSave) {
        try {
            await saveCurrContents(action);
        } catch {
            // 저장 실패면 이후 로직 진행 금지
            return;
        }
    }

    try {
        const articleId = document.getElementById('articleId').value;
        const res = await postWithCsrf(`/api/articles/${articleId}/state`, { action });
        const result = await res.json();

        if (result.success) {
            redirectToEditorReturnUrl();
        } else {
            alert(`${actionName} 실패\n${result.message}`);
            // 현재 페이지 새로고침
            window.location.reload();
        }
    } catch (err) {
        console.error(`${actionName} 오류\n`, err);
        alert(`${actionName} 요청 중 오류 발생`);
        // 현재 페이지 새로고침
        window.location.reload();
    }
}

// 삭제버튼 클릭
function getSafeReturnUrl() {
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get('returnUrl');
    return returnUrl && returnUrl.startsWith('/') ? returnUrl : null;
}

function redirectToEditorReturnUrl() {
    const safeReturnUrl = getSafeReturnUrl();
    if (safeReturnUrl) {
        window.location.href = safeReturnUrl;
        return;
    }

    const referrer = document.referrer;
    if (referrer) {
        window.location.href = referrer;
        return;
    }

    window.location.href = '/desk/article';
}

const EDITING_LOCK_LOST_MESSAGE = '다른 사용자에 의해 편집(수정)상태가 강제해제되어 내용을 수정할 수 없습니다.';
const EDITING_LOCK_EXPIRED_MESSAGE = "다른 사용자가 이미 수정한 기사입니다. 현재 화면에서는 수정할 수 없습니다.\n" + "편집 화면에 다시 진입해 주세요.";
const EDITING_LOCK_LOST_REDIRECT_ERROR = 'EDITING_LOCK_LOST_REDIRECT';

function handleEditingLockLostInEditor(message) {
    if (message !== EDITING_LOCK_LOST_MESSAGE && message !== EDITING_LOCK_EXPIRED_MESSAGE) {
        return false;
    }

    alert(message);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    redirectToEditorReturnUrl();
    return true;
}

async function handleDeleteInEditor() {
    if (!confirm('정말로 이 기사를 삭제하시겠습니까?')) return;

    const articleId = document.getElementById('articleId').value;

    try {
        const url = `/api/articles/${articleId}`;
        const res = await deleteWithCsrf(url);
        const result = await res.json();
        if (result.success) {
            window.location.href = '/desk/article';
        } else {
            alert(`삭제 실패\n${result.message}`);
            // 현재 페이지 새로고침
            window.location.reload();
        }
    } catch (err) {
        console.error('삭제 요청 실패\n', err);
        alert('삭제 중 오류가 발생했습니다.');
        // 현재 페이지 새로고침
        window.location.reload();
    }
}

export function blurActiveTextarea() {
    // 현재 포커스 된 요소가 textarea라면 포커스 해제
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') {
        document.activeElement.blur();
    }
}

// 출고 예상 계획
export function getExpectedReleasePlanInEditor (policyCase, rowData) {
    const hasExceptionCategory = rowData.hasExceptionCategory;
    const now = new Date();

    // 예상 출고 계획
    const plan = {
        releasedAt: null,
        memberReleasedAt: null,
        plusReleasedAt: null,
        releaseScheduleTime: null,
        memberReleaseScheduleTime: null,
        plusReleaseScheduleTime: null,
        extDFlag: rowData.extDFlag,
        extDPlusFlag: rowData.extDPlusFlag,
        extHtsFlag: rowData.extHtsFlag,
        extPortalFlag: rowData.extPortalFlag,
    };

    if (rowData.immediateRelease) {
        plan.releasedAt = now;
        plan.memberReleasedAt = now;
        plan.plusReleasedAt = now;
        plan.releaseScheduleTime = null;
        plan.memberReleaseScheduleTime = null;
        plan.plusReleaseScheduleTime = null;
        plan.extDFlag = true;
        plan.extDPlusFlag = true;
        return plan;
    }

    // console.log(plan);

    switch (policyCase) {
        case 'D_AND_DPLUS_WITH_DELAY_WITH_BOTH_EMBARGOES':
            // D, D+ 출고 / 지연출고 O / D 엠바고 O / D+ 엠바고 O
            plan.releasedAt = null;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = null;
            plan.plusReleaseScheduleTime = rowData.plusReleaseScheduleTime;
            if (hasExceptionCategory) {
                plan.memberReleaseScheduleTime = null;
                plan.releaseScheduleTime = rowData.releaseScheduleTime;
            } else {
                plan.memberReleaseScheduleTime = rowData.releaseScheduleTime;
                plan.releaseScheduleTime = addHours(rowData.releaseScheduleTime, 1);
            }
            break;

        case 'D_AND_DPLUS_WITH_DELAY_WITH_DPLUS_EMBARGO_ONLY':
            // D, D+ 출고 / 지연출고 O / D 엠바고 X / D+ 엠바고 O
            plan.releasedAt = null;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = null;
            plan.plusReleaseScheduleTime = rowData.plusReleaseScheduleTime;
            if (hasExceptionCategory) {
                plan.memberReleaseScheduleTime = null;
                plan.releaseScheduleTime = addHours(rowData.plusReleaseScheduleTime, 1);
            } else {
                plan.memberReleaseScheduleTime = addHours(rowData.plusReleaseScheduleTime, 1);
                plan.releaseScheduleTime = addHours(rowData.plusReleaseScheduleTime, 2);
            }
            break;

        case 'D_AND_DPLUS_WITH_DELAY_WITH_D_EMBARGO_ONLY':
            // D, D+ 출고 / 지연출고 O / D 엠바고 O / D+ 엠바고 X
            plan.releasedAt = null;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = now;
            plan.plusReleaseScheduleTime = null;
            if (hasExceptionCategory) {
                plan.memberReleaseScheduleTime = null;
                plan.releaseScheduleTime = rowData.releaseScheduleTime;
            } else {
                plan.memberReleaseScheduleTime = rowData.releaseScheduleTime;
                plan.releaseScheduleTime = addHours(rowData.releaseScheduleTime, 1);
            }
            break;

        case 'D_AND_DPLUS_WITH_DELAY_WITHOUT_EMBARGOES':
            // D, D+ 출고 / 지연출고 O / D 엠바고 X / D+ 엠바고 X
            plan.releasedAt = null;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = true;
            plan.plusReleaseScheduleTime = now;
            if (hasExceptionCategory) {
                plan.memberReleaseScheduleTime = null;
                plan.releaseScheduleTime = addHours(now, 1);
            } else {
                plan.memberReleaseScheduleTime = addHours(now, 1);
                plan.releaseScheduleTime = addHours(now, 2);
            }
            break;

        case 'D_AND_DPLUS_WITHOUT_DELAY_WITH_BOTH_EMBARGOES':
            // D, D+ 출고 / 지연출고 X / D 엠바고 O / D+ 엠바고 O
            plan.releasedAt = null;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = null;
            plan.plusReleaseScheduleTime = rowData.plusReleaseScheduleTime;
            if (hasExceptionCategory) {
                plan.memberReleaseScheduleTime = null;
                plan.releaseScheduleTime = rowData.releaseScheduleTime;
            } else {
                plan.memberReleaseScheduleTime = rowData.releaseScheduleTime;
                plan.releaseScheduleTime = rowData.releaseScheduleTime;
            }
            break;

        case 'D_AND_DPLUS_WITHOUT_DELAY_WITH_DPLUS_EMBARGO_ONLY':
            // D, D+ 출고 / 지연출고 X / D 엠바고 X / D+ 엠바고 O
            plan.releasedAt = null;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = null;
            plan.plusReleaseScheduleTime = rowData.plusReleaseScheduleTime;
            if (hasExceptionCategory) {
                plan.memberReleaseScheduleTime = null;
                plan.releaseScheduleTime = addHours(rowData.plusReleaseScheduleTime, 1);
            } else {
                plan.memberReleaseScheduleTime = addHours(rowData.plusReleaseScheduleTime, 1);
                plan.releaseScheduleTime = addHours(rowData.plusReleaseScheduleTime, 1);
            }
            break;

        case 'D_AND_DPLUS_WITHOUT_DELAY_WITH_D_EMBARGO_ONLY':
            // D, D+ 출고 / 지연출고 X / D 엠바고 O / D+ 엠바고 X
            plan.releasedAt = null;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = now;
            plan.plusReleaseScheduleTime = null;
            if (hasExceptionCategory) {
                plan.memberReleaseScheduleTime = null;
                plan.releaseScheduleTime = rowData.releaseScheduleTime;
            } else {
                plan.memberReleaseScheduleTime = rowData.releaseScheduleTime;
                plan.releaseScheduleTime = rowData.releaseScheduleTime;
            }
            break;

        case 'D_AND_DPLUS_WITHOUT_DELAY_WITHOUT_EMBARGOES':
            // D, D+ 출고 / 지연출고 X / D 엠바고 X / D+ 엠바고 X
            plan.releasedAt = null;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = true;
            plan.plusReleaseScheduleTime = now;
            if (hasExceptionCategory) {
                plan.memberReleaseScheduleTime = null;
                plan.releaseScheduleTime = addHours(now, 1);
            } else {
                plan.memberReleaseScheduleTime = addHours(now, 1);
                plan.releaseScheduleTime = addHours(now, 1);
            }
            break;

        case 'DPLUS_ONLY_WITH_EMBARGO':
            // D+만 출고 / 지연출고 의미 없음 (항상 X) / D+ 엠바고 O
            plan.releasedAt = null;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = null;
            plan.releaseScheduleTime = null;
            plan.memberReleaseScheduleTime = null;
            plan.plusReleaseScheduleTime = rowData.plusReleaseScheduleTime;
            break;

        case 'DPLUS_ONLY_WITHOUT_EMBARGO':
            // D+만 출고 / 지연출고 의미 없음 (항상 X) / D 엠바고 X
            plan.releasedAt = null;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = true;
            plan.releaseScheduleTime = null;
            plan.memberReleaseScheduleTime = null;
            plan.plusReleaseScheduleTime = now;
            break;

        case 'D_ONLY_WITH_EMBARGO':
            // D만 출고 / 지연출고 의미 없음 (항상 X) / D 엠바고 O
            plan.releasedAt = null;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = null;
            plan.releaseScheduleTime = rowData.releaseScheduleTime;
            plan.memberReleaseScheduleTime = null;
            plan.plusReleaseScheduleTime = null;
            break;

        case 'D_ONLY_WITHOUT_EMBARGO':
            // D만 출고 / 지연출고 의미 없음 (항상 X) / D 엠바고 X
            plan.releasedAt = true;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = null;
            plan.releaseScheduleTime = now;
            plan.memberReleaseScheduleTime = null;
            plan.plusReleaseScheduleTime = null;
            break;

        case 'HTS_ONLY_WITH_EMBARGO':
            plan.releasedAt = null;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = null;
            plan.releaseScheduleTime = rowData.releaseScheduleTime;
            plan.memberReleaseScheduleTime = null;
            plan.plusReleaseScheduleTime = null;
            break;

        case 'HTS_ONLY_WITHOUT_EMBARGO':
            plan.releasedAt = null;
            plan.memberReleasedAt = null;
            plan.plusReleasedAt = null;
            plan.releaseScheduleTime = null;
            plan.memberReleaseScheduleTime = null;
            plan.plusReleaseScheduleTime = null;
            break;

        default:
            console.error('출고 정책을 판별할 수 없습니다.');
    }
    return plan;
}


let previewListenerBoundInEditor = false;

export function showArticlePreviewBeforeSave() {
    if (previewListenerBoundInEditor) return; // 이미 등록했으면 패스
    previewListenerBoundInEditor = true;
    // console.log("showArticlePreview");

    document.addEventListener('click', async (e) => {
        // .article-preview-trigger 클래스만 있으면 반응
        const trigger = e.target.closest(".article-preview-trigger-in-editor");
        if (!trigger) return;

        e.preventDefault();

        const modalEl = document.getElementById('view-modal');
        if (!modalEl) {
            console.warn('#view-modal 엘리먼트를 찾을 수 없습니다.');
            return
        }

        const payload = getSaveArticleDto(null);

        const res = await postWithCsrf(`/api/articles/preview`, payload);
        const result = await res.json();

        if (!res.ok) {
            alert(result.message);
            return;
        }

        const data = result.data || [];
        // console.log(data);

        // ✅ 모달 엘리먼트에 워터마크 필요 여부를 데이터 속성으로 저장
        modalEl.dataset.hasWatermark = (data.hasWatermark === true).toString();

        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

        // console.log(data);
        loadPreviewData(modalEl, data);

        //테이블 셀의 인라인 스타일(배경색) 보정 함수 호출
        applyInlineStylesToPreview(modalEl);

        initPreviewViewSizeToggle();
        modal.show();
    });

}
