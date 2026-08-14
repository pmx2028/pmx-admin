import {resetStock1Modal} from "./modal-stock-utils.js";
import {loadDataTable} from "../common/datatable-handler.js";

export function bindAutoHashtagDebounce() {
    const autoHashtagDebounced = debounce(() => {
        void getAutoHashtag();
    }, 2000);

    window.mainEditor.model.document.on('change:data', () => {
        autoHashtagDebounced();
    });
}

function stripHtmlTags(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

export async function getAutoHashtag() {
    const title = document.getElementById('article_title').value;

    const rawHtml = window.mainEditor?.getData() || '';
    const content = stripHtmlTags(rawHtml); // 태그 제거

    const MIN_CONTENT_LENGTH = 300; // 최소 글자 수

    if (content.length===0) {
        // 내용이 아예 없는 경우 해시태그 비우기
        renderAutoHashtags("");
        return;
    }

    // 글자 수 부족하면 호출 안 함
    if (content.length < MIN_CONTENT_LENGTH) {
        return;
    }

    try {
        const apiUrl = `/api/editor/hashtag/auto`;
        const dto = {
            title: title,
            content: content,
            topN: 10
        };
        const response = await postWithCsrf(apiUrl, dto);

        if (response.ok) {
            const result = await response.json();
            const data = result.data;
            renderAutoHashtags(data);
        } else {
            const error = await response.text();
            console.error(error);
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * 자동 추출 해시태그 렌더링 (문자열만 입력)
 * @param tags (문자열 또는 리스트)
 */
export function renderAutoHashtags(tags) {
    const $autoWrap = document.getElementById('hashtag-auto');

    if (!tags) {
        $autoWrap.innerHTML = '<p class="text-muted small mb-0">추출된 해시태그가 없습니다.</p>';
        return
    }

    // 문자열로 들어온 경우 쉼표로 나눠서 배열로 변환
    if (typeof tags === "string") {
        tags = tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    if (!tags.length) {
        $autoWrap.innerHTML = '<p class="text-muted small mb-0">추출된 해시태그가 없습니다.</p>';
        return
    }

    const ul = document.createElement('ul');

    tags.forEach((tag) => {
        const li = document.createElement('li');

        const item = document.createElement('div');
        item.className = 'hashtag-item';

        const textNode = document.createTextNode(tag);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-danger hide-bn';
        btn.innerHTML = '<i class="ri-close-line"></i>';
        btn.addEventListener('click', () => {
            li.remove();
        });

        item.appendChild(textNode);
        item.appendChild(document.createTextNode(' '));
        item.appendChild(btn);

        li.appendChild(item);
        ul.appendChild(li);
    });

    $autoWrap.innerHTML = '';
    $autoWrap.appendChild(ul);
}

export function removeAutoHashtag() {
    const hashtagLists = document.querySelectorAll(".hashtag-box ul, .hashtag-box1 ul");
    hashtagLists.forEach(function (hashtagList) {
        hashtagList.addEventListener("click", function (e) {
            if (e.target.closest(".hide-bn")) {
                const listItem = e.target.closest("li");
                if (listItem) {
                    const checkboxId = listItem.dataset.id;
                    listItem.remove();
                }
            }
        });
    });
}

export function searchInfographicChart() {
    const form = document.querySelector(".infographic-search form");
    const searchInput = document.querySelector("input[name='chart-search']");
    const resultBox = document.querySelector(".infographic-box");

    if (!form || !searchInput || !resultBox) return;

    // ✅ CKEditor에 이미지 삽입 유틸
    function insertImageToMainEditor(src, alt = "", code = "") {
        const editor = window.mainEditor;
        if (!editor || !src) return;

        // 포커스 이동
        editor.editing.view.focus();

        const html = `
            <figure class="image">
              <img 
                src="${src}" 
                alt="${alt || "infographic"}"
                data-role="infographic"
                data-infographic-code="${code}"
              />
            </figure>
            <p></p>
          `.trim();

        editor.model.change(() => {
            const viewFragment = editor.data.processor.toView(html);
            const modelFragment = editor.data.toModel(viewFragment);
            editor.model.insertContent(modelFragment, editor.model.document.selection);
        });
    }

    async function doSearch() {
        const keyword = searchInput.value.trim();
        if (!keyword) {
            resultBox.innerHTML = ``;
            return;
        }

        try {
            const response = await fetch(`/api/editor/chart/search?keyword=${encodeURIComponent(keyword)}`);
            if (!response.ok) throw new Error("API 요청 실패");

            const result = await response.json();
            const data = result.data;

            // 결과 영역 초기화
            resultBox.innerHTML = "";

            if (!data || data.length === 0) {
                resultBox.innerHTML = `<p class="small text-muted mb-0">검색 결과가 없습니다.</p>`;
                return;
            }

            // 리스트 래퍼
            const borderDiv = document.createElement("div");
            borderDiv.className = "border overflow-auto";

            const ul = document.createElement("ul");
            ul.className = "list-group list-group-flush";

            data.forEach((item, index) => {
                const li = document.createElement("li");
                li.className = "list-group-item form-checkbox-primary";

                const input = document.createElement("input");
                input.type = "radio";
                input.className = "form-check-input me-1";
                input.name = "flexRadioDefault";
                input.id = `flexRadio${index}`;

                const label = document.createElement("label");
                label.className = "form-check-label text-truncate";
                label.setAttribute("for", input.id);
                label.textContent = item.name;

                const previewLink = document.createElement("a");
                previewLink.className = "link-info text-decoration-underline float-end";
                previewLink.textContent = "미리보기";

                const chartUrl = `${window.APP_CONFIG.dUrl}/infographic/news/${item.code}`;
                previewLink.href = chartUrl;

                // 라디오 선택 시 에디터에 이미지 삽입
                input.addEventListener("change", () => {
                    if (!input.checked) return;
                    // item.imageUrl 이 API에서 내려온다고 가정
                    const imageUrl = item.imageUrl;
                    if (!imageUrl) {
                        console.warn("인포그래픽 이미지 URL을 찾을 수 없습니다.");
                        return;
                    }
                    insertImageToMainEditor(imageUrl, item.name, item.code);

                    // 검색창/리스트 초기화
                    searchInput.value = "";
                    resultBox.innerHTML = "";
                });

                // 미리보기 팝업
                previewLink.addEventListener("click", (e) => {
                    e.preventDefault();

                    const popupWidth = 800;
                    const popupHeight = 650;

                    // 화면 가운데 계산
                    const left = (window.screen.width / 2) - (popupWidth / 2);
                    const top = (window.screen.height / 2) - (popupHeight / 2);

                    window.open(
                        chartUrl,
                        "infographicPopup",
                        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=no,resizable=no`
                    );
                });

                li.appendChild(input);
                li.appendChild(label);
                li.appendChild(previewLink);
                ul.appendChild(li);
            });

            borderDiv.appendChild(ul);
            resultBox.appendChild(borderDiv);

        } catch (err) {
            console.error(err);
            alert("검색 중 오류가 발생했습니다.");
        }
    }

    // 버튼 클릭 or 엔터 입력
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // 새로고침 방지
        void doSearch();
    });

    const searchBtn = form.querySelector(".btn-chart-search");
    if (searchBtn) {
        searchBtn.addEventListener("click", (e) => {
            e.preventDefault();
            void doSearch();
        });
    }
}

export function searchCandidateRelatedArticles() {
    const form = document.querySelector(".related-article-search form");
    const searchInput = document.querySelector("input[name='related-article-search']");
    const sourceTypeSelect = document.querySelector("select[name='related-article-source-type']");
    const resultBox = document.querySelector(".related-article-box");
    const selectedList = document.querySelector(".list-box2 .list-group");
    const PAGE_SIZE = 50;

    if (!form || !searchInput || !resultBox || !selectedList) return;

    const searchState = {
        keyword: "",
        sourceType: "",
        page: 0,
        hasNext: false,
        isLoading: false,
        requestId: 0,
        listWrapper: null,
        listElement: null
    };

    // 현재 선택된 기사 id 모으기
    const getSelectedIdSet = () => new Set(
        Array.from(selectedList.querySelectorAll("li[data-id]"))
            .map(li => li.dataset.id)
    );

    function appendReleaseBadges(label, item) {
        const badgeSpecs = [];

        if (item?.plusReleasedAt) {
            badgeSpecs.push("D+");
        }
        if (item?.releasedAt) {
            badgeSpecs.push("D");
        }

        badgeSpecs.forEach((text) => {
            const badge = document.createElement("span");
            badge.className = "badge bg-light text-dark border me-1 fw-normal";
            badge.style.fontSize = "0.65rem";
            badge.style.padding = ".15rem .3rem";
            badge.textContent = text;
            label.appendChild(badge);
        });
    }

    function createRelatedArticlePreviewLink(articleId, title) {
        return `
            <span role="button"
                  class="article-preview-trigger"
                  data-article-id="${articleId}"
                  title="${escapeSuggestHtml(title)}">${escapeSuggestHtml(title)}</span>
        `.trim();
    }

    function ensureResultElements() {
        if (searchState.listWrapper && searchState.listElement) {
            return searchState;
        }

        const borderDiv = document.createElement("div");
        borderDiv.className = "border overflow-auto";
        borderDiv.style.maxHeight = "177px";

        const ul = document.createElement("ul");
        ul.className = "list-group list-group-flush";

        borderDiv.appendChild(ul);
        borderDiv.addEventListener("scroll", () => {
            const nearBottom = borderDiv.scrollTop + borderDiv.clientHeight >= borderDiv.scrollHeight - 24;
            if (!nearBottom || searchState.isLoading || !searchState.hasNext) return;
            void loadSearchPage();
        });

        resultBox.appendChild(borderDiv);

        searchState.listWrapper = borderDiv;
        searchState.listElement = ul;
        return searchState;
    }

    function clearResults() {
        resultBox.innerHTML = "";
        searchState.page = 0;
        searchState.hasNext = false;
        searchState.listWrapper = null;
        searchState.listElement = null;
    }

    function renderSearchStatus(message, {spinner = false} = {}) {
        resultBox.innerHTML = `
            <div class="border overflow-auto" style="max-height: 177px;">
                <div class="d-flex align-items-center justify-content-center text-muted small py-3">
                    ${spinner ? '<div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>' : ""}
                    <span>${message}</span>
                </div>
            </div>
        `;
    }

    function renderSearchLoading() {
        renderSearchStatus("로딩중...", {spinner: true});
    }

    function getSourceType() {
        return sourceTypeSelect?.value?.trim() ?? "";
    }

    function buildSearchUrl(keyword, page, size) {
        const params = new URLSearchParams({
            keyword,
            page: String(page),
            size: String(size)
        });
        const sourceType = getSourceType();
        if (sourceType) {
            params.set("sourceType", sourceType);
        }
        return `/api/editor/article/search?${params.toString()}`;
    }

    function appendSearchItems(items) {
        const selectedIds = getSelectedIdSet();
        const {listElement} = ensureResultElements();

        items.forEach((item) => {
            const articleId = String(item.articleId);
            if (listElement.querySelector(`input[data-article-id="${articleId}"]`)) {
                return;
            }

            const li = document.createElement("li");
            li.className = "list-group-item list-group-item-action form-checkbox-primary";

            const input = document.createElement("input");
            input.type = "checkbox";
            input.className = "form-check-input me-1";
            input.id = `${articleId}`;
            input.dataset.label = item.title ?? "";
            input.dataset.articleId = articleId;
            input.checked = selectedIds.has(articleId);

            const label = document.createElement("label");
            label.className = "form-check-label text-truncate";
            label.setAttribute("for", input.id);
            label.title = item.title ?? "";
            appendReleaseBadges(label, item);
            label.insertAdjacentHTML(
                "beforeend",
                createRelatedArticlePreviewLink(articleId, item.title ?? "")
            );

            li.appendChild(input);
            li.appendChild(label);
            listElement.appendChild(li);
        });

        initRelatedArticleSelection();
    }

    async function loadSearchPage({reset = false} = {}) {
        const keyword = searchInput.value.trim();
        const sourceType = getSourceType();
        if (!keyword) {
            clearResults();
            searchState.keyword = "";
            searchState.sourceType = sourceType;
            return;
        }

        if (searchState.isLoading) {
            return;
        }

        if (!reset && (!searchState.hasNext || searchState.keyword !== keyword || searchState.sourceType !== sourceType)) {
            return;
        }

        if (reset) {
            clearResults();
            searchState.keyword = keyword;
            searchState.sourceType = sourceType;
            searchState.page = 0;
            searchState.hasNext = false;
            renderSearchLoading();
        }

        searchState.isLoading = true;
        const requestId = ++searchState.requestId;

        try {
            const response = await fetch(buildSearchUrl(keyword, searchState.page, PAGE_SIZE));
            if (!response.ok) throw new Error("API 요청 실패");

            const result = await response.json();
            if (requestId !== searchState.requestId) {
                return;
            }

            const payload = result?.data;
            const items = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.items)
                    ? payload.items
                    : [];
            const hasNext = Array.isArray(payload)
                ? items.length === PAGE_SIZE
                : Boolean(payload?.hasNext);

            if (reset && items.length === 0) {
                renderSearchStatus("검색 결과가 없습니다.");
                return;
            }

            if (reset) {
                resultBox.innerHTML = "";
                searchState.listWrapper = null;
                searchState.listElement = null;
            }

            appendSearchItems(items);
            searchState.keyword = keyword;
            searchState.sourceType = sourceType;
            searchState.page += 1;
            searchState.hasNext = hasNext;
        } catch (err) {
            console.error(err);
            if (reset && requestId === searchState.requestId) {
                clearResults();
            }
            alert("검색 중 오류가 발생했습니다.");
        } finally {
            if (requestId === searchState.requestId) {
                searchState.isLoading = false;
            }
        }
    }

    async function doSearch() {
        const keyword = searchInput.value.trim();
        if (!keyword) {
            resultBox.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(buildSearchUrl(keyword, 0, PAGE_SIZE));
            if (!response.ok) throw new Error("API 요청 실패");

            const result = await response.json();
            const payload = result?.data;
            const data = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.items)
                    ? payload.items
                    : [];

            // 결과 영역 초기화
            resultBox.innerHTML = "";

            if (!data || data.length === 0) {
                renderSearchStatus("검색 결과가 없습니다.");
                return;
            }

            const selectedIds = getSelectedIdSet();

            // 리스트 래퍼
            const borderDiv = document.createElement("div");
            borderDiv.className = "border overflow-auto";
            borderDiv.style.maxHeight = "177px";

            const ul = document.createElement("ul");
            ul.className = "list-group list-group-flush";

            data.forEach((item) => {
                const articleId = String(item.articleId);
                const li = document.createElement("li");
                li.className = "list-group-item list-group-item-action form-checkbox-primary";

                const input = document.createElement("input");
                input.type = "checkbox";
                input.className = "form-check-input me-1";
                input.id = `${articleId}`;
                input.dataset.label = item.title ?? "";
                input.dataset.articleId = articleId;          // ✅ 선택/해제 동기화용 키
                input.checked = selectedIds.has(articleId);   // ✅ 이미 선택된 건 체크 상태로

                const label = document.createElement("label");
                label.className = "form-check-label text-truncate";
                label.setAttribute("for", input.id);
                label.title = item.title ?? "";
                appendReleaseBadges(label, item);
                label.insertAdjacentHTML(
                    "beforeend",
                    createRelatedArticlePreviewLink(articleId, item.title ?? "")
                );

                li.appendChild(input);
                li.appendChild(label);
                ul.appendChild(li);
            });

            borderDiv.appendChild(ul);
            resultBox.appendChild(borderDiv);

            initRelatedArticleSelection();

        } catch (err) {
            console.error(err);
            alert("검색 중 오류가 발생했습니다.");
        }
    }

    // 버튼 클릭 or 엔터 입력
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        void loadSearchPage({reset: true});
    });

    const searchBtn = form.querySelector(".btn-related-article-search");
    if (searchBtn) {
        searchBtn.addEventListener("click", (e) => {
            e.preventDefault();
            void loadSearchPage({reset: true});
        });
    }

}

// 관련기사 선택 이벤트 바인딩
export function initRelatedArticleSelection() {
    const resultBox = document.querySelector(".related-article-result");
    const selectedList2 = document.querySelector(".related-article-result .list-group");
    const checkboxes2 = document.querySelectorAll(".list-box .form-check-input");

    if (!resultBox || !selectedList2) return;

    // 체크박스 변경 이벤트 (중복 바인딩 방지)
    checkboxes2.forEach((checkbox) => {
        if (checkbox.dataset.bound === "1") return;
        checkbox.dataset.bound = "1";

        checkbox.addEventListener("change", function () {
            const label = this.dataset.label ?? this.nextElementSibling?.textContent?.trim() ?? "";
            const itemId = this.id;

            if (this.checked) {
                resultBox.style.display = "block";
                const listItem = document.createElement("li");
                listItem.className = "list-group-item d-flex justify-content-between align-items-center";
                listItem.dataset.id = itemId;
                listItem.innerHTML = `
                  <span role="button"
                        class="article-preview-trigger"
                        data-article-id="${itemId}">${escapeSuggestHtml(label)}</span>
                  <button type="button" class="btn btn-danger hide-bn"><i class="ri-close-line"></i></button>
                `;
                selectedList2.appendChild(listItem);
            } else {
                const itemToRemove = selectedList2.querySelector(`li[data-id="${itemId}"]`);
                if (itemToRemove) itemToRemove.remove();
                if (selectedList2.children.length === 0) resultBox.style.display = "none";
            }
        });
    });

    // 삭제 버튼 클릭 시 항목 제거 (중복 바인딩 방지)
    if (selectedList2.dataset.bound !== "1") {
        selectedList2.dataset.bound = "1";
        selectedList2.addEventListener("click", function (e) {
            const btn = e.target.closest(".hide-bn");
            if (!btn) return;

            const listItem = btn.closest("li");
            const checkboxId = listItem?.dataset.id;
            listItem?.remove();

            const checkbox = checkboxId ? document.getElementById(checkboxId) : null;
            if (checkbox) checkbox.checked = false;

            if (selectedList2.children.length === 0) resultBox.style.display = "none";
        });
    }
}

// 관련종목 리스트 검색
function ensureSubAreaSuggestList(input, listId) {
    if (!input || !listId) return null;

    let list = document.getElementById(listId);
    if (!list) {
        list = document.createElement("div");
        list.id = listId;
        list.className = "list-group d-none";
    }

    const inputGroup = input.closest(".input-group");
    const host = inputGroup?.parentElement || input.parentElement;
    if (host && list.parentElement !== host) {
        host.appendChild(list);
    }

    Object.assign(list.style, {
        position: "relative",
        width: "100%",
        zIndex: "2",
        marginTop: "4px",
        maxHeight: "240px",
        overflowY: "auto",
        overflowX: "hidden",
        background: "#fff",
        borderRadius: ".375rem",
        boxShadow: "var(--ct-box-shadow)",
        border: "var(--ct-border-width) solid var(--ct-border-color)"
    });

    return list;
}

function escapeSuggestHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function initSubAreaCorpAutocomplete({
    input,
    list,
    fetchItems,
    getItemName,
    getItemBadge,
    getItemCode,
    onSelect
}) {
    if (!input || !list || typeof fetchItems !== "function") return;

    let items = [];
    let activeIndex = -1;
    let abortCtrl = null;
    let debounceTimer = null;
    let lastSearchedKeyword = "";

    const resolveName = typeof getItemName === "function"
        ? getItemName
        : (item) => item?.corpName ?? item?.name ?? "";
    const resolveBadge = typeof getItemBadge === "function"
        ? getItemBadge
        : () => "";
    const resolveCode = typeof getItemCode === "function"
        ? getItemCode
        : (item) => item?.stockCode ?? item?.code ?? "";

    function updateListPosition() {
        if (!list || list.classList.contains("d-none")) return;

        const inputGroup = input.closest(".input-group");
        if (inputGroup) {
            const width = Math.round(inputGroup.getBoundingClientRect().width);
            list.style.width = width > 0 ? `${width}px` : "100%";
        } else {
            list.style.width = "100%";
        }

        list.style.maxHeight = "240px";
    }

    function hideList() {
        list.classList.add("d-none");
        list.innerHTML = "";
        items = [];
        activeIndex = -1;
    }

    function showList() {
        list.classList.remove("d-none");
        updateListPosition();
        scrollStackedSubPanelIntoView(list);
    }

    function renderList(data) {
        items = Array.isArray(data) ? data : [];
        activeIndex = -1;

        if (items.length === 0) {
            hideList();
            return;
        }

        const rowsHtml = items.map((item, idx) => {
            const badge = resolveBadge(item);
            const name = resolveName(item);
            const code = resolveCode(item);
            const badgeHtml = badge
                ? `<span class="badge bg-light text-dark border me-1 fw-normal" style="font-size:0.65rem; padding:.15rem .3rem;">${escapeSuggestHtml(badge)}</span>`
                : "";

            return `
                <li class="list-group-item list-group-item-action py-1 px-2 small"
                    data-idx="${idx}"
                    role="button"
                    style="cursor:pointer;">
                    <div class="d-flex align-items-center justify-content-between gap-2">
                        <span class="d-inline-flex align-items-center gap-1 flex-grow-1"
                              style="min-width:0; overflow:hidden;">
                            ${badgeHtml}
                            <span class="text-truncate d-inline-block small lh-sm"
                                  title="${escapeSuggestHtml(name)}"
                                  style="max-width:100%;">${escapeSuggestHtml(name)}</span>
                        </span>
                        <span class="text-muted small lh-sm flex-shrink-0">${escapeSuggestHtml(code)}</span>
                    </div>
                </li>
            `;
        }).join("");

        list.innerHTML = `<ul class="list-group list-group-flush">${rowsHtml}</ul>`;

        list.scrollTop = 0;
        showList();
    }

    function setActive(idx) {
        const rows = list.querySelectorAll(".list-group-item");
        rows.forEach((el) => el.classList.remove("active"));

        if (idx < 0 || idx >= rows.length) {
            activeIndex = -1;
            return;
        }

        activeIndex = idx;
        rows[idx].classList.add("active");
        rows[idx].scrollIntoView({block: "nearest"});
    }

    function selectItem(idx) {
        const item = items[idx];
        if (!item) return;

        hideList();

        if (typeof onSelect === "function") {
            const result = onSelect(item);
            if (result && typeof result.catch === "function") {
                result.catch((err) => console.error(err));
            }
        }

        input.value = "";
        lastSearchedKeyword = "";
        input.focus();
    }

    async function executeSearch(options = {}) {
        const force = Boolean(options?.force);
        const keyword = input.value.trim();

        if (keyword.length < 1) {
            lastSearchedKeyword = "";
            hideList();
            return;
        }

        if (!force && keyword === lastSearchedKeyword && items.length > 0) {
            showList();
            return;
        }

        try {
            if (abortCtrl) abortCtrl.abort();
            abortCtrl = new AbortController();

            const data = await fetchItems(keyword, abortCtrl.signal);
            renderList(data);
            lastSearchedKeyword = keyword;
        } catch (err) {
            if (err?.name !== "AbortError") {
                hideList();
            }
        }
    }

    input.addEventListener("input", () => {
        const value = input.value.trim();
        if (value.length === 0) {
            clearTimeout(debounceTimer);
            hideList();
            return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            void executeSearch();
        }, 150);
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === "Escape") {
            clearTimeout(debounceTimer);
        }

        if (list.classList.contains("d-none")) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive(Math.min(activeIndex + 1, items.length - 1));
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive(Math.max(activeIndex - 1, 0));
            return;
        }

        if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            selectItem(activeIndex);
            return;
        }

        if (e.key === "Escape") {
            hideList();
        }
    });

    list.addEventListener("mousedown", (e) => {
        const rowBtn = e.target.closest(".list-group-item");
        if (!rowBtn) return;
        e.preventDefault();
        selectItem(Number(rowBtn.dataset.idx));
    });

    window.addEventListener("resize", () => {
        updateListPosition();
    });

    window.addEventListener("scroll", () => {
        updateListPosition();
    }, true);

    document.addEventListener("click", (e) => {
        if (e.target === input || list.contains(e.target)) return;
        hideList();
    });
}

function mapKrxKindToMarketLabel(kindof) {
    switch (String(kindof ?? "").toLowerCase()) {
        case "kospi":
            return "유";
        case "kosdaq":
            return "코";
        case "konex":
            return "넥";
        default:
            return "-";
    }
}

function addRelatedKrxSelectionItem(item) {
    const selectedWrap = document.querySelector(".related-krx-result");
    const selectedList = document.querySelector(".related-krx-result .list-group");
    if (!selectedWrap || !selectedList) return;

    const itemId = String(item?.id ?? "");
    const label = String(item?.name ?? "").trim();
    if (!itemId || !label) return;
    if (selectedList.querySelector(`li[data-id="${itemId}"]`)) return;

    selectedWrap.style.display = "block";

    const listItem = document.createElement("li");
    listItem.className = "list-group-item d-flex justify-content-between align-items-center";
    listItem.dataset.id = itemId;

    const textNode = document.createElement("span");
    textNode.textContent = label;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-danger hide-bn";
    removeBtn.innerHTML = '<i class="ri-close-line"></i>';

    listItem.appendChild(textNode);
    listItem.appendChild(removeBtn);
    selectedList.appendChild(listItem);

    initRelatedKrxSelection();
}

function isSubPanelStacked(target) {
    const subPanel = target?.closest(".sub-panel");
    const subColumns = subPanel?.querySelector(".sub-columns");
    if (!subColumns) return false;

    const containers = Array.from(subColumns.querySelectorAll(":scope > .sub-panel-container"));
    if (containers.length < 2) return false;

    const [firstContainer, secondContainer] = containers;
    const firstRect = firstContainer.getBoundingClientRect();
    const secondRect = secondContainer.getBoundingClientRect();

    return secondRect.top > firstRect.top + 8;
}

function scrollStackedSubPanelIntoView(target) {
    if (!target || !isSubPanelStacked(target)) return;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (!document.body.contains(target)) return;

            target.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest"
            });
        });
    });
}

function scrollDealDataSelectionIntoView(target) {
    scrollStackedSubPanelIntoView(target);
}

function addDealDataSelectionItem(item) {
    const selectedWrap = document.querySelector(".deal-data-result");
    const selectedList = document.querySelector(".deal-data-result .list-group");
    if (!selectedWrap || !selectedList) return;

    const itemId = String(item?.id ?? "");
    const bcmCorpName = String(item?.corpName ?? "").trim();
    const dartCorpCode = String(item?.dartCorpCode ?? "").trim();

    if (!itemId || !bcmCorpName) return;
    if (selectedList.querySelector(`li[data-id="${itemId}"]`)) return;

    selectedWrap.style.display = "block";

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.dataset.id = itemId;
    li.dataset.bcmId = itemId;
    li.dataset.bcmCorpName = bcmCorpName;
    li.dataset.dartCorpCode = dartCorpCode;

    const nameSpan = document.createElement("span");
    nameSpan.textContent = bcmCorpName;

    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    if (dartCorpCode) {
        const stockBtn = document.createElement("button");
        stockBtn.type = "button";
        stockBtn.className = "btn btn-outline-info btn-open-stock";
        stockBtn.textContent = "재무정보";
        btnGroup.appendChild(stockBtn);
    }

    const dealBtn = document.createElement("button");
    dealBtn.type = "button";
    dealBtn.className = "btn btn-outline-info btn-open-deal";
    dealBtn.textContent = "딜정보";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-outline-info hide-bn";
    removeBtn.textContent = "삭제";

    btnGroup.appendChild(dealBtn);
    btnGroup.appendChild(removeBtn);

    li.appendChild(nameSpan);
    li.appendChild(btnGroup);
    selectedList.appendChild(li);

    initDealDataSelection();
    scrollDealDataSelectionIntoView(li);
}

export function searchCandidateRelatedKrx() {
    const form = document.querySelector(".related-krx-search form");
    const searchInput = document.querySelector("input[name='related-krx-search']");
    const resultBox = document.querySelector(".related-krx-box");
    const selectedList = document.querySelector(".related-krx-result .list-group");

    if (!form || !searchInput || !resultBox || !selectedList) return;
    if (false) {
        const autoSearchBtn = form.querySelector(".btn-deal-data-search");

        const getSelectedIdSet = () => new Set(
            Array.from(selectedList.querySelectorAll("li[data-id]"))
                .map((li) => li.dataset.id)
        );

        async function fetchDealCorpCandidates(keyword, signal = null) {
            const fetchOptions = signal ? {signal} : undefined;
            const response = await fetch(
                `/api/editor/deal/corp/search?keyword=${encodeURIComponent(keyword)}`,
                fetchOptions
            );

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const result = await response.json();
            return Array.isArray(result?.data) ? result.data : [];
        }

        async function performSearch() {
            const keyword = searchInput.value.trim();
            if (!keyword) {
                resultBox.innerHTML = "";
                return;
            }

            try {
                const data = await fetchDealCorpCandidates(keyword);
                resultBox.innerHTML = "";

                if (data.length === 0) {
                    resultBox.innerHTML = `<p class="small text-muted mb-0">검색 결과가 없습니다.</p>`;
                    return;
                }

                const selectedIds = getSelectedIdSet();
                const borderDiv = document.createElement("div");
                borderDiv.className = "border overflow-auto";
                borderDiv.style.maxHeight = "175px";

                const ul = document.createElement("ul");
                ul.className = "list-group list-group-flush";

                data.forEach((item) => {
                    const bcmId = String(item.id);

                    const li = document.createElement("li");
                    li.className = "list-group-item d-flex align-items-center justify-content-between small";

                    const leftWrap = document.createElement("div");
                    leftWrap.className = "d-flex align-items-center gap-1";

                    const input = document.createElement("input");
                    input.type = "checkbox";
                    input.className = "form-check-input me-1";
                    input.id = bcmId;
                    input.checked = selectedIds.has(bcmId);
                    input.dataset.bcmId = item.id ?? "";
                    input.dataset.bcmCorpName = item.corpName ?? "";
                    input.dataset.dartCorpCode = item.dartCorpCode ?? "";

                    const marketBadge = document.createElement("span");
                    marketBadge.className = "badge bg-light text-dark border";
                    marketBadge.textContent = item.stockMarketLabel ?? "-";

                    const nameSpan = document.createElement("span");
                    nameSpan.className = "text-truncate";
                    nameSpan.textContent = item.corpName ?? "";

                    leftWrap.appendChild(input);
                    leftWrap.appendChild(marketBadge);
                    leftWrap.appendChild(nameSpan);

                    const codeSpan = document.createElement("span");
                    codeSpan.className = "text-muted";
                    codeSpan.textContent = item.stockCode ?? "";

                    li.appendChild(leftWrap);
                    li.appendChild(codeSpan);
                    ul.appendChild(li);
                });

                borderDiv.appendChild(ul);
                resultBox.appendChild(borderDiv);
                initDealDataSelection();
            } catch (err) {
                console.error(err);
                alert("검색 중 오류가 발생했습니다.");
            }
        }

        const suggestList = ensureSubAreaSuggestList(searchInput, "deal-data-suggest");
        if (suggestList) {
            initSubAreaCorpAutocomplete({
                input: searchInput,
                list: suggestList,
                fetchItems: fetchDealCorpCandidates,
                getItemName: (item) => item?.corpName ?? "",
                getItemBadge: (item) => item?.stockMarketLabel ?? "",
                getItemCode: (item) => item?.stockCode ?? "",
                onSelect: (item) => {
                    addDealDataSelectionItem(item);
                }
            });
        }

        resultBox.innerHTML = "";
        resultBox.style.display = "none";

        form.addEventListener("submit", (e) => {
            e.preventDefault();
        });

        if (autoSearchBtn) {
            autoSearchBtn.addEventListener("click", (e) => {
                e.preventDefault();
            });
        }

        return;
    }

    {
        const autoSearchBtn = form.querySelector(".btn-related-krx-search");

        const getSelectedIdSet = () => new Set(
            Array.from(selectedList.querySelectorAll("li[data-id]"))
                .map((li) => li.dataset.id)
        );

        async function fetchKrxCandidates(keyword, signal = null) {
            const fetchOptions = signal ? {signal} : undefined;
            const response = await fetch(
                `/api/editor/krx/search?keyword=${encodeURIComponent(keyword)}`,
                fetchOptions
            );

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const result = await response.json();
            return Array.isArray(result?.data) ? result.data : [];
        }

        async function performSearch() {
            const keyword = searchInput.value.trim();
            if (!keyword) {
                resultBox.innerHTML = "";
                return;
            }

            try {
                const data = await fetchKrxCandidates(keyword);
                resultBox.innerHTML = "";

                if (data.length === 0) {
                    resultBox.innerHTML = `<p class="small text-muted mb-0">검색 결과가 없습니다.</p>`;
                    return;
                }

                const selectedIds = getSelectedIdSet();
                const borderDiv = document.createElement("div");
                borderDiv.className = "border overflow-auto";
                borderDiv.style.maxHeight = "175px";

                const ul = document.createElement("ul");
                ul.className = "list-group list-group-flush";

                data.forEach((item) => {
                    const krxId = String(item.id);

                    const li = document.createElement("li");
                    li.className = "list-group-item d-flex align-items-center justify-content-between small";

                    const leftWrap = document.createElement("div");
                    leftWrap.className = "d-flex align-items-center gap-1";

                    const input = document.createElement("input");
                    input.type = "checkbox";
                    input.className = "form-check-input me-1";
                    input.id = krxId;
                    input.dataset.krxCode = krxId;
                    input.dataset.name = item.name;
                    input.checked = selectedIds.has(krxId);

                    const marketBadge = document.createElement("span");
                    marketBadge.className = "badge bg-light text-dark border";
                    marketBadge.textContent = mapKrxKindToMarketLabel(item.kindof);

                    const nameSpan = document.createElement("span");
                    nameSpan.textContent = item.name ?? "";

                    leftWrap.appendChild(input);
                    leftWrap.appendChild(marketBadge);
                    leftWrap.appendChild(nameSpan);

                    const codeSpan = document.createElement("span");
                    codeSpan.className = "text-muted";
                    codeSpan.textContent = item.code ?? "";

                    li.appendChild(leftWrap);
                    li.appendChild(codeSpan);
                    ul.appendChild(li);
                });

                borderDiv.appendChild(ul);
                resultBox.appendChild(borderDiv);
                initRelatedKrxSelection();
            } catch (err) {
                console.error(err);
                alert("검색 중 오류가 발생했습니다.");
            }
        }

        const suggestList = ensureSubAreaSuggestList(searchInput, "related-krx-suggest");
        if (suggestList) {
            initSubAreaCorpAutocomplete({
                input: searchInput,
                list: suggestList,
                fetchItems: fetchKrxCandidates,
                getItemName: (item) => item?.name ?? "",
                getItemBadge: (item) => mapKrxKindToMarketLabel(item?.kindof),
                getItemCode: (item) => item?.code ?? "",
                onSelect: (item) => {
                    addRelatedKrxSelectionItem(item);
                }
            });
        }

        resultBox.innerHTML = "";
        resultBox.style.display = "none";

        form.addEventListener("submit", (e) => {
            e.preventDefault();
        });

        if (autoSearchBtn) {
            autoSearchBtn.addEventListener("click", (e) => {
                e.preventDefault();
            });
        }

        return;
    }

    // 현재 선택된 기사 id 모으기
    const getSelectedIdSet = () => new Set(
        Array.from(selectedList.querySelectorAll("li[data-id]"))
            .map(li => li.dataset.id)
    );

    async function doSearch() {
        const keyword = searchInput.value.trim();
        if (!keyword) {
            resultBox.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`/api/editor/krx/search?keyword=${encodeURIComponent(keyword)}`);
            if (!response.ok) throw new Error("API 요청 실패");

            const result = await response.json();
            const data = result.data;

            // 결과 영역 초기화
            resultBox.innerHTML = "";

            if (!data || data.length === 0) {
                resultBox.innerHTML = `<p class="small text-muted mb-0">검색 결과가 없습니다.</p>`;
                return;
            }

            const selectedIds = getSelectedIdSet();

            // 리스트 래퍼
            const borderDiv = document.createElement("div");
            borderDiv.className = "border overflow-auto";
            borderDiv.style.maxHeight = "175px";

            const ul = document.createElement("ul");
            ul.className = "list-group list-group-flush";

            data.forEach((item) => {
                const krxId = String(item.id);

                const li = document.createElement("li");
                li.className = "list-group-item d-flex align-items-center justify-content-between small";

                // 왼쪽 영역 (체크박스 + 마켓구분 + 이름)
                const leftWrap = document.createElement("div");
                leftWrap.className = "d-flex align-items-center gap-1";

                const input = document.createElement("input");
                input.type = "checkbox";
                input.className = "form-check-input me-1";
                input.id = `${krxId}`;
                input.dataset.krxCode = krxId;
                input.dataset.name = item.name;
                input.checked = selectedIds.has(krxId);

                // 마켓 구분 (예: kospi / kosdaq / konex)
                const marketBadge = document.createElement("span");
                marketBadge.className = "badge bg-light text-dark border";

                // kindof 값에 따라 표시 문자 변경
                let marketText = "";
                switch (item.kindof) {
                    case "kospi": marketText = "유"; break;
                    case "kosdaq": marketText = "코"; break;
                    case "konex": marketText = "넥"; break;
                    default: marketText = "-";
                }
                marketBadge.textContent = marketText;

                const nameSpan = document.createElement("span");
                nameSpan.textContent = item.name;

                leftWrap.appendChild(input);
                leftWrap.appendChild(marketBadge);
                leftWrap.appendChild(nameSpan);

                // 오른쪽 영역 (종목코드)
                const codeSpan = document.createElement("span");
                codeSpan.className = "text-muted";
                codeSpan.textContent = item.code;

                li.appendChild(leftWrap);
                li.appendChild(codeSpan);

                ul.appendChild(li);
            });

            borderDiv.appendChild(ul);
            resultBox.appendChild(borderDiv);

            initRelatedKrxSelection();

        } catch (err) {
            console.error(err);
            alert("검색 중 오류가 발생했습니다.");
        }
    }

    // 버튼 클릭 or 엔터 입력
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        void doSearch();
    });

    const searchBtn = form.querySelector(".btn-related-krx-search");
    if (searchBtn) {
        searchBtn.addEventListener("click", (e) => {
            e.preventDefault();
            void doSearch();
        });
    }
}

// 관련종목 선택 이벤트 바인딩
export function initRelatedKrxSelection() {
    const resultBox = document.querySelector(".related-krx-result");
    const selectedList2 = document.querySelector(".related-krx-result .list-group");
    const checkboxes2 = document.querySelectorAll(".related-krx-box .form-check-input");

    if (!resultBox || !selectedList2) return;

    // 체크박스 변경 이벤트 (중복 바인딩 방지)
    checkboxes2.forEach((checkbox) => {
        if (checkbox.dataset.bound === "1") return;
        checkbox.dataset.bound = "1";

        checkbox.addEventListener("change", function () {
            const label = this.dataset.name;
            const itemId = this.id;

            if (this.checked) {
                resultBox.style.display = "block";
                const listItem = document.createElement("li");
                listItem.className = "list-group-item d-flex justify-content-between align-items-center";
                listItem.dataset.id = itemId;
                listItem.innerHTML = `
                  ${label}
                  <button type="button" class="btn btn-danger hide-bn"><i class="ri-close-line"></i></button>
                `;
                selectedList2.appendChild(listItem);
            } else {
                const itemToRemove = selectedList2.querySelector(`li[data-id="${itemId}"]`);
                if (itemToRemove) itemToRemove.remove();
                if (selectedList2.children.length === 0) resultBox.style.display = "none";
            }
        });
    });

    // 삭제 버튼 클릭 시 항목 제거 (중복 바인딩 방지)
    if (selectedList2.dataset.bound !== "1") {
        selectedList2.dataset.bound = "1";
        selectedList2.addEventListener("click", function (e) {
            const btn = e.target.closest(".hide-bn");
            if (!btn) return;

            const listItem = btn.closest("li");
            const checkboxId = listItem?.dataset.id;
            listItem?.remove();

            const checkbox = checkboxId ? document.getElementById(checkboxId) : null;
            if (checkbox) checkbox.checked = false;

            if (selectedList2.children.length === 0) resultBox.style.display = "none";
        });
    }
}


// 재무&Deal 데이터 종목 대상 검색
export function searchCandidateDealData() {
    const form = document.querySelector(".deal-data-search form");
    const searchInput = document.querySelector("input[name='deal-data-search']");
    const resultBox = document.querySelector(".deal-data-box");
    const selectedList = document.querySelector(".deal-data-result .list-group");

    if (!form || !searchInput || !resultBox || !selectedList) return;

    {
        const autoSearchBtn = form.querySelector(".btn-deal-data-search");

        const getSelectedIdSet = () => new Set(
            Array.from(selectedList.querySelectorAll("li[data-id]"))
                .map((li) => li.dataset.id)
        );

        async function fetchDealCorpCandidates(keyword, signal = null) {
            const fetchOptions = signal ? {signal} : undefined;
            const response = await fetch(
                `/api/editor/deal/corp/search?keyword=${encodeURIComponent(keyword)}`,
                fetchOptions
            );

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const result = await response.json();
            return Array.isArray(result?.data) ? result.data : [];
        }

        async function performSearch() {
            const keyword = searchInput.value.trim();
            if (!keyword) {
                resultBox.innerHTML = "";
                return;
            }

            try {
                const data = await fetchDealCorpCandidates(keyword);
                resultBox.innerHTML = "";

                if (data.length === 0) {
                    resultBox.innerHTML = `<p class="small text-muted mb-0">검색 결과가 없습니다.</p>`;
                    return;
                }

                const selectedIds = getSelectedIdSet();
                const borderDiv = document.createElement("div");
                borderDiv.className = "border overflow-auto";
                borderDiv.style.maxHeight = "175px";

                const ul = document.createElement("ul");
                ul.className = "list-group list-group-flush";

                data.forEach((item) => {
                    const bcmId = String(item.id);

                    const li = document.createElement("li");
                    li.className = "list-group-item d-flex align-items-center justify-content-between small";

                    const leftWrap = document.createElement("div");
                    leftWrap.className = "d-flex align-items-center gap-1";

                    const input = document.createElement("input");
                    input.type = "checkbox";
                    input.className = "form-check-input me-1";
                    input.id = bcmId;
                    input.checked = selectedIds.has(bcmId);
                    input.dataset.bcmId = item.id ?? "";
                    input.dataset.bcmCorpName = item.corpName ?? "";
                    input.dataset.dartCorpCode = item.dartCorpCode ?? "";

                    const marketBadge = document.createElement("span");
                    marketBadge.className = "badge bg-light text-dark border";
                    marketBadge.textContent = item.stockMarketLabel ?? "-";

                    const nameSpan = document.createElement("span");
                    nameSpan.className = "text-truncate";
                    nameSpan.textContent = item.corpName ?? "";

                    leftWrap.appendChild(input);
                    leftWrap.appendChild(marketBadge);
                    leftWrap.appendChild(nameSpan);

                    const codeSpan = document.createElement("span");
                    codeSpan.className = "text-muted";
                    codeSpan.textContent = item.stockCode ?? "";

                    li.appendChild(leftWrap);
                    li.appendChild(codeSpan);
                    ul.appendChild(li);
                });

                borderDiv.appendChild(ul);
                resultBox.appendChild(borderDiv);
                initDealDataSelection();
            } catch (err) {
                console.error(err);
                alert("검색 중 오류가 발생했습니다.");
            }
        }

        const suggestList = ensureSubAreaSuggestList(searchInput, "deal-data-suggest");
        if (suggestList) {
            initSubAreaCorpAutocomplete({
                input: searchInput,
                list: suggestList,
                fetchItems: fetchDealCorpCandidates,
                getItemName: (item) => item?.corpName ?? "",
                getItemBadge: (item) => item?.stockMarketLabel ?? "",
                getItemCode: (item) => item?.stockCode ?? "",
                onSelect: (item) => {
                    addDealDataSelectionItem(item);
                }
            });
        }

        resultBox.innerHTML = "";
        resultBox.style.display = "none";

        form.addEventListener("submit", (e) => {
            e.preventDefault();
        });

        if (autoSearchBtn) {
            autoSearchBtn.addEventListener("click", (e) => {
                e.preventDefault();
            });
        }

        return;
    }

    // 현재 선택된 기사 id 모으기
    const getSelectedIdSet = () => new Set(
        Array.from(selectedList.querySelectorAll("li[data-id]"))
            .map(li => li.dataset.id)
    );

    async function doSearch() {
        const keyword = searchInput.value.trim();
        if (!keyword) {
            resultBox.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`/api/editor/deal/corp/search?keyword=${encodeURIComponent(keyword)}`);
            if (!response.ok) throw new Error("API 요청 실패");

            const result = await response.json();
            const data = result.data;

            // 결과 영역 초기화
            resultBox.innerHTML = "";

            if (!data || data.length === 0) {
                resultBox.innerHTML = `<p class="small text-muted mb-0">검색 결과가 없습니다.</p>`;
                return;
            }

            const selectedIds = getSelectedIdSet();

            // 리스트 래퍼
            const borderDiv = document.createElement("div");
            borderDiv.className = "border overflow-auto";
            borderDiv.style.maxHeight = "175px";

            const ul = document.createElement("ul");
            ul.className = "list-group list-group-flush";

            data.forEach(item => {
                const bcmId = String(item.id);

                const li = document.createElement("li");
                li.className = "list-group-item d-flex align-items-center justify-content-between small";

                // 왼쪽 (체크박스 + 마켓라벨 + 회사명)
                const leftWrap = document.createElement("div");
                leftWrap.className = "d-flex align-items-center gap-1";

                const input = document.createElement("input");
                input.type = "checkbox";
                input.className = "form-check-input me-1";
                input.id = bcmId;
                input.checked = selectedIds.has(bcmId);

                input.dataset.bcmId = item.id ?? "";
                input.dataset.bcmCorpName = item.corpName ?? "";
                input.dataset.dartCorpCode = item.dartCorpCode ?? "";

                const marketBadge = document.createElement("span");
                marketBadge.className = "badge bg-light text-dark border";
                marketBadge.textContent = item.stockMarketLabel ?? "-";

                const nameSpan = document.createElement("span");
                nameSpan.className = "text-truncate";
                nameSpan.textContent = item.corpName ?? "";

                leftWrap.appendChild(input);
                leftWrap.appendChild(marketBadge);
                leftWrap.appendChild(nameSpan);

                // 오른쪽 종목코드
                const codeSpan = document.createElement("span");
                codeSpan.className = "text-muted";
                codeSpan.textContent = item.stockCode ?? "";

                li.appendChild(leftWrap);
                li.appendChild(codeSpan);

                ul.appendChild(li);
            });
            borderDiv.appendChild(ul);
            resultBox.appendChild(borderDiv);

            initDealDataSelection();

        } catch (err) {
            console.error(err);
            alert("검색 중 오류가 발생했습니다.");
        }
    }

    // 버튼 클릭 or 엔터 입력
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        void doSearch();
    });

    const searchBtn = form.querySelector(".btn-deal-data-search");
    if (searchBtn) {
        searchBtn.addEventListener("click", (e) => {
            e.preventDefault();
            void doSearch();
        });
    }
}

// 재무 딜 데이터 선택 이벤트 바인딩
export function initDealDataSelection() {
    const selectedWrap = document.querySelector(".deal-data-result");
    const selectedList = document.querySelector(".deal-data-result .list-group");
    const checkboxes = document.querySelectorAll(".deal-data-box .form-check-input");

    if (!selectedWrap || !selectedList) return;

    // 체크 → 선택목록 추가 / 해제 → 제거 (중복 바인딩 방지)
    checkboxes.forEach(cb => {
        if (cb.dataset.bound === "1") return;
        cb.dataset.bound = "1";

        cb.addEventListener("change", function () {
            const label = this.dataset.bcmCorpName ?? "";
            const id = this.id;

            if (this.checked) {
                selectedWrap.style.display = "block";

                const bcmId = cb.dataset.bcmId;
                const bcmCorpName = cb.dataset.bcmCorpName
                const dartCorpCode = cb.dataset.dartCorpCode;

                const dartBtn = dartCorpCode
                    ? `<button class="btn btn-outline-info btn-open-stock">재무정보</button>`
                    : '' ;

                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.dataset.id = id;
                li.innerHTML = `
                  ${label}
                  <div class="btn-group">
                    ${dartBtn}
                    <button class="btn btn-outline-info btn-open-deal">딜정보</button>
                    <button class="btn btn-outline-info hide-bn">삭제</button>
                  </div>
                `;

                li.dataset.bcmId = bcmId;
                li.dataset.bcmCorpName = bcmCorpName;
                li.dataset.dartCorpCode = dartCorpCode;

                selectedList.appendChild(li);
                scrollDealDataSelectionIntoView(li);
            } else {
                const toRemove = selectedList.querySelector(`li[data-id="${id}"]`);
                if (toRemove) toRemove.remove();
                if (!selectedList.children.length) selectedWrap.style.display = "none";
            }
        });
    });

    // 삭제 버튼 → 선택목록 제거 + 체크 해제 (중복 바인딩 방지)
    if (selectedList.dataset.bound !== "1") {
        selectedList.dataset.bound = "1";
        selectedList.addEventListener("click", e => {
            const btn = e.target.closest(".hide-bn");
            if (!btn) return;

            const li = btn.closest("li");
            const id = li?.dataset.id;
            if (li) li.remove();

            const cb = id ? document.getElementById(id) : null;
            if (cb) cb.checked = false;

            if (!selectedList.children.length) selectedWrap.style.display = "none";
        });
    }
}

function getThumbnailPreviewContainer() {
    return document.getElementById('thumbnail-previews') || document.getElementById('right-previews');
}

function getPhotoPreviewContainer() {
    return document.getElementById('right-previews');
}

function getPreviewContainers() {
    return Array.from(new Set([
        getThumbnailPreviewContainer(),
        getPhotoPreviewContainer()
    ].filter(Boolean)));
}

function getAllPreviewFigures() {
    return getPreviewContainers().flatMap((container) => Array.from(container.querySelectorAll('.figure')));
}

function clearPreviewSelectionInputs() {
    const coverIdInput = document.getElementById('coverId');
    const photoSeqInput = document.getElementById('photoSeqId');

    if (coverIdInput) coverIdInput.value = "";
    if (photoSeqInput) photoSeqInput.value = "";
}

function clearThumbnailFileInput() {
    const fileInput = document.getElementById('formFile');
    if (fileInput) {
        fileInput.value = '';
    }
}

function selectPreviewFigure(figure) {
    if (!figure) return;

    const coverIdInput = document.getElementById('coverId');
    const photoSeqInput = document.getElementById('photoSeqId');

    clearPreviewSelectionInputs();

    getAllPreviewFigures().forEach((item) => {
        item.dataset.clicked = "false";
        const badge = item.querySelector('.badge-show');
        if (badge) badge.style.display = 'none';
    });

    figure.dataset.clicked = "true";
    const badge = figure.querySelector('.badge-show');
    if (badge) badge.style.display = 'block';

    const isCover = figure.dataset.role === 'cover';
    if (coverIdInput) coverIdInput.value = isCover ? (figure.dataset.id || "") : "";
    if (photoSeqInput) photoSeqInput.value = isCover ? "" : (figure.dataset.id || "");
}

function buildPreviewHtml({ id, role, imageUrl, title }) {
    const safeId = escapeSuggestHtml(id ?? "");
    const safeRole = escapeSuggestHtml(role ?? "");
    const safeImageUrl = escapeSuggestHtml(imageUrl ?? "");
    const safeTitle = escapeSuggestHtml(title ?? "");

    return `
        <div class="col-4 img-block">
            <figure class="figure position-relative" data-id="${safeId}" data-role="${safeRole}" data-image-url="${safeImageUrl}" title="대표 이미지 선택">
                <span class="badge-show badge text-bg-success position-absolute start-1">대표</span>
                <button type="button" class="btn btn-danger hide-bn preview-remove-btn" aria-label="이미지 제거" title="이미지 제거">
                    <i class="ri-close-line" aria-hidden="true"></i>
                </button>
                <div class="image-box">
                    <img src="${safeImageUrl}" class="figure-img img-fluid rounded" alt="${safeTitle}">
                </div>
                <figcaption class="figure-caption">${safeTitle}</figcaption>
            </figure>
        </div>`;
}

function syncPreviewSelectionAfterRemoval() {
    const figures = getAllPreviewFigures();

    if (figures.length === 0) {
        clearPreviewSelectionInputs();
        return;
    }

    const selectedFigure = figures.find((figure) => figure.dataset.clicked === "true");
    if (selectedFigure) {
        selectPreviewFigure(selectedFigure);
        return;
    }

    initRightPreviewDefault();
}

function removePhotoImageFromEditor({ id, imageUrl } = {}) {
    const editor = window.mainEditor;
    if (!editor?.model?.document) {
        return false;
    }

    const normalizedId = String(id ?? '').trim();
    const normalizedImageUrl = String(imageUrl ?? '').trim();
    let removed = false;

    editor.model.change((writer) => {
        const root = editor.model.document.getRoot();
        const targets = [];

        for (const item of editor.model.createRangeIn(root).getItems()) {
            if (!(item.is('element', 'imageBlock') || item.is('element', 'imageInline'))) {
                continue;
            }

            const itemId = String(item.getAttribute('data-id') || '').trim();
            const itemSrc = String(item.getAttribute('src') || '').trim();
            const isMatchById = normalizedId && itemId === normalizedId;
            const isMatchBySrc = normalizedImageUrl && itemSrc === normalizedImageUrl;

            if (!isMatchById && !isMatchBySrc) {
                continue;
            }

            targets.push(item);
        }

        targets.forEach((item) => {
            writer.remove(item);
            removed = true;
        });
    });

    return removed;
}

function removePreviewFigure(figure) {
    if (!figure) {
        return;
    }

    const role = figure.dataset.role || '';
    const id = figure.dataset.id || '';
    const imageUrl = figure.dataset.imageUrl || figure.querySelector('img')?.getAttribute('src') || '';
    const block = figure.closest('.img-block') || figure;

    if (role === 'cover') {
        block.remove();
        clearPreviewSelectionInputs();
        clearThumbnailFileInput();
        syncPreviewSelectionAfterRemoval();
        return;
    }

    const removedInEditor = removePhotoImageFromEditor({ id, imageUrl });
    if (!removedInEditor) {
        block.remove();
        syncPreviewSelectionAfterRemoval();
    }
}

export function initRightPreviews() {
    // 클릭 이벤트
    const imageSearchInput = document.getElementById('search-img-text');
    const imageSearchBtn = imageSearchInput
        ? imageSearchInput.parentElement?.querySelector('.js-open-image-modal')
        : null;

    if (imageSearchInput && imageSearchBtn && imageSearchInput.dataset.enterBound !== "1") {
        imageSearchInput.dataset.enterBound = "1";
        imageSearchInput.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            imageSearchBtn.click();
        });
    }

    //--- 이미지 리스트 ---//
    function delegate(parentSelector, childSelector, eventType, handler) {
        const parent = document.querySelector(parentSelector);
        if (!parent) return;

        parent.addEventListener(eventType, function(event) {
            const targetElement = event.target.closest(childSelector);
            if (targetElement && this.contains(targetElement)) {
                handler.call(targetElement, event);
            }
        });
    }

    delegate('#right-previews', '.figure', 'click', function (event) {
        if (event.target.closest('.preview-remove-btn')) return;
        const clickedFigure = this.closest('.figure');
        if (!clickedFigure) return;
        selectPreviewFigure(clickedFigure);
    });

    delegate('#thumbnail-previews', '.figure', 'click', function (event) {
        if (event.target.closest('.preview-remove-btn')) return;
        const clickedFigure = this.closest('.figure');
        if (!clickedFigure) return;
        selectPreviewFigure(clickedFigure);
    });

    delegate('#right-previews', '.preview-remove-btn', 'click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        const figure = this.closest('.figure');
        removePreviewFigure(figure);
    });

    delegate('#thumbnail-previews', '.preview-remove-btn', 'click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        const figure = this.closest('.figure');
        removePreviewFigure(figure);
    });

    const bindRightPreviewSync = () => {
        const editor = window.mainEditor;
        if (!editor?.model?.document || editor.__rightPreviewSyncBound) {
            return;
        }

        const syncRightPreviews = debounce(() => {
            setRightPreviewsFromContent(editor.getData() || '');
        }, 80);

        editor.model.document.on('change:data', syncRightPreviews);
        editor.__rightPreviewSyncBound = true;
    };

    if (window.editorReady) {
        void window.editorReady.then(() => {
            bindRightPreviewSync();
        });
    } else {
        bindRightPreviewSync();
    }
}

export function bindImageModalInSubArea() {
    const imageModal = document.getElementById("image-modal");
    if (!imageModal || imageModal.dataset.boundImageModal === "1") {
        return;
    }
    imageModal.dataset.boundImageModal = "1";

    const tableId = "photoDataTable";
    const PAGE_CHUNK = 24;
    const SCROLL_THRESHOLD = 48;

    const searchInput = imageModal.querySelector("#search-target-text");
    const searchButton = imageModal.querySelector("#btn-search");
    const categorySelect = imageModal.querySelector("#modal_photo_category");
    const scrollContainer = imageModal.querySelector("#photo-list");
    const rowContainer = imageModal.querySelector("#photo-row");
    const loadMoreButton = imageModal.querySelector("#btn-load-more");
    const insertButton = imageModal.querySelector("#insert-img-button");

    if (!searchInput || !searchButton || !categorySelect || !scrollContainer || !rowContainer || !insertButton) {
        return;
    }

    let categoryOptionsLoaded = false;
    let categoryOptionsPromise = null;
    let hasMoreResults = false;
    let isLoadingNextChunk = false;
    let isPreparingModalOpen = false;
    let nextGridDrawResolver = null;

    function getPhotoTableColumns() {
        return [
            { data: "id" },
            { data: "createdAt" },
            { data: "thumbUrl" },
            { data: "originalFileName" }
        ];
    }

    async function ensurePhotoCategoryOptions() {
        if (categoryOptionsLoaded) {
            return;
        }

        if (categoryOptionsPromise) {
            await categoryOptionsPromise;
            return;
        }

        categoryOptionsPromise = (async () => {
            try {
                const response = await fetch("/api/photo/category");
                if (!response.ok) {
                    throw new Error(`Failed to load photo categories: ${response.status}`);
                }

                const result = await response.json();
                const items = Array.isArray(result?.data) ? result.data : [];
                const previousValue = categorySelect.value;

                categorySelect.innerHTML = "";

                const placeholderOption = document.createElement("option");
                placeholderOption.value = "all";
                placeholderOption.textContent = "전체";
                categorySelect.appendChild(placeholderOption);

                items.forEach((item) => {
                    const option = document.createElement("option");
                    option.value = String(item?.id ?? "");
                    option.textContent = item?.name ?? "";
                    categorySelect.appendChild(option);
                });

                const hasPreviousValue = Array.from(categorySelect.options)
                    .some((option) => option.value === previousValue);
                if (previousValue && hasPreviousValue) {
                    categorySelect.value = previousValue;
                } else {
                    categorySelect.value = "all";
                }

                categoryOptionsLoaded = true;
            } finally {
                categoryOptionsPromise = null;
            }
        })();

        await categoryOptionsPromise;
    }

    function getSearchAllParams() {
        const params = {};
        const searchText = searchInput.value.trim();
        if (searchText) {
            params.ALL_LIKE = searchText;
        }

        const categoryValue = categorySelect.value?.trim();
        if (categoryValue && categoryValue !== "all") {
            params.CATEGORY_IS = categoryValue;
        }

        return params;
    }

    function showPhotoRowMessage(message, withSpinner = false) {
        rowContainer.innerHTML = `
            <div class="col-12 text-center text-muted py-4">
                ${withSpinner ? '<div class="spinner-border spinner-border-sm me-1"></div>' : ""}
                ${message}
            </div>
        `;
    }

    function resolveNextGridDraw() {
        if (typeof nextGridDrawResolver !== "function") {
            return;
        }

        const resolver = nextGridDrawResolver;
        nextGridDrawResolver = null;
        resolver();
    }

    function waitForNextGridDraw(timeoutMs = 10000) {
        return new Promise((resolve, reject) => {
            const timeoutId = window.setTimeout(() => {
                if (nextGridDrawResolver === wrappedResolve) {
                    nextGridDrawResolver = null;
                }
                reject(new Error("Timed out while loading image modal data."));
            }, timeoutMs);

            const wrappedResolve = () => {
                window.clearTimeout(timeoutId);
                resolve();
            };

            nextGridDrawResolver = wrappedResolve;
        });
    }

    function clearGrid() {
        rowContainer.innerHTML = "";
        hasMoreResults = false;
        isLoadingNextChunk = false;
        if (loadMoreButton) {
            loadMoreButton.style.display = "none";
            loadMoreButton.onclick = null;
            loadMoreButton.dataset.loading = "0";
        }
    }

    function clearCreateForm() {
        searchInput.value = "";
        if (categorySelect) {
            categorySelect.value = "all";
        }

        const parentSearch = document.getElementById("search-img-text");
        if (parentSearch) {
            parentSearch.value = "";
        }

        const fields = ["imgMUrl", "imgTUrl", "imgTitle", "imgDataId", "imgDataKey"];
        fields.forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
                el.value = "";
            }
        });

        clearGrid();
    }

    function applySelectedTile(tile) {
        rowContainer.querySelectorAll(".tile.selected").forEach((node) => {
            node.classList.remove("selected");
            node.querySelector(".badge-board")?.remove();
        });

        tile.classList.add("selected");
        if (!tile.querySelector(".badge-board")) {
            tile.insertAdjacentHTML("beforeend", '<div class="badge-board">선택</div>');
        }

        const selected = {
            id: tile.dataset.id || "",
            key: tile.dataset.key || "",
            murl: tile.dataset.murl || "",
            turl: tile.dataset.turl || "",
            title: tile.dataset.title || ""
        };

        const mapping = {
            imgMUrl: selected.murl,
            imgTUrl: selected.turl,
            imgTitle: selected.title,
            imgDataId: selected.id,
            imgDataKey: selected.key
        };

        Object.entries(mapping).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                el.value = value;
            }
        });
    }

    function photoCardList(api) {
        const photos = api.rows({ page: "current" }).data();
        rowContainer.innerHTML = "";
        let count = 0;

        photos.each((photo) => {
            count += 1;
            const card = document.createElement("div");
            card.className = "col-md-4 mb-3 tile";
            card.dataset.id = photo.id ?? "";
            card.dataset.key = photo.hashkey ?? "";
            card.dataset.url = photo.mediumUrl ?? "";
            card.dataset.ourl = photo.originalUrl ?? "";
            card.dataset.murl = photo.mediumUrl ?? "";
            card.dataset.turl = photo.thumbUrl ?? "";
            card.dataset.title = photo.content ?? "";

            const mediumUrl = photo.mediumUrl ?? "";
            const originalFileName = photo.originalFileName ?? "";
            card.innerHTML = `<figure class="figure">
                <div class="image-box">
                  <img src="${mediumUrl}" class="figure-img img-fluid rounded" alt="${originalFileName}">
                </div>
                <figcaption class="figure-caption">${originalFileName}</figcaption>
              </figure>`;

            rowContainer.appendChild(card);
        });

        if (count === 0) {
            showPhotoRowMessage("검색결과가 없습니다.");
        }
    }

    function loadNextChunk(api) {
        if (isLoadingNextChunk) {
            return;
        }

        const info = api.page.info();
        const total = info.recordsDisplay;
        const currentLength = info.end;
        if (currentLength >= total) {
            hasMoreResults = false;
            isLoadingNextChunk = false;
            return;
        }

        isLoadingNextChunk = true;
        const nextLength = Math.min(currentLength + PAGE_CHUNK, total);
        api.page.len(nextLength).draw("page");
    }

    function syncInfiniteScrollState(api) {
        const info = api.page.info();
        hasMoreResults = info.end < info.recordsDisplay;
        isLoadingNextChunk = false;

        if (!hasMoreResults) {
            return;
        }

        requestAnimationFrame(() => {
            const visibleBottom = scrollContainer.scrollTop + scrollContainer.clientHeight;
            const needsAutoFill = scrollContainer.scrollHeight <= scrollContainer.clientHeight + SCROLL_THRESHOLD;
            const isNearBottom = visibleBottom >= scrollContainer.scrollHeight - SCROLL_THRESHOLD;
            if (needsAutoFill || isNearBottom) {
                loadNextChunk(api);
            }
        });
    }

    function renderPhotoPager(api) {
        if (!loadMoreButton) {
            return;
        }

        const info = api.page.info();
        const total = info.recordsDisplay;
        const currentLength = info.length;

        if (currentLength < total) {
            loadMoreButton.style.display = "inline-flex";
            loadMoreButton.classList.add("ms-2", "me-4");
            loadMoreButton.disabled = false;
            loadMoreButton.dataset.loading = "0";

            const span = loadMoreButton.querySelector("span");
            if (span) {
                span.textContent = `더보기(${currentLength} / ${total})`;
            }

            loadMoreButton.onclick = () => {
                if (loadMoreButton.dataset.loading === "1") {
                    return;
                }
                loadMoreButton.dataset.loading = "1";
                loadMoreButton.disabled = true;
                if (span) {
                    span.textContent = "로딩중..";
                }

                const nextLength = Math.min(currentLength + PAGE_CHUNK, total);
                api.page.len(nextLength).draw("page");
            };
            return;
        }

        loadMoreButton.style.display = "none";
        loadMoreButton.onclick = null;
    }

    function loadSearch(e) {
        if (e) {
            e.preventDefault();
        }

        showPhotoRowMessage("로딩중..", true);
        if (loadMoreButton) {
            loadMoreButton.style.display = "none";
        }
        hasMoreResults = false;
        isLoadingNextChunk = false;

        const $table = $(`#${tableId}`);
        const alreadyInitialized = $.fn.DataTable.isDataTable($table);

        if (alreadyInitialized) {
            const api = $table.DataTable();
            api.page.len(PAGE_CHUNK);
            api.page("first");
            api.ajax.reload();
            return;
        }

        loadDataTable({
            tableId,
            ajaxUrl: "/api/photo/photoList",
            columns: getPhotoTableColumns(),
            defaultOrderIndex: 1,
            getExtraDataFn: () => getSearchAllParams(),
            onDrawCallbackList: [
                (api) => {
                    photoCardList(api);
                    syncInfiniteScrollState(api);
                    resolveNextGridDraw();
                }
            ],
            stateStorageKey: "editorPhotoModalState",
            extraOptions: {
                pageLength: PAGE_CHUNK,
                dom: "t"
            }
        });
    }

    async function prepareAndOpenImageModal() {
        if (isPreparingModalOpen) {
            return;
        }

        isPreparingModalOpen = true;
        try {
            await ensurePhotoCategoryOptions();

            const parentInput = document.getElementById("search-img-text");
            const seed = parentInput ? parentInput.value.trim() : "";
            searchInput.value = seed;

            const drawPromise = waitForNextGridDraw();
            loadSearch();
            await drawPromise;

            const bsModal = bootstrap.Modal.getOrCreateInstance(imageModal);
            bsModal.show();
        } catch (error) {
            console.error(error);
            const bsModal = bootstrap.Modal.getOrCreateInstance(imageModal);
            bsModal.show();
        } finally {
            isPreparingModalOpen = false;
        }
    }

    searchButton.addEventListener("click", loadSearch);
    searchInput.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") {
            return;
        }
        loadSearch(e);
    });
    categorySelect.addEventListener("change", loadSearch);
    document.querySelectorAll('.js-open-image-modal').forEach((trigger) => {
        if (trigger.dataset.preloadBound === "1") {
            return;
        }

        trigger.dataset.preloadBound = "1";
        trigger.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            void prepareAndOpenImageModal();
        });
    });
    scrollContainer.addEventListener("scroll", () => {
        if (!hasMoreResults || isLoadingNextChunk) {
            return;
        }

        const visibleBottom = scrollContainer.scrollTop + scrollContainer.clientHeight;
        if (visibleBottom < scrollContainer.scrollHeight - SCROLL_THRESHOLD) {
            return;
        }

        const $table = $(`#${tableId}`);
        if (!$.fn.DataTable.isDataTable($table)) {
            return;
        }

        loadNextChunk($table.DataTable());
    });

    rowContainer.addEventListener("click", (e) => {
        const tile = e.target.closest(".tile");
        if (!tile) {
            return;
        }
        applySelectedTile(tile);
    });

    insertButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const payload = {
            murl: document.getElementById("imgMUrl")?.value?.trim() || "",
            turl: document.getElementById("imgTUrl")?.value?.trim() || "",
            dataTitle: document.getElementById("imgTitle")?.value?.trim() || "",
            dataId: document.getElementById("imgDataId")?.value?.trim() || "",
            dataKey: document.getElementById("imgDataKey")?.value?.trim() || ""
        };

        const ed = window.editorReady ? await window.editorReady : window.mainEditor;
        if (!ed) {
            console.error("editor not found");
            return;
        }

        await ed.model.insertViaCommand(payload);

        const bsModal = bootstrap.Modal.getOrCreateInstance(imageModal);
        bsModal.hide();
    });

    imageModal.addEventListener("shown.bs.modal", () => {
        searchInput.focus();
    });

    imageModal.addEventListener("hidden.bs.modal", clearCreateForm);
}

export function addThumbnailEvent() {

    const fileInput = document.getElementById('formFile');
    if (!fileInput) return;
    fileInput.accept = IMAGE_FILE_ACCEPT;

    fileInput.addEventListener('change', async function (e) {
        const file = e.target.files[0];

        if (!file) return;

        const validationMessage = getImageUploadValidationMessage(file);
        if (validationMessage) {
            e.target.value = '';
            alert(validationMessage);
            return;
        }

        const formData = new FormData();
        const statusTarget = resolveSubAreaUploadStatusTarget({
            preferred: getThumbnailPreviewContainer(),
            fallbacks: [
                fileInput.closest('.card, .offcanvas, .tab-pane, .col, .col-lg-4, .col-xl-4'),
                fileInput
            ]
        });
        beginSubAreaUploadStatus(statusTarget);
        formData.append('upload', file);   // 서버에서 받는 파라미터명에 맞게 수정
        try {
            const res = await postFileWithCsrf(`/api/cover/upload`, formData);

            if (!res.ok) {
                const errorJson = await res.clone().json().catch(() => null);
                const errorMessage = typeof errorJson?.message === 'string'
                    ? errorJson.message.trim()
                    : '';
                const fallbackMessage = await res.text().catch(() => '');
                throw new Error(errorMessage || fallbackMessage || '업로드 중 오류가 발생했습니다.');
            }

            const json = await res.json();
            if (json?.success === false) {
                throw new Error(json.message || '업로드 중 오류가 발생했습니다.');
            }

            onModalCoverImageApplied(json.data); // 서버가 저장된 data 반환
        } catch (err) {
            console.error(err);
            e.target.value = '';
            alert(err?.message || '업로드 중 오류가 발생했습니다.');
        } finally {
            endSubAreaUploadStatus();
        }

    });
}

// 썸네일 커버 등록시 이미지 표기및 대표 이미지 선택
function onModalCoverImageApplied(data) {

    const container = getThumbnailPreviewContainer();
    if (!container) return;

    getAllPreviewFigures().forEach((figure) => {
        if (figure.dataset.role !== 'cover') return;
        const oldBlock = figure.closest('.img-block') || figure;
        oldBlock.remove();
    });

    const html = buildPreviewHtml({
        id: data.id,
        role: 'cover',
        imageUrl: data.mediumUrl,
        title: data.title
    });

    container.insertAdjacentHTML('afterbegin', html);
    const newFigure = container.querySelector(`.figure[data-id="${data.id}"]`);
    if (newFigure) {
        newFigure.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
}

// 수정조회시  썸네일 미지 표시
export function setRightPreviews(data) {
    const thumbnailPreviews = getThumbnailPreviewContainer();
    const rightPreviews = getPhotoPreviewContainer();

    if (data && data.cover) {
        const html = buildPreviewHtml({
            id: data.cover.id,
            role: 'cover',
            imageUrl: data.cover.mediumUrl,
            title: data.cover.title
        });
        thumbnailPreviews?.insertAdjacentHTML('beforeend', html);
    }


    const items = Array.isArray(data && data.relatedPhotos)
        ? data.relatedPhotos
        : [];

    items.forEach(function (item) {
        const html = buildPreviewHtml({
            id: item.photoId,
            role: 'photo',
            imageUrl: item.mediumUrl,
            title: item.title
        });
        rightPreviews?.insertAdjacentHTML('beforeend', html);
    });

    initRightPreviewDefault();
}

// 자동저장 이어쓰기시 content 안에 있는 이미지 right-preview 영역에 바인딩
export function setRightPreviewsFromContent(content) {
    const rightPreviews = getPhotoPreviewContainer();
    if (!rightPreviews) {
        return;
    }

    rightPreviews.innerHTML = '';

    const photoSeqInput = document.getElementById('photoSeqId');
    if (photoSeqInput) {
        photoSeqInput.value = '';
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = content || '';

    const seen = new Set();
    const images = Array.from(wrapper.querySelectorAll('img[src]'));
    const isRelatedNewsGuideImage = (img) => {
        if (!img) {
            return false;
        }

        const src = (img.getAttribute('src') || '').trim();
        const alt = (img.getAttribute('alt') || '').trim();
        const figure = img.closest('figure');

        return src === '/images/related_article_sample.png'
            || alt === 'related article sample marker'
            || alt === 'related article sample'
            || figure?.classList?.contains('ck-related-news-marker');
    };

    images.forEach((img, index) => {
        if (isRelatedNewsGuideImage(img)) {
            return;
        }

        const imageUrl = img.getAttribute('src')?.trim();
        if (!imageUrl) {
            return;
        }

        const imageId = (img.dataset.id || '').trim();
        const dedupeKey = `${imageId}::${imageUrl}`;
        if (seen.has(dedupeKey)) {
            return;
        }
        seen.add(dedupeKey);

        const title = (img.getAttribute('alt') || img.getAttribute('title') || `image-${index + 1}`).trim();
        const html = buildPreviewHtml({
            id: imageId,
            role: 'photo',
            imageUrl,
            title
        });

        rightPreviews.insertAdjacentHTML('beforeend', html);
    });

    const firstFigure = rightPreviews.querySelector('.figure');
    if (firstFigure) {
        selectPreviewFigure(firstFigure);
    }
}

// 조회시 설정
function initRightPreviewDefault() {
    const figures = getAllPreviewFigures();
    if (figures.length === 0) return;

    const coverFigure = figures.find((figure) => figure.dataset.role === 'cover');
    const photoFigure = figures.find((figure) => figure.dataset.role === 'photo');
    let targetFigure = null;

    if (coverFigure) {
        targetFigure = coverFigure;
    } else if (photoFigure) {
        targetFigure = photoFigure;
    } else {
        targetFigure = figures[0];
    }

    selectPreviewFigure(targetFigure);
}


export function openModalWithData(modalId, { bcmId, bcmCorpName, dartCorpCode }) {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) return;

    // modal dataset 세팅
    modalEl.dataset.bcmId = bcmId ?? "";
    modalEl.dataset.bcmCorpName = bcmCorpName ?? "";
    modalEl.dataset.dartCorpCode = dartCorpCode ?? "";

    // bcmCorpName 바인딩
    const bcmCorpNameEl = modalEl.querySelector(".bcm-corp-name");
    if (bcmCorpNameEl) {
        bcmCorpNameEl.value = bcmCorpName;
    }

    // 모달 열기 (바깥 클릭, ESC 닫힘 방지)
    const modal = new bootstrap.Modal(modalEl, {
        backdrop: 'static',  // 바깥 클릭 닫힘 방지
        keyboard: false      // ESC 닫힘 방지
    });

    modal.show();
}

export function bindDealDataModalButtons() {
    const selectedList = document.querySelector(".deal-data-result .list-group");
    if (!selectedList) return;

    if (selectedList.dataset.modalBound === "1") return;
    selectedList.dataset.modalBound = "1";

    selectedList.addEventListener("click", function (e) {
        const stockBtn = e.target.closest(".btn-open-stock");
        const dealBtn = e.target.closest(".btn-open-deal");
        if (!stockBtn && !dealBtn) return;

        const li = e.target.closest("li[data-id]");
        if (!li) return;

        const payload = {
            bcmId: li.dataset.bcmId,
            bcmCorpName: li.dataset.bcmCorpName,
            dartCorpCode: li.dataset.dartCorpCode
        };

        if (stockBtn) {
            // stock1 modal이 열리는 동장이 두군데라 꼭 여기서 열릴때 초기화해줘야함
            resetStock1Modal();
            openModalWithData("stock1-modal", payload);
        }

        if (dealBtn) {
            openModalWithData("deal-modal", payload);
        }
    });
}

function ensureSubAreaUploadStatus() {
    if (window.__subAreaUploadStatus) {
        return window.__subAreaUploadStatus;
    }

    if (!document.getElementById("sub-area-upload-status-styles")) {
        const style = document.createElement("style");
        style.id = "sub-area-upload-status-styles";
        style.textContent = `
            .sub-area-upload-status-anchor {
                position: fixed;
                top: 12px;
                left: 50%;
                z-index: 1080;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.18s ease;
                transform: translateX(-50%);
            }

            .sub-area-upload-status-anchor.is-active-area {
                opacity: 1;
            }

            .sub-area-upload-status-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 999px;
                background: rgba(33, 37, 41, 0.88);
                color: #fff;
                font-size: 12px;
                font-weight: 600;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
                opacity: 0;
                transform: translateY(-10px);
                transition: opacity 0.18s ease, transform 0.18s ease;
            }

            .sub-area-upload-status-badge.is-visible {
                opacity: 1;
                transform: translateY(0);
            }

            .sub-area-upload-status-spinner {
                width: 12px;
                height: 12px;
                border: 2px solid rgba(255, 255, 255, 0.32);
                border-top-color: #fff;
                border-radius: 50%;
                animation: sub-area-upload-status-spin 0.8s linear infinite;
                flex: 0 0 auto;
            }

            @keyframes sub-area-upload-status-spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    const anchor = document.createElement("div");
    anchor.className = "sub-area-upload-status-anchor";

    const badge = document.createElement("div");
    badge.className = "sub-area-upload-status-badge";
    badge.setAttribute("aria-live", "polite");
    badge.setAttribute("aria-hidden", "true");
    badge.innerHTML = '<span class="sub-area-upload-status-spinner"></span><span class="sub-area-upload-status-text">이미지 업로드 중...</span>';

    anchor.appendChild(badge);
    document.body.appendChild(anchor);

    let activeCount = 0;
    let rafId = 0;
    let targetElement = null;

    const syncPosition = () => {
        if (!targetElement) {
            anchor.classList.remove("is-active-area");
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        const viewportPadding = 12;
        const visibleTop = Math.max(rect.top, viewportPadding);
        const visibleBottom = Math.min(rect.bottom, window.innerHeight - viewportPadding);
        const visibleHeight = visibleBottom - visibleTop;
        const isVisibleHorizontally = rect.right > viewportPadding && rect.left < window.innerWidth - viewportPadding;
        const isVisible = visibleHeight > 32 && isVisibleHorizontally;

        anchor.classList.toggle("is-active-area", isVisible);
        if (!isVisible) return;

        const top = Math.min(visibleTop + 12, Math.max(visibleTop, visibleBottom - 44));
        const left = Math.min(Math.max(rect.left + (rect.width / 2), 96), window.innerWidth - 96);

        anchor.style.top = `${Math.round(top)}px`;
        anchor.style.left = `${Math.round(left)}px`;
    };

    const scheduleSync = () => {
        if (rafId) return;
        rafId = window.requestAnimationFrame(() => {
            rafId = 0;
            syncPosition();
        });
    };

    const startTracking = () => {
        window.addEventListener("scroll", scheduleSync, true);
        window.addEventListener("resize", scheduleSync);
        scheduleSync();
    };

    const stopTracking = () => {
        window.removeEventListener("scroll", scheduleSync, true);
        window.removeEventListener("resize", scheduleSync);
        if (rafId) {
            window.cancelAnimationFrame(rafId);
            rafId = 0;
        }
        anchor.classList.remove("is-active-area");
    };

    window.__subAreaUploadStatus = {
        begin(nextTargetElement) {
            activeCount += 1;
            targetElement = nextTargetElement || targetElement || document.getElementById("right-previews");
            badge.classList.add("is-visible");
            badge.setAttribute("aria-hidden", "false");
            startTracking();
        },
        end() {
            activeCount = Math.max(0, activeCount - 1);
            if (activeCount > 0) {
                scheduleSync();
                return;
            }

            targetElement = null;
            badge.classList.remove("is-visible");
            badge.setAttribute("aria-hidden", "true");
            stopTracking();
        }
    };

    return window.__subAreaUploadStatus;
}

function beginSubAreaUploadStatus(targetElement) {
    ensureSubAreaUploadStatus().begin(targetElement);
}

function endSubAreaUploadStatus() {
    ensureSubAreaUploadStatus().end();
}

function resolveSubAreaUploadStatusTarget({ preferred, fallbacks = [] } = {}) {
    const candidates = [preferred, ...fallbacks].filter(Boolean);

    for (const candidate of candidates) {
        if (isUsableStatusTarget(candidate)) {
            return candidate;
        }
    }

    return candidates[0] || document.body;
}

function isUsableStatusTarget(element) {
    if (!element || typeof element.getBoundingClientRect !== 'function') {
        return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 32;
}

const IMAGE_FILE_ACCEPT = 'image/*';
const IMAGE_FILE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_FILE_MAX_SIZE_LABEL = '5MB';

function getImageUploadValidationMessage(file) {
    if (!file) {
        return '업로드할 파일을 찾을 수 없습니다.';
    }

    if (!file.type.startsWith('image/')) {
        return '이미지 파일만 업로드할 수 있습니다.';
    }

    if (file.size > IMAGE_FILE_MAX_SIZE_BYTES) {
        return `이미지 파일은 ${IMAGE_FILE_MAX_SIZE_LABEL} 이하만 업로드할 수 있습니다.`;
    }

    return '';
}

async function uploadImagesFromFileInput(files) {
    const uploadUrl = '/api/photo/upload';
    const validFiles = [];

    for (const file of files) {
        const validationMessage = getImageUploadValidationMessage(file);
        if (validationMessage) {
            alert(`${file?.name || '파일'}: ${validationMessage}`);
            continue;
        }

        validFiles.push(file);
    }

    if (validFiles.length === 0) {
        return;
    }

    const statusTarget = document.getElementById('imageDropzone')
        || document.getElementById('formFileImages')
        || document.getElementById('right-previews')
        || document.body;

    // ✅ 업로드 시작 — 오버레이
    const overlayTargets = [
        document.getElementById('imageDropzone'),
        document.getElementById('formFileImages')
    ];
    beginSubAreaUploadStatus(statusTarget);
    try {
    overlayTargets.forEach(el => {
        if (!el) return;
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.5';
    });

    for (const file of validFiles) {
        try {
            const formData = new FormData();
            formData.append('upload', file);

            const res = await postFileWithCsrf(uploadUrl, formData);

            if (!res.ok) {
                const errorJson = await res.clone().json().catch(() => null);
                const errorMessage = typeof errorJson?.message === 'string'
                    ? errorJson.message.trim()
                    : '';
                const fallbackMessage = await res.text().catch(() => '');
                throw new Error(errorMessage || fallbackMessage || '업로드 중 오류가 발생했습니다.');
            }

            const json = await res.json();
            if (json?.success === false) {
                throw new Error(json.message || '업로드 중 오류가 발생했습니다.');
            }
            const dataArr = json && json.data;
            const data  = Array.isArray(dataArr) ? dataArr[0] : dataArr;
            const id    = (data && data.id)        || null;
            const key   = (data && data.hashkey)   || null;
            const murl  = (data && data.mediumUrl) || null;
            const turl  = (data && (data.thumbUrl || data.originalUrl)) || null;
            const title = (data && data.title)     || file.name || '';

            if (!turl) throw new Error('업로드 응답에 이미지 URL이 없습니다.');

            // 에디터에 이미지 삽입
            const editor = window.mainEditor;
            if (editor) {
                editor.editing.view.focus();
                const imgHtml = `<figure class="image"><img src="${turl}" alt="${title}" data-id="${id}" data-key="${key || ''}"/></figure><p></p>`;
                editor.model.change(() => {
                    const viewFragment = editor.data.processor.toView(imgHtml);
                    const modelFragment = editor.data.toModel(viewFragment);
                    editor.model.insertContent(modelFragment, editor.model.document.selection);
                });
            }

            // right-previews에 이미지 추가
            const rightPreviewsEl = document.getElementById('right-previews');
            if (rightPreviewsEl) {
                const hadSelected = !!rightPreviewsEl.querySelector('.figure[data-clicked="true"]');
                const previewHtml = buildPreviewHtml({
                    id,
                    role: 'photo',
                    imageUrl: murl,
                    title
                });
                rightPreviewsEl.insertAdjacentHTML('beforeend', previewHtml);

                if (!hadSelected) {
                    const newFigure = rightPreviewsEl.querySelector(`.figure[data-id="${id}"]`);
                    if (newFigure) {
                        newFigure.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    }
                }
            }

        } catch (err) {
            console.error('[FileInput Upload] 실패:', file.name, err);
            alert(err?.message || '업로드 중 오류가 발생했습니다.');
        }
    }

    // ✅ 업로드 완료 — 오버레이 원복
    } finally {
        overlayTargets.forEach(el => {
            if (!el) return;
            el.style.pointerEvents = '';
            el.style.opacity = '';
        });
        endSubAreaUploadStatus();
    }
}

export function bindUploadImageInSubArea() {
    // file input 업로드
    const fileInput = document.getElementById('formFileImages');
    if (fileInput) {
        fileInput.accept = IMAGE_FILE_ACCEPT;
        fileInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;
            await uploadImagesFromFileInput(files);
            e.target.value = '';
        });
    }

    // Dropzone 직접 초기화 — 자동 업로드 끄고 uploadImagesFromFileInput 사용
    const dropzoneEl = document.getElementById('imageDropzone');
    if (dropzoneEl) {
        const dz = new Dropzone(dropzoneEl, {
            url: '/api/photo/upload',  // Dropzone 필수값이라 넣어두지만 실제론 안 씀
            autoProcessQueue: false,   // 자동 업로드 완전 차단
            acceptedFiles: IMAGE_FILE_ACCEPT,
            addRemoveLinks: false,
            previewsContainer: false,
        });

        dz.on('addedfile', async (file) => {
            await uploadImagesFromFileInput([file]);
            dz.removeFile(file);
        });
    }
}
