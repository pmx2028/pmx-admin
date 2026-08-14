// #modal-stock-utils.js
// modal-stock 모달에서 사용

import {initModalTableEditor, insertHtmlTableAsPluginTable} from "./ckeditor5_article.js";

let chartSeriesSourceSeq = 0;
let stockPreviewChartRoot = null;
let stockPreviewRequestDto = null;
let stockPreviewResponseDto = null;

export function initModalStockUtils() {
    initYearOptions();
    bindPeriodTypeChange();

    bindStockTypeChange();
    bindChartOutputChange();
    bindDataTypeBoxAddRemoveEvents();
    bindPreviewButtonActivation();

    bindStockTableDeleteEvents();
    bindStockApplyToEditor();

    bindStockTabActivation();
    bindSettingApplyToEditor();
    bindStockPreviewChartCleanup();

    const modal = document.getElementById("stock1-modal");
    if (modal) {
        initSelectorBoxSourceIds(modal);
        syncChartSeriesOptions(modal);
        modal.addEventListener("show.bs.modal", loadModalEditor);
    }
}

async function loadModalEditor() {
    window.modalTableEditor = await initModalTableEditor('modal-table-editor-textarea', ''); // ✅ 저장
}

function initYearOptions() {
    const startYearSelect = document.getElementById('startYear');
    const endYearSelect = document.getElementById('endYear');

    if (!startYearSelect || !endYearSelect) return;

    const currentYear = new Date().getFullYear();
    const baseYear = 2020;

    resetYearSelect(startYearSelect);
    resetYearSelect(endYearSelect);

    for (let year = baseYear; year <= currentYear; year++) {

        const startOption = document.createElement('option');
        startOption.value = year;
        startOption.textContent = year;
        startYearSelect.appendChild(startOption);

        const endOption = document.createElement('option');
        endOption.value = year;
        endOption.textContent = year;
        endYearSelect.appendChild(endOption);
    }
}

function resetYearSelect(selectEl) {
    // 첫번째 placeholder만 남기고 제거
    const firstOption = selectEl.querySelector('option');
    selectEl.innerHTML = '';
    if (firstOption) {
        selectEl.appendChild(firstOption);
    }
}

function bindPeriodTypeChange() {
    const periodType = document.getElementById('periodType');
    const startQuarter = document.getElementById('startQuarter');
    const endQuarter = document.getElementById('endQuarter');

    if (!periodType || !startQuarter || !endQuarter) return;

    periodType.addEventListener('change', function () {

        if (this.value === 'YEAR') {
            resetQuarter(startQuarter);
            resetQuarter(endQuarter);

            startQuarter.disabled = true;
            endQuarter.disabled = true;
        }

        if (this.value === 'QUARTER') {
            startQuarter.disabled = false;
            endQuarter.disabled = false;
        }
    });
}

function resetQuarter(selectEl) {
    selectEl.selectedIndex = 0;
}

function hasMeaningfulSelectValue(selectEl) {
    if (!selectEl) return false;
    if (selectEl.selectedIndex <= 0) return false;

    const value = selectEl.value ?? '';
    return value.trim() !== '';
}

function getMeaningfulSelectValue(selectEl) {
    return hasMeaningfulSelectValue(selectEl) ? (selectEl.value ?? '').trim() : '';
}

function bindChartOutputChange() {
    const modal = document.getElementById('stock1-modal');
    if (!modal) return;

    if (modal.dataset.boundChartOutput === '1') return;
    modal.dataset.boundChartOutput = '1';

    modal.addEventListener('change', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        if (target.id === 'chartType' && target.value) {
            const resultChart = modal.querySelector('#resultChart');
            if (resultChart) resultChart.checked = true;
        }

        if (
            target.id === 'resultTable' ||
            target.id === 'resultChart' ||
            target.id === 'chartType' ||
            target.id === 'checkData' ||
            target.id === 'checkRatio' ||
            target.classList.contains('fsStatement') ||
            target.classList.contains('fsAccount')
        ) {
            syncChartSeriesOptions(modal);
        }
    });
}

function initSelectorBoxSourceIds(modal) {
    modal.querySelectorAll('.selector-box').forEach(assignSelectorBoxSourceId);
}

function assignSelectorBoxSourceId(box) {
    if (!box) return;
    if (!box.dataset.seriesSourceId) {
        chartSeriesSourceSeq += 1;
        box.dataset.seriesSourceId = `chart-series-${chartSeriesSourceSeq}`;
    }
}

function syncChartSeriesOptions(modal) {
    if (!modal) return;

    const resultChart = modal.querySelector('#resultChart');
    const chartType = modal.querySelector('#chartType');
    const tableHeaderPosition = modal.querySelector('#tableHeaderPosition');
    const hideBox = modal.querySelector('.hide-box');
    let list = hideBox?.querySelector('.chart-series-list');

    const isChartMode = resultChart?.checked ?? false;

    if (chartType) chartType.disabled = !isChartMode;
    if (tableHeaderPosition) tableHeaderPosition.disabled = isChartMode;
    if (hideBox) hideBox.style.display = isChartMode ? 'block' : 'none';

    if (!hideBox) return;

    if (!list) {
        hideBox.innerHTML = '';
        list = document.createElement('div');
        list.className = 'chart-series-list';
        hideBox.appendChild(list);
    }

    if (!isChartMode) return;

    const existingSelections = new Map(
        Array.from(list.querySelectorAll('.chart-series-axis-type'))
            .map(select => [select.dataset.sourceId, select.value])
    );

    const seriesItems = collectSelectedChartSeriesItems(modal);
    list.innerHTML = '';

    if (!seriesItems.length) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'form-text text-muted mb-0';
        emptyMessage.textContent = '차트로 표시할 데이터를 먼저 선택해주세요.';
        list.appendChild(emptyMessage);
        return;
    }

    seriesItems.forEach(item => {
        const row = createChartSeriesOptionRow(
            item,
            chartType?.value ?? '',
            existingSelections.get(item.sourceId) ?? ''
        );
        list.appendChild(row);
    });
}

function collectSelectedChartSeriesItems(modal) {
    initSelectorBoxSourceIds(modal);

    const items = [];
    appendChartSeriesItems(modal, 'DATA', items);
    appendChartSeriesItems(modal, 'RATIO', items);
    return items;
}

function appendChartSeriesItems(modal, category, items) {
    const checkboxId = category === 'DATA' ? '#checkData' : '#checkRatio';
    const isChecked = modal.querySelector(checkboxId)?.checked ?? false;
    if (!isChecked) return;

    const statements = modal.querySelectorAll(`.fsStatement[data-category="${category}"]`);
    statements.forEach(statementSelect => {
        const box = statementSelect.closest('.selector-box');
        const accountSelect = box?.querySelector('.fsAccount');
        const statementValue = getMeaningfulSelectValue(statementSelect);
        const accountValue = getMeaningfulSelectValue(accountSelect);

        if (!statementValue || !accountValue || !box) return;

        assignSelectorBoxSourceId(box);

        items.push({
            sourceId: box.dataset.seriesSourceId,
            category,
            type: statementValue,
            code: accountValue,
            displayName: accountSelect.selectedOptions?.[0]?.textContent?.trim() ?? '',
            statementLabel: statementSelect.selectedOptions?.[0]?.textContent?.trim() ?? '',
            accountLabel: accountSelect.selectedOptions?.[0]?.textContent?.trim() ?? ''
        });
    });
}

function createChartSeriesOptionRow(item, chartType, selectedValue) {
    const row = document.createElement('div');
    row.className = 'input-group mt-1';
    row.dataset.sourceId = item.sourceId;

    const statementInput = document.createElement('input');
    statementInput.type = 'text';
    statementInput.className = 'form-control me-1';
    statementInput.disabled = true;
    statementInput.value = item.statementLabel;

    const accountInput = document.createElement('input');
    accountInput.type = 'text';
    accountInput.className = 'form-control me-1';
    accountInput.disabled = true;
    accountInput.value = item.accountLabel;

    const select = document.createElement('select');
    select.className = 'form-select chart-series-axis-type';
    select.dataset.sourceId = item.sourceId;

    buildChartSeriesOptionList(chartType).forEach(optionData => {
        const option = document.createElement('option');
        option.value = optionData.value;
        option.textContent = optionData.label;
        if (optionData.value === selectedValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    row.appendChild(statementInput);
    row.appendChild(accountInput);
    row.appendChild(select);

    return row;
}

function buildChartSeriesOptionList(chartType) {
    const placeholder = {value: '', label: '차트 계열 속성 선택'};

    if (chartType === 'LINE') {
        return [
            placeholder,
            {value: 'LINE_LEFT', label: 'Line (Y축 좌측)'},
            {value: 'LINE_RIGHT', label: 'Line (Y축 우측)'}
        ];
    }

    if (chartType === 'BAR') {
        return [
            placeholder,
            {value: 'BAR_LEFT', label: 'Bar (Y축 좌측)'},
            {value: 'BAR_RIGHT', label: 'Bar (Y축 우측)'}
        ];
    }

    if (chartType === 'PIE') {
        return [
            placeholder,
            {value: 'PIE', label: 'Pie'}
        ];
    }

    return [
        placeholder,
        {value: 'LINE_LEFT', label: 'Line (Y축 좌측)'},
        {value: 'LINE_RIGHT', label: 'Line (Y축 우측)'},
        {value: 'BAR_LEFT', label: 'Bar (Y축 좌측)'},
        {value: 'BAR_RIGHT', label: 'Bar (Y축 우측)'}
    ];
}

function bindStockPreviewChartCleanup() {
    const previewModal = document.getElementById('stock2-modal');
    if (!previewModal) return;

    if (previewModal.dataset.boundChartCleanup === '1') return;
    previewModal.dataset.boundChartCleanup = '1';

    previewModal.addEventListener('hidden.bs.modal', () => {
        resetStockPreviewModal(previewModal);
    });
}

function disposeStockPreviewChart() {
    if (stockPreviewChartRoot) {
        stockPreviewChartRoot.dispose();
        stockPreviewChartRoot = null;
    }

    const container = document.getElementById('amcharts-container');
    if (container) {
        container.innerHTML = '';
    }
}

function resetStockPreviewModal(previewModal) {
    if (!previewModal) return;

    disposeStockPreviewChart();
    stockPreviewRequestDto = null;
    stockPreviewResponseDto = null;

    const applyBtn = previewModal.querySelector('#btn-db-upload-html');
    if (applyBtn) {
        const defaultText = applyBtn.dataset.defaultText || applyBtn.textContent;
        applyBtn.dataset.defaultText = defaultText;
        applyBtn.disabled = false;
        applyBtn.textContent = defaultText;
    }

    const tableSkin1 = previewModal.querySelector('#tableSkin1');
    const tableSkin2 = previewModal.querySelector('#tableSkin2');
    const infographicSkin = previewModal.querySelector('#infographicSkin');

    if (tableSkin1) tableSkin1.style.display = 'none';
    if (tableSkin2) tableSkin2.style.display = 'none';
    if (infographicSkin) infographicSkin.style.display = 'none';
}

function bindDataTypeBoxAddRemoveEvents() {
    document.addEventListener('click', function (event) {

        // "+" 버튼 클릭
        if (event.target.classList.contains('stock-data-add-btn')
            && event.target.textContent === '+') {

            const originalBox = event.target.closest('.selector-box');
            if (!originalBox) return;

            const copiedBox = originalBox.cloneNode(true);
            delete copiedBox.dataset.seriesSourceId;
            assignSelectorBoxSourceId(copiedBox);
            resetSelectorBoxSelection(copiedBox);

            // 버튼 상태 변경
            const addButton = copiedBox.querySelector('.str-btn');
            addButton.classList.remove('btn-primary');
            addButton.classList.add('btn-danger', 'stock-data-minus-btn');
            addButton.textContent = '-';

            const container = originalBox.parentElement;
            const boxes = container.querySelectorAll('.selector-box');
            const last = boxes[boxes.length - 1];
            last.insertAdjacentElement('afterend', copiedBox);
            syncChartSeriesOptions(document.getElementById('stock1-modal'));

        }

        // "-" 버튼 클릭 시 삭제
        if (event.target.classList.contains('stock-data-minus-btn')
            && event.target.textContent === '-') {

            const targetBox = event.target.closest('.selector-box');
            targetBox.remove();
            syncChartSeriesOptions(document.getElementById('stock1-modal'));
        }
    });
}

function bindStockTypeChange() {
    const modal = document.getElementById('stock1-modal');
    if (!modal) return;

    modal.addEventListener('change', async (event) => {
        const target = event.target;

        if (target.classList.contains('fsAccount')) {
            const box = target.closest('.selector-box');
            autoCheckByFinancialSelection(box);
            return;
        }

        const statementSelect = target;
        if (!statementSelect.classList.contains('fsStatement')) return;

        const box = statementSelect.closest('.selector-box');
        if (!box) return;

        const accountSelect = box.querySelector('.fsAccount');
        if (!accountSelect) return;

        const type = getMeaningfulSelectValue(statementSelect);
        resetAccountSelect(accountSelect);

        if (!type) return;

        const category = statementSelect.dataset.category;

        accountSelect.disabled = true;

        try { if (false) {
                alert("삽입할 미리보기를 찾지 못했습니다.");
            }

            if (false) {
            }
            const res = await fetch(`/api/editor/financial/options?category=${encodeURIComponent(category)}&type=${encodeURIComponent(type)}`);
            if (!res.ok) throw new Error('api failed');

            const options = await res.json();
            const items = options.data;

            items.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o.code;
                opt.textContent = o.displayName;
                accountSelect.appendChild(opt);
            });
        } catch (e) {
            // 실패 시 비워둠(필요하면 alert 처리)
            resetAccountSelect(accountSelect);
        } finally {
            accountSelect.disabled = false;
            autoCheckByFinancialSelection(box);
        }
    });
}

function autoCheckByFinancialSelection(box) {
    if (!box) return;

    const statementSelect = box.querySelector('.fsStatement');
    const accountSelect = box.querySelector('.fsAccount');

    const category = statementSelect?.dataset.category;
    const statementValue = getMeaningfulSelectValue(statementSelect);
    const accountValue = getMeaningfulSelectValue(accountSelect);

    if (!statementValue || !accountValue) return;

    if (category === 'DATA') {
        const checkData = document.getElementById('checkData');
        if (checkData) checkData.checked = true;
    }

    if (category === 'RATIO') {
        const checkRatio = document.getElementById('checkRatio');
        if (checkRatio) checkRatio.checked = true;
    }
}

function resetAccountSelect(selectEl) {
    selectEl.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.selected = true;
    placeholder.textContent = '계정과목 선택';
    selectEl.appendChild(placeholder);
}

function resetSelectorBoxSelection(box) {
    if (!box) return;

    const statementSelect = box.querySelector('.fsStatement');
    const accountSelect = box.querySelector('.fsAccount');

    if (statementSelect) {
        statementSelect.selectedIndex = 0;
    }

    if (accountSelect) {
        resetAccountSelect(accountSelect);
    }
}

function collectChartSeriesConfigs(modal) {
    if (!modal) return [];

    const seriesItems = collectSelectedChartSeriesItems(modal);
    const selectedAxisTypes = new Map(
        Array.from(modal.querySelectorAll('.chart-series-axis-type'))
            .map(select => [select.dataset.sourceId, select.value ?? ''])
    );

    return seriesItems.map(item => ({
        ...item,
        axisType: selectedAxisTypes.get(item.sourceId) ?? ''
    }));
}

function getChartSeriesDisplayName(seriesConfig) {
    const baseName = seriesConfig.displayName || seriesConfig.accountLabel || seriesConfig.code || '';
    if (!baseName) return '';

    return seriesConfig.axisType?.endsWith('_LEFT')
        ? `${baseName}(좌)`
        : baseName;
}

// 요청 DTO 만들기
function buildFinancialPreviewReqDto() {
    const modal = document.getElementById('stock1-modal');
    if (!modal) return null;

    const corpCode = modal.dataset.dartCorpCode ?? '';
    const corpName = modal.dataset.bcmCorpName ?? '';

    const fsDiv = modal.querySelector('#fsType')?.value ?? '';
    const amountUnit = modal.querySelector('#amountUnit')?.value ?? '';
    const resultChart = modal.querySelector('#resultChart')?.checked ?? false;
    const chartSeriesConfigs = resultChart ? collectChartSeriesConfigs(modal) : [];
    const chartType = resultChart ? (modal.querySelector('#chartType')?.value ?? '') : '';

    if (resultChart) {
        const chartSeriesConfigs = collectChartSeriesConfigs(modal);
        if (!chartSeriesConfigs.length) {
            alert('차트로 표시할 데이터를 먼저 선택해주세요.');
            return false;
        }

        if (chartSeriesConfigs.some(series => !series.axisType)) {
            alert('차트 계열 속성을 모두 선택해주세요.');
            return false;
        }
    }

    if (resultChart) {
        const chartSeriesConfigs = collectChartSeriesConfigs(modal);
        if (!chartSeriesConfigs.length) {
            alert('차트로 표시할 데이터를 먼저 선택해주세요.');
            return false;
        }

        if (chartSeriesConfigs.some(series => !series.axisType)) {
            alert('차트 계열 속성을 모두 선택해주세요.');
            return false;
        }
    }

    const periodType = modal.querySelector('#periodType')?.value ?? '';
    const startYear = parseInt(modal.querySelector('#startYear')?.value ?? '', 10);
    const endYear = parseInt(modal.querySelector('#endYear')?.value ?? '', 10);

    let startQuarter = null;
    let endQuarter = null;
    if (periodType === 'QUARTER') {
        startQuarter = parseInt(modal.querySelector('#startQuarter')?.value ?? '', 10);
        endQuarter = parseInt(modal.querySelector('#endQuarter')?.value ?? '', 10);
    }

    const items = [];

    // DATA
    const checkData = modal.querySelector('#checkData')?.checked ?? false;
    if (resultChart) {
        const chartType = modal.querySelector('#chartType')?.value ?? '';
        if (!chartType) {
            alert('차트 종류를 선택해주세요.');
            return false;
        }

        if (chartType === 'PIE') {
            alert('현재 미리보기는 Line, Bar, Combination 차트만 지원합니다.');
            return false;
        }
    }

    if (resultChart) {
        const chartType = modal.querySelector('#chartType')?.value ?? '';
        if (!chartType) {
            alert('차트 종류를 선택해주세요.');
            return false;
        }

        if (chartType === 'PIE') {
            alert('현재 미리보기는 Line, Bar, Combination 차트만 지원합니다.');
            return false;
        }
    }

    if (checkData) {
        const dataStatements = modal.querySelectorAll('.fsStatement[data-category="DATA"]');
        dataStatements.forEach(st => {
            const box = st.closest('.selector-box');
            const account = box?.querySelector('.fsAccount');
            const code = getMeaningfulSelectValue(account);

            if (!code) return;

            const type = getMeaningfulSelectValue(st);
            const displayName = account?.selectedOptions?.[0]?.textContent ?? '';

            items.push({
                category: 'DATA',
                type,
                code,
                displayName
            });
        });
    }

    // RATIO
    const checkRatio = modal.querySelector('#checkRatio')?.checked ?? false;
    if (checkRatio) {
        const ratioStatements = modal.querySelectorAll('.fsStatement[data-category="RATIO"]');
        ratioStatements.forEach(st => {
            const box = st.closest('.selector-box');
            const account = box?.querySelector('.fsAccount');
            const code = getMeaningfulSelectValue(account);

            if (!code) return;

            const type = getMeaningfulSelectValue(st);
            const displayName = account?.selectedOptions?.[0]?.textContent ?? '';

            items.push({
                category: 'RATIO',
                type,
                code,
                displayName
            });
        });
    }

    return {
        corpCode,
        corpName,
        fsDiv,
        amountUnit,
        periodType,
        startYear: Number.isNaN(startYear) ? null : startYear,
        startQuarter,
        endYear: Number.isNaN(endYear) ? null : endYear,
        endQuarter,
        items
    };
}

// 데이터 조회 호출
function buildFinancialPreviewRequestDto() {
    const modal = document.getElementById('stock1-modal');
    if (!modal) return null;

    const corpCode = modal.dataset.dartCorpCode ?? '';
    const corpName = modal.dataset.bcmCorpName ?? '';
    const fsDiv = modal.querySelector('#fsType')?.value ?? '';
    const amountUnit = modal.querySelector('#amountUnit')?.value ?? '';
    const periodType = modal.querySelector('#periodType')?.value ?? '';
    const startYear = parseInt(modal.querySelector('#startYear')?.value ?? '', 10);
    const endYear = parseInt(modal.querySelector('#endYear')?.value ?? '', 10);
    const resultChart = modal.querySelector('#resultChart')?.checked ?? false;
    const chartSeriesConfigs = resultChart ? collectChartSeriesConfigs(modal) : [];
    const chartType = resultChart ? (modal.querySelector('#chartType')?.value ?? '') : '';

    if (resultChart) {
        if (!chartSeriesConfigs.length) {
            alert('차트로 표시할 데이터를 먼저 선택해주세요.');
            return null;
        }

        if (chartSeriesConfigs.some(series => !series.axisType)) {
            alert('차트 계열 속성을 모두 선택해주세요.');
            return null;
        }

        if (!chartType) {
            alert('차트 종류를 선택해주세요.');
            return null;
        }

        if (chartType === 'PIE') {
            alert('현재 미리보기는 Line, Bar, Combination 차트만 지원합니다.');
            return null;
        }
    }

    let startQuarter = null;
    let endQuarter = null;
    if (periodType === 'QUARTER') {
        startQuarter = parseInt(modal.querySelector('#startQuarter')?.value ?? '', 10);
        endQuarter = parseInt(modal.querySelector('#endQuarter')?.value ?? '', 10);
    }

    const items = [];

    const checkData = modal.querySelector('#checkData')?.checked ?? false;
    if (checkData) {
        const dataStatements = modal.querySelectorAll('.fsStatement[data-category="DATA"]');
        dataStatements.forEach(st => {
            const box = st.closest('.selector-box');
            const account = box?.querySelector('.fsAccount');
            const code = getMeaningfulSelectValue(account);
            const type = getMeaningfulSelectValue(st);

            if (!code || !type) return;

            items.push({
                category: 'DATA',
                type,
                code,
                displayName: account?.selectedOptions?.[0]?.textContent ?? ''
            });
        });
    }

    const checkRatio = modal.querySelector('#checkRatio')?.checked ?? false;
    if (checkRatio) {
        const ratioStatements = modal.querySelectorAll('.fsStatement[data-category="RATIO"]');
        ratioStatements.forEach(st => {
            const box = st.closest('.selector-box');
            const account = box?.querySelector('.fsAccount');
            const code = getMeaningfulSelectValue(account);
            const type = getMeaningfulSelectValue(st);

            if (!code || !type) return;

            items.push({
                category: 'RATIO',
                type,
                code,
                displayName: account?.selectedOptions?.[0]?.textContent ?? ''
            });
        });
    }

    return {
        corpCode,
        corpName,
        fsDiv,
        amountUnit,
        periodType,
        startYear: Number.isNaN(startYear) ? null : startYear,
        startQuarter,
        endYear: Number.isNaN(endYear) ? null : endYear,
        endQuarter,
        items
    };
}

async function requestFinancialPreviewData(dto) {
    const res = await postWithCsrf('/api/editor/financial/data', dto);

    if (!res.ok) throw new Error('api failed');
    return await res.json(); // ResponseDto
}

// 미리보기 버튼 이벤트
function bindPreviewButtonActivation() {
    const btn = document.getElementById("btn-stock-preview");
    if (!btn) return;

    btn.addEventListener("click", async function () {

        if (!validateStockPreviewForm()) return;

        // ✅ 조회 먼저
        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = '조회중...';

        try {
            const dto = buildFinancialPreviewRequestDto();
            if (!dto) return;

            const response = await requestFinancialPreviewData(dto);
            stockPreviewRequestDto = dto;
            stockPreviewResponseDto = response;

            if (!response?.success) {
                alert(response?.message ?? '조회에 실패했습니다.');
                return;
            }

            // 1. 현재 모달 닫기
            const currentModalEl = document.getElementById("stock1-modal");
            const currentModal = bootstrap.Modal.getInstance(currentModalEl);
            if (currentModal) currentModal.hide();

            renderStockPreviewTable(response);

            // 2. 미리보기 모달 열기
            const previewModalEl = document.getElementById("stock2-modal");
            const previewModal = new bootstrap.Modal(previewModalEl);
            previewModal.show();

        } catch (e) {
            alert('재무데이터 조회 중 오류가 발생했습니다.');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

function validateStockPreviewForm() {
    const modal = document.getElementById('stock1-modal');
    if (!modal) return false;

    const fsType = modal.querySelector('#fsType')?.value ?? '';
    if (!fsType) {
        alert('별도·연결을 선택해주세요.');
        return false;
    }

    const amountUnit = modal.querySelector('#amountUnit')?.value ?? '';
    if (!amountUnit) {
        alert('금액 단위를 선택해주세요.');
        return false;
    }

    const checkData = modal.querySelector('#checkData')?.checked ?? false;
    const checkRatio = modal.querySelector('#checkRatio')?.checked ?? false;
    const resultChart = modal.querySelector('#resultChart')?.checked ?? false;
    if (!checkData && !checkRatio) {
        alert('재무데이터 또는 재무비율 중 최소 1개를 선택해주세요.');
        return false;
    }

    // 체크된 항목만 selector-box 검증
    if (resultChart) {
        const chartType = modal.querySelector('#chartType')?.value ?? '';
        if (!chartType) {
            alert('차트 종류를 선택해주세요.');
            return false;
        }

        if (chartType === 'PIE') {
            alert('현재 미리보기는 Line, Bar, Combination 차트만 지원합니다.');
            return false;
        }
    }

    if (checkData) {
        const dataBoxes = modal.querySelectorAll('.fsStatement[data-category="DATA"]')
        if (!dataBoxes.length) {
            alert('재무데이터 항목을 추가해주세요.');
            return false;
        }
        for (const st of dataBoxes) {
            const box = st.closest('.selector-box');
            const account = box?.querySelector('.fsAccount');
            const statementVal = getMeaningfulSelectValue(st);
            const accountVal = getMeaningfulSelectValue(account);
            if (!statementVal || !accountVal) {
                alert('재무데이터의 재무제표/계정과목을 모두 선택해주세요.');
                return false;
            }
        }
    }

    if (checkRatio) {
        const ratioBoxes = modal.querySelectorAll('.fsStatement[data-category="RATIO"]')
        if (!ratioBoxes.length) {
            alert('재무비율 항목을 추가해주세요.');
            return false;
        }
        for (const st of ratioBoxes) {
            const box = st.closest('.selector-box');
            const account = box?.querySelector('.fsAccount');
            const statementVal = getMeaningfulSelectValue(st);
            const accountVal = getMeaningfulSelectValue(account);
            if (!statementVal || !accountVal) {
                alert('재무비율의 범주/재무비율을 모두 선택해주세요.');
                return false;
            }
        }
    }

    if (resultChart) {
        const chartSeriesConfigs = collectChartSeriesConfigs(modal);
        if (!chartSeriesConfigs.length) {
            alert('차트로 표시할 데이터를 먼저 선택해주세요.');
            return false;
        }

        if (chartSeriesConfigs.some(series => !series.axisType)) {
            alert('차트 계열 속성을 모두 선택해주세요.');
            return false;
        }
    }

    const periodType = modal.querySelector('#periodType')?.value ?? '';
    const startYear = modal.querySelector('#startYear')?.value ?? '';
    const endYear = modal.querySelector('#endYear')?.value ?? '';

    if (!periodType) {
        alert('연간·분기를 선택해주세요.');
        return false;
    }
    if (!startYear) {
        alert('시작 년도를 선택해주세요.');
        return false;
    }
    if (!endYear) {
        alert('종료 년도를 선택해주세요.');
        return false;
    }

    const sy = parseInt(startYear, 10);
    const ey = parseInt(endYear, 10);

    if (ey < sy) {
        alert('종료 년도는 시작 년도보다 빠를 수 없습니다.');
        return false;
    }

    if (periodType === 'YEAR') {
        // ✅ 연간: 최대 5개 연속 년도(포함) => ey - sy <= 4
        if ((ey - sy) > 4) {
            alert('연간은 최대 5개의 연속된 년도만 선택할 수 있습니다.');
            return false;
        }
        return true; // 연간이면 여기서 끝
    }

    if (periodType === 'QUARTER') {
        const startQuarter = modal.querySelector('#startQuarter')?.value ?? '';
        const endQuarter = modal.querySelector('#endQuarter')?.value ?? '';

        if (!startQuarter || !endQuarter) {
            alert('시작/종료 분기를 선택해주세요.');
            return false;
        }

        const sq = parseInt(startQuarter, 10);
        const eq = parseInt(endQuarter, 10);

        // 분기 인덱스: year*4 + (q-1)
        const startIdx = (sy * 4) + (sq - 1);
        const endIdx = (ey * 4) + (eq - 1);

        if (endIdx < startIdx) {
            alert('종료 분기는 시작 분기보다 빠를 수 없습니다.');
            return false;
        }

        // ✅ 분기: 최대 5개 연속 분기(포함) => endIdx - startIdx <= 4
        if ((endIdx - startIdx) > 4) {
            alert('분기는 최대 5개의 연속된 분기만 선택할 수 있습니다.');
            return false;
        }
    }

    return true;
}

export function renderStockPreviewTable(responseDto) {
    const payload = responseDto?.data;
    if (!payload) {
        return;
    }

    const list = payload.items ?? [];
    if (!list.length) {
        return;
    }

    const stock1 = document.getElementById('stock1-modal');

    const rawHeader = stock1?.querySelector('#tableHeaderPosition')?.value;

    const headerPos = rawHeader ? rawHeader : 'FIRST_ROW';

    let title = stock1?.querySelector('.StockTitle')?.value;
    if (!title) {
        title = `${payload.corpName ?? ''} 재무정보`;
    }

    let unit = stock1?.querySelector('.unit')?.value;
    if (!unit) {
        const amountSelect = stock1?.querySelector('#amountUnit');
        const selectedOption = amountSelect?.selectedOptions?.[0];
        unit = selectedOption?.textContent ?? '';
    }

    let cmd = stock1?.querySelector('.cmd')?.value;
    if (!cmd) {
        cmd = '사업보고서';
    }

    // period 라벨
    const quarterToMonth = {
        1: 3,
        2: 6,
        3: 9,
        4: 12
    };

    const periodKeys = list.map(p => `${p.bsnsYear}Q${p.reprtQuater}`); // lookup용
    const periodLabels = list.map(p => {
        const month = quarterToMonth[p.reprtQuater] ?? '';
        return `${p.bsnsYear}.${month}`;
    });

    // metric 추출
    const metricMap = new Map();
    for (const p of list) {
        for (const v of (p.values ?? [])) {
            const code = v.code;
            if (!metricMap.has(code)) {
                metricMap.set(code, v.displayName ?? code);
            }
        }
    }
    const metricCodes = Array.from(metricMap.keys());

    // 3) (period -> (code -> amount)) lookup
    const amountByPeriod = new Map();
    for (const p of list) {
        const pk = `${p.bsnsYear}Q${p.reprtQuater}`;
        const m = new Map();
        for (const v of (p.values ?? [])) {
            m.set(v.code, v.amount ?? null);
        }
        amountByPeriod.set(pk, m);
    }

    // 4) 2차원 rows 생성 (headerPos에 따라 축 바꿈)
    let tableRows; // [{head, cells[]}] 형태로 만들기
    const isChartMode = stock1?.querySelector('#resultChart')?.checked ?? false;
    if (isChartMode) {
        renderChartSkin({
            title,
            unit,
            cmd,
            periodKeys,
            periodLabels,
            amountByPeriod,
            chartType: stock1?.querySelector('#chartType')?.value ?? '',
            chartSeriesConfigs: collectChartSeriesConfigs(stock1)
        });
        return;
    }

    if (headerPos === 'FIRST_ROW') {
        // 첫 행이 헤더: [Period...] 가 헤더가 되고, 각 행은 metric
        // header: ['', ...periodLabels]
        tableRows = metricCodes.map(code => {
            const head = metricMap.get(code) ?? code;
            const cells = periodKeys.map(pk => amountByPeriod.get(pk)?.get(code) ?? null); // ✅ periodKeys
            return { head, cells };
        });

        renderTableSkin1({ title, unit, cmd, header: ['', ...periodLabels], rows: tableRows });
    } else {
        // 첫 열이 헤더: [Metric...] 가 헤더가 되고, 각 행은 period
        // header: ['', ...metricLabels]
        const metricLabels = metricCodes.map(code => metricMap.get(code) ?? code);

        tableRows = periodKeys.map((pk, idx) => {
            const head = periodLabels[idx]; // ✅ 화면표시용
            const cells = metricCodes.map(code => amountByPeriod.get(pk)?.get(code) ?? null); // ✅ 조회는 pk
            return { head, cells };
        });

        renderTableSkin2({ title, unit, cmd, header: ['', ...metricLabels], rows: tableRows });
    }
}

function renderChartSkin(previewModel) {
    const skin1 = document.getElementById('tableSkin1');
    const skin2 = document.getElementById('tableSkin2');
    const chartSkin = document.getElementById('infographicSkin');
    const chartContainer = document.getElementById('amcharts-container');

    if (!chartSkin || !chartContainer) return;

    if (skin1) skin1.style.display = 'none';
    if (skin2) skin2.style.display = 'none';
    chartSkin.style.display = 'block';

    chartSkin.querySelector('.amchart-title').textContent = previewModel.title || '차트';
    chartSkin.querySelector('.amchart-txt').textContent = `단위 : ${previewModel.unit} / 출처 : ${previewModel.cmd}`;

    disposeStockPreviewChart();

    if (typeof am5 === 'undefined' || typeof am5xy === 'undefined' || typeof am5themes_Animated === 'undefined') {
        chartContainer.innerHTML = '<p class="text-danger mb-0">차트 라이브러리를 불러오지 못했습니다.</p>';
        return;
    }

    const chartData = buildChartPreviewData(previewModel);
    const seriesConfigs = previewModel.chartSeriesConfigs.filter(series => series.axisType);
    const chartFontSize = 12;

    if (!chartData.length || !seriesConfigs.length) {
        chartContainer.innerHTML = '<p class="text-muted mb-0">차트로 표시할 데이터가 없습니다.</p>';
        return;
    }

    const root = am5.Root.new('amcharts-container');
    stockPreviewChartRoot = root;

    root.setThemes([am5themes_Animated.new(root)]);
    root.numberFormatter.set('numberFormat', '#,###.##');

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
        layout: root.verticalLayout
    }));

    const legend = chart.children.push(am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 12
    }));
    legend.labels.template.setAll({
        fontSize: chartFontSize
    });
    legend.valueLabels.template.setAll({
        fontSize: chartFontSize
    });

    const cursor = chart.set('cursor', am5xy.XYCursor.new(root, {}));
    cursor.lineY.set('visible', false);

    const xRenderer = am5xy.AxisRendererX.new(root, {
        minGridDistance: 30
    });
    xRenderer.labels.template.setAll({
        fontSize: chartFontSize
    });

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: 'category',
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {})
    }));
    xAxis.data.setAll(chartData);

    const leftRenderer = am5xy.AxisRendererY.new(root, {strokeOpacity: 0.1});
    leftRenderer.labels.template.setAll({
        fontSize: chartFontSize
    });
    const leftAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: leftRenderer
    }));

    const hasRightAxis = seriesConfigs.some(series => series.axisType.endsWith('_RIGHT'));
    const rightRenderer = hasRightAxis
        ? am5xy.AxisRendererY.new(root, {
            opposite: true,
            strokeOpacity: 0.1
        })
        : null;
    rightRenderer?.labels.template.setAll({
        fontSize: chartFontSize
    });
    const rightAxis = hasRightAxis
        ? chart.yAxes.push(am5xy.ValueAxis.new(root, {
            renderer: rightRenderer
        }))
        : null;

    const palette = [
        0x1f77b4, 0xff7f0e, 0x2ca02c, 0xd62728, 0x9467bd,
        0x8c564b, 0x17becf, 0xe377c2, 0xbcbd22, 0x7f7f7f,
    ];

    const seriesIndexBySourceId = new Map(
        seriesConfigs.map((series, index) => [series.sourceId, index])
    );
    const seriesOrder = [
        ...seriesConfigs.filter(series => !series.axisType.startsWith('LINE')),
        ...seriesConfigs.filter(series => series.axisType.startsWith('LINE'))
    ];
    const legendSeries = [];

    seriesOrder.forEach((seriesConfig) => {
        const originalIndex = seriesIndexBySourceId.get(seriesConfig.sourceId) ?? 0;
        const valueField = `value_${seriesConfig.sourceId}`;
        const useRightAxis = seriesConfig.axisType.endsWith('_RIGHT');
        const targetAxis = useRightAxis && rightAxis ? rightAxis : leftAxis;
        const color = palette[originalIndex % palette.length];
        const isLineSeries = seriesConfig.axisType.startsWith('LINE');

        const series = isLineSeries
            ? chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
                name: getChartSeriesDisplayName(seriesConfig),
                xAxis,
                yAxis: targetAxis,
                valueYField: valueField,
                categoryXField: 'category',
                tension: 0.5,
                stroke: am5.color(color),
                fill: am5.color(color),
                tooltip: am5.Tooltip.new(root, {
                    labelText: `{name}: {valueY.formatNumber('#,###.##')}`,
                    label: am5.Label.new(root, {
                        fontSize: chartFontSize
                    })
                })
            }))
            : chart.series.push(am5xy.ColumnSeries.new(root, {
                name: getChartSeriesDisplayName(seriesConfig),
                xAxis,
                yAxis: targetAxis,
                valueYField: valueField,
                categoryXField: 'category',
                stroke: am5.color(color),
                fill: am5.color(color),
                tooltip: am5.Tooltip.new(root, {
                    labelText: `{name}: {valueY.formatNumber('#,###.##')}`,
                    label: am5.Label.new(root, {
                        fontSize: chartFontSize
                    })
                })
            }));

        if (isLineSeries) {
            series.strokes.template.setAll({
                strokeWidth: 3
            });

            series.bullets.push(() => am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    radius: 4,
                    fill: am5.color(color),
                    stroke: root.interfaceColors.get('background'),
                    strokeWidth: 2
                })
            }));
        } else {
            series.columns.template.setAll({
                width: am5.percent(70),
                cornerRadiusTL: 4,
                cornerRadiusTR: 4
            });
        }

        series.data.setAll(chartData);
        series.appear(800);
        legendSeries.push(series);
    });

    legend.data.setAll(legendSeries.sort((a, b) => {
        const aIndex = seriesIndexBySourceId.get(a.get('valueYField')?.replace('value_', '')) ?? 0;
        const bIndex = seriesIndexBySourceId.get(b.get('valueYField')?.replace('value_', '')) ?? 0;
        return aIndex - bIndex;
    }));

    chart.appear(800, 100);
}

function buildChartPreviewData(previewModel) {
    return previewModel.periodKeys.map((periodKey, index) => {
        const row = {
            category: previewModel.periodLabels[index]
        };

        previewModel.chartSeriesConfigs.forEach(seriesConfig => {
            row[`value_${seriesConfig.sourceId}`] = normalizeChartNumericValue(
                previewModel.amountByPeriod.get(periodKey)?.get(seriesConfig.code)
            );
        });

        return row;
    });
}

function normalizeChartNumericValue(value) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;

    const normalized = Number(String(value).replace(/,/g, ''));
    return Number.isFinite(normalized) ? normalized : null;
}

function renderTableSkin1({ title, unit, cmd, header, rows }) {
    // tableSkin1 show, tableSkin2 hide
    const skin1 = document.getElementById('tableSkin1');
    const skin2 = document.getElementById('tableSkin2');
    const chart = document.getElementById('infographicSkin');
    disposeStockPreviewChart();
    if (skin1) skin1.style.display = 'block';
    if (skin2) skin2.style.display = 'none';
    if (chart) chart.style.display = 'none';

    const table = skin1?.querySelector('table');
    if (!table) return;
    const thead = table.querySelector('thead') || table.createTHead();
    const area = table.querySelector('tbody') || table.createTBody();

    skin1.querySelector('.table-title').textContent = title || '테이블';
    skin1.querySelector('.table-txt').textContent = `단위 : ${unit} / 출처 : ${cmd}`;

    // tbody 전체 재생성
    thead.innerHTML = '';
    area.innerHTML = '';

    // 1) header row
    const trHead = document.createElement('tr');
    header.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        trHead.appendChild(th);
    });

    // 우측 행삭제 칸
    const thDel = document.createElement('th');
    thDel.className = 'cell-delete';
    thDel.innerHTML = ``; // 헤더행은 삭제 불가
    trHead.appendChild(thDel);

    thead.appendChild(trHead);

    // 2) data rows (metric rows)
    rows.forEach((r, rowIdx) => {
        const tr = document.createElement('tr');

        // 첫 컬럼(헤더)
        const tdH = document.createElement('td');
        tdH.textContent = r.head;
        tr.appendChild(tdH);

        // 값들
        r.cells.forEach(val => {
            const td = document.createElement('td');
            td.textContent = formatAmount(val);
            tr.appendChild(td);
        });

        // 우측 행삭제
        const tdD = document.createElement('td');
        tdD.className = 'cell-delete';
        tdD.innerHTML = `<button type="button" class="btn btn-danger btn-delete js-row-del" data-row="${rowIdx}">행삭제</button>`;
        tr.appendChild(tdD);

        area.appendChild(tr);
    });

    // 3) 마지막 열삭제 row
    const trColDel = document.createElement('tr');
    trColDel.className = 'cell-delete';

    // ✅ 0번째(제목열)는 삭제 불가 -> 빈칸
    const tdNoDel = document.createElement('td');
    tdNoDel.innerHTML = '';
    trColDel.appendChild(tdNoDel);

    // ✅ period 컬럼(1~header.length-1)만 열삭제 버튼
    for (let i = 1; i < header.length; i++) {
        const td = document.createElement('td');
        td.innerHTML = `<button type="button" class="btn btn-danger btn-delete js-col-del" data-col="${i}">열삭제</button>`;
        trColDel.appendChild(td);
    }

    // ✅ 우측 행삭제 컬럼 자리(빈칸)
    const tdBlank = document.createElement('td');
    tdBlank.innerHTML = '';
    trColDel.appendChild(tdBlank);

    area.appendChild(trColDel);
}

function renderTableSkin2({ title, unit, cmd, header, rows }) {
    // tableSkin2 show, tableSkin1 hide
    const skin1 = document.getElementById('tableSkin1');
    const skin2 = document.getElementById('tableSkin2');
    const chart = document.getElementById('infographicSkin');
    disposeStockPreviewChart();
    if (skin1) skin1.style.display = 'none';
    if (skin2) skin2.style.display = 'block';
    if (chart) chart.style.display = 'none';

    const table = skin2?.querySelector('table');
    if (!table) return;
    const thead = table.querySelector('thead') || table.createTHead();
    const area = table.querySelector('tbody') || table.createTBody();

    skin2.querySelector('.table-title').textContent = title || '테이블';
    skin2.querySelector('.table-txt').textContent = `단위 : ${unit} / 출처 : ${cmd}`;

    thead.innerHTML = '';
    area.innerHTML = '';

    // ✅ 0) header row (맨 위)
    const trHead = document.createElement('tr');
    header.forEach((h) => {
        const th = document.createElement('th');
        th.textContent = h;
        trHead.appendChild(th);
    });

    // 우측 행삭제 칸 자리(헤더에는 버튼 안 넣고 빈칸)
    const thHeadBlank = document.createElement('th');
    thHeadBlank.className = 'cell-delete';
    thHeadBlank.innerHTML = '';
    trHead.appendChild(thHeadBlank);

    thead.appendChild(trHead);

    // 각 행: 첫칸(Period), 나머지 metric 값
    rows.forEach((r, rowIdx) => {
        const tr = document.createElement('tr');

        const tdHead = document.createElement('td');
        tdHead.textContent = r.head;
        tr.appendChild(tdHead);

        r.cells.forEach(val => {
            const td = document.createElement('td');
            td.textContent = formatAmount(val);
            tr.appendChild(td);
        });

        const tdDel = document.createElement('td');
        tdDel.className = 'cell-delete';
        tdDel.innerHTML = `<button type="button" class="btn btn-danger btn-delete js-row-del" data-row="${rowIdx}">행삭제</button>`;
        tr.appendChild(tdDel);

        area.appendChild(tr);
    });

    // 마지막 열삭제 row
    const trColDel = document.createElement('tr');
    trColDel.className = 'cell-delete';

    // ✅ 0번째(기간 컬럼)는 삭제 불가 -> 빈칸
    const tdNoDel = document.createElement('td');
    tdNoDel.innerHTML = '';
    trColDel.appendChild(tdNoDel);

    // ✅ 나머지 metric 컬럼만 버튼
    const totalMetricCols = rows[0]?.cells?.length ?? 0;
    for (let i = 1; i <= totalMetricCols; i++) {
        const td = document.createElement('td');
        td.innerHTML = `<button type="button" class="btn btn-danger btn-delete js-col-del" data-col="${i}">열삭제</button>`;
        trColDel.appendChild(td);
    }

    // 우측 행삭제 칸 자리
    const tdBlank = document.createElement('td');
    tdBlank.innerHTML = '';
    trColDel.appendChild(tdBlank);

    area.appendChild(trColDel);
}

function formatAmount(v) {
    if (v === null || v === undefined) return '-';
    // 숫자면 콤마
    if (typeof v === 'number') return v.toLocaleString();
    return String(v);
}

export function bindStockTableDeleteEvents() {
    const modal2 = document.getElementById('stock2-modal');
    if (!modal2) return;

    if (modal2.dataset.boundDelete === '1') return;
    modal2.dataset.boundDelete = '1';

    modal2.addEventListener('click', (e) => {
        const rowBtn = e.target.closest('.js-row-del');
        const colBtn = e.target.closest('.js-col-del');

        if (rowBtn) {
            const rowIdx = parseInt(rowBtn.dataset.row, 10);
            if (Number.isNaN(rowIdx)) return;

            const skin = getActiveSkin(modal2); // 1 or 2
            deleteTableRow(modal2, skin, rowIdx);
            return;
        }

        if (colBtn) {
            const colIdx = parseInt(colBtn.dataset.col, 10);
            if (Number.isNaN(colIdx)) return;

            const skin = getActiveSkin(modal2);
            deleteTableCol(modal2, skin, colIdx);
        }
    });
}

function getActiveSkin(modal2) {
    const skin1 = modal2.querySelector('#tableSkin1');
    const skin2 = modal2.querySelector('#tableSkin2');
    if (skin1 && skin1.style.display !== 'none') return 1;
    if (skin2 && skin2.style.display !== 'none') return 2;
    return 1;
}

function deleteTableRow(modal2, skin, rowIdx) {
    const tbody = modal2.querySelector(`#tableSkin${skin} table tbody`);
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (rows.length < 3) return; // header + 최소1데이터 + delrow

    const headerRowIndex = 0;
    const deleteRowIndex = rows.length - 1;

    // 데이터 시작 인덱스는 1
    const targetIndex = 1 + rowIdx;
    if (targetIndex <= headerRowIndex || targetIndex >= deleteRowIndex) return;

    rows[targetIndex].remove();

    // data-row 재부여
    reindexRowButtons(tbody);
}

function reindexRowButtons(tbody) {
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const deleteRowIndex = rows.length - 1;

    let idx = 0;
    for (let i = 1; i < deleteRowIndex; i++) {
        const btn = rows[i].querySelector('.js-row-del');
        if (btn) btn.dataset.row = String(idx++);
    }
}

function deleteTableCol(modal2, skin, colIdx) {
    const tbody = modal2.querySelector(`#tableSkin${skin} table tbody`);
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (!rows.length) return;

    // 마지막 컬럼은 행삭제 컬럼이라 삭제 금지
    // colIdx는 tbody 기준 td 인덱스 (0부터)
    rows.forEach(tr => {
        const tds = Array.from(tr.children);
        const lastCol = tds.length - 1;
        if (colIdx <= 0) return;          // 첫열 금지
        if (colIdx >= lastCol) return;    // 마지막(행삭제) 금지
        tds[colIdx].remove();
    });

    // 열삭제 버튼 재인덱싱
    reindexColButtons(tbody);
}

function reindexColButtons(tbody) {
    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (rows.length < 2) return;

    const deleteRow = rows[rows.length - 1];
    const btns = Array.from(deleteRow.querySelectorAll('.js-col-del'));

    // 버튼들이 붙어있는 td들의 실제 col 인덱스를 다시 계산
    btns.forEach(btn => {
        const td = btn.closest('td');
        const colIdx = Array.from(td.parentElement.children).indexOf(td);
        btn.dataset.col = String(colIdx);
    });
}

function getVisibleStockPreviewSkin(modal) {
    if (!modal) return null;

    return modal.querySelector(
        "#tableSkin1:not([style*='display: none']), " +
        "#tableSkin2:not([style*='display: none']), " +
        "#infographicSkin:not([style*='display: none'])"
    );
}

function resolveStockPreviewMeta() {
    const stock1 = document.getElementById('stock1-modal');
    const payload = stockPreviewResponseDto?.data ?? {};

    let title = stock1?.querySelector('.StockTitle')?.value?.trim() ?? '';
    if (!title) {
        title = `${payload.corpName ?? stockPreviewRequestDto?.corpName ?? ''} 재무정보`.trim();
    }

    let unit = stock1?.querySelector('.unit')?.value?.trim() ?? '';
    if (!unit) {
        const amountSelect = stock1?.querySelector('#amountUnit');
        unit = amountSelect?.selectedOptions?.[0]?.textContent?.trim() ?? '';
    }

    let sourceText = stock1?.querySelector('.cmd')?.value?.trim() ?? '';
    if (!sourceText) {
        sourceText = '사업보고서';
    }

    return { title, unit, sourceText };
}

function findFinancialValueByCode(periodItem, code) {
    return (periodItem?.values ?? []).find(value => value.code === code) ?? null;
}

function buildChartPersistencePayload() {
    const previewPayload = stockPreviewResponseDto?.data;
    const stock1 = document.getElementById('stock1-modal');
    if (!previewPayload || !stock1) return null;

    const { title, unit, sourceText } = resolveStockPreviewMeta();
    const chartType = stock1.querySelector('#chartType')?.value ?? '';
    const chartSeriesConfigs = collectChartSeriesConfigs(stock1).filter(series => series.axisType);
    const items = previewPayload.items ?? [];
    const quarterToMonth = { 1: 3, 2: 6, 3: 9, 4: 12 };

    const categories = items.map(periodItem => ({
        periodKey: `${periodItem.bsnsYear}Q${periodItem.reprtQuater}`,
        label: `${periodItem.bsnsYear}.${quarterToMonth[periodItem.reprtQuater] ?? ''}`,
        bsnsYear: periodItem.bsnsYear,
        reprtQuater: periodItem.reprtQuater,
        fsDiv: periodItem.fsDiv
    }));

    const series = chartSeriesConfigs.map(seriesConfig => ({
        sourceId: seriesConfig.sourceId,
        category: seriesConfig.category,
        type: seriesConfig.type,
        code: seriesConfig.code,
        displayName: getChartSeriesDisplayName(seriesConfig),
        statementLabel: seriesConfig.statementLabel || '',
        accountLabel: seriesConfig.accountLabel || '',
        axisType: seriesConfig.axisType,
        data: items.map(periodItem => normalizeChartNumericValue(findFinancialValueByCode(periodItem, seriesConfig.code)?.amount))
    }));

    return {
        version: 1,
        outputType: 'CHART',
        chartType,
        title,
        unit,
        sourceText,
        corpCode: previewPayload.corpCode ?? stockPreviewRequestDto?.corpCode ?? '',
        corpName: previewPayload.corpName ?? stockPreviewRequestDto?.corpName ?? '',
        request: stockPreviewRequestDto,
        categories,
        series,
        previewData: items
    };
}

async function saveFinancialChartPayload(payload) {
    const chartOnlyPayload = {
        chartType: payload.chartType,
        title: payload.title,
        unit: payload.unit,
        sourceText: payload.sourceText,
        categories: payload.categories,
        series: payload.series
    };
    const res = await postWithCsrf('/api/editor/financial/chart-data', { payload: chartOnlyPayload });
    const json = await res.json();

    if (!res.ok || json?.success === false) {
        throw new Error(json?.message || '차트 데이터 저장에 실패했습니다.');
    }

    const chartId = json?.data?.chartId ?? json?.data?.id ?? null;
    if (!chartId) {
        throw new Error('차트 ID를 받지 못했습니다.');
    }

    return chartId;
}

function extractPhotoPayloadFromResponse(json) {
    const data = Array.isArray(json?.data) ? json.data[0] : json?.data;

    return {
        id: data?.id ?? json?.id ?? null,
        key: data?.hashkey ?? json?.hashkey ?? '',
        title: data?.title ?? json?.title ?? '',
        mediumUrl: data?.mediumUrl ?? data?.thumbUrl ?? data?.originalUrl ?? '',
        insertUrl: data?.originalUrl ?? data?.thumbUrl ?? ''
    };
}

async function loadImageElement(src) {
    return await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('차트 이미지를 불러오지 못했습니다.'));
        image.src = src;
    });
}

async function blobFromCanvas(canvas) {
    return await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
                return;
            }
            reject(new Error('차트 이미지를 생성하지 못했습니다.'));
        }, 'image/png');
    });
}

async function composeChartPreviewBlob(chartDataUrl, chartPayload) {
    const chartImage = await loadImageElement(chartDataUrl);

    // .amchart-title: padding 11px 0 12px, font 14px/500, center, #fff, bg rgb(80,85,103)
    const titlePaddingTop = 11;
    const titlePaddingBottom = 12;
    const titleFontSize = 14;
    const titleBarHeight = titlePaddingTop + titleFontSize + titlePaddingBottom;

    // .amchart-txt: padding 12px 0 12px, font 12px/400, right, #aaa
    const txtFontSize = 12;
    const txtPaddingTop = 12;
    const txtPaddingBottom = 12;
    const txtHeight = txtPaddingTop + txtFontSize + txtPaddingBottom;

    const canvas = document.createElement('canvas');
    canvas.width = chartImage.naturalWidth;
    canvas.height = titleBarHeight + txtHeight + chartImage.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('차트 캔버스를 초기화하지 못했습니다.');
    }

    // 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // .amchart-title
    ctx.fillStyle = 'rgb(80, 85, 103)';
    ctx.fillRect(0, 0, canvas.width, titleBarHeight);
    ctx.fillStyle = '#ffffff';
    ctx.font = `500 ${titleFontSize}px "Malgun Gothic", sans-serif`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillText(chartPayload.title || '차트', canvas.width / 2, titlePaddingTop);

    // .amchart-txt
    const txtY = titleBarHeight + txtPaddingTop;
    ctx.fillStyle = '#aaaaaa';
    ctx.font = `400 ${txtFontSize}px "Malgun Gothic", sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`단위 : ${chartPayload.unit || '-'} / 출처 : ${chartPayload.sourceText || '-'}`, canvas.width, txtY);

    // 차트 이미지
    ctx.drawImage(chartImage, 0, titleBarHeight + txtHeight);

    return await blobFromCanvas(canvas);
}

async function exportChartPreviewBlob(chartPayload) {
    if (!stockPreviewChartRoot) {
        throw new Error('차트 미리보기를 먼저 생성해주세요.');
    }

    if (typeof am5plugins_exporting === 'undefined' || typeof am5 === 'undefined') {
        throw new Error('차트 내보내기 라이브러리를 찾지 못했습니다.');
    }

    const exporting = am5plugins_exporting.Exporting.new(stockPreviewChartRoot, {
        filePrefix: `article-chart-${chartPayload.chartType?.toLowerCase?.() || 'chart'}`,
        backgroundColor: am5.color(0xffffff),
        backgroundOpacity: 1
    });

    try {
        const chartDataUrl = await exporting.export('png');
        return await composeChartPreviewBlob(chartDataUrl, chartPayload);
    } finally {
        exporting.dispose?.();
    }
}

async function uploadChartPreviewImage(blob, chartId) {
    const formData = new FormData();
    const file = new File([blob], `article-chart-${chartId}.png`, { type: 'image/png' });

    formData.append('upload', file);
    formData.append('hashkey', `article-chart-${chartId}`);

    const res = await postFileWithCsrf('/api/photo/upload', formData);
    const json = await res.json();

    if (!res.ok || json?.success === false) {
        throw new Error(json?.message || '차트 이미지 업로드에 실패했습니다.');
    }

    const photo = extractPhotoPayloadFromResponse(json);
    if (!photo?.id || !photo?.insertUrl) {
        throw new Error('업로드된 이미지 정보가 올바르지 않습니다.');
    }

    return photo;
}

function escapeAttribute(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function insertChartImageIntoEditor(photo, chartId, chartPayload) {
    const editor = window.mainEditor;
    const insertUrl = photo.insertUrl;
    const mediumUrl = photo.mediumUrl || photo.insertUrl;

    if (editor?.model?.insertViaCommand) {
        await editor.model.insertViaCommand({
            murl: mediumUrl,
            turl: insertUrl,
            dataId: String(photo.id),
            dataKey: photo.key || '',
            alt: chartPayload.title || '차트',
            extraAttributes: {
                'data-chart-id': String(chartId)
            }
        });
        editor.editing.view.focus();
        return;
    }

    const finalHtml = `<p>&nbsp;</p><figure class="image"><img src="${escapeAttribute(insertUrl)}" alt="${escapeAttribute(chartPayload.title || '차트')}" data-id="${escapeAttribute(photo.id)}" data-key="${escapeAttribute(photo.key || '')}" data-chart-id="${escapeAttribute(chartId)}"></figure><p>&nbsp;</p>`;
    const viewFragment = editor.data.processor.toView(finalHtml);
    const modelFragment = editor.data.toModel(viewFragment);

    editor.model.change(() => {
        editor.model.insertContent(modelFragment, editor.model.document.selection);
    });

    editor.editing.view.focus();
}

async function applyChartPreviewToEditor(modal) {
    const chartPayload = buildChartPersistencePayload();
    if (!chartPayload) {
        throw new Error('차트 미리보기 데이터를 찾을 수 없습니다.');
    }

    const chartId = await saveFinancialChartPayload(chartPayload);
    const imageBlob = await exportChartPreviewBlob(chartPayload);
    const photo = await uploadChartPreviewImage(imageBlob, chartId);
    await insertChartImageIntoEditor(photo, chartId, chartPayload);

    bootstrap.Modal.getInstance(modal)?.hide();
}

function bindStockApplyToEditor() {
    const modal = document.getElementById("stock2-modal");
    if (!modal) return;

    const applyBtn = modal.querySelector("#btn-db-upload-html");
    if (!applyBtn) return;

    if (applyBtn.dataset.bound === "1") return;
    applyBtn.dataset.bound = "1";
    applyBtn.dataset.defaultText = applyBtn.textContent;

    applyBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const originalText = applyBtn.dataset.defaultText || applyBtn.textContent;
        applyBtn.disabled = true;

        if (!window.mainEditor || window.mainEditor.isDestroyed) {
            applyBtn.disabled = false;
            applyBtn.textContent = originalText;
            alert("에디터가 준비되지 않았습니다.");
            return;
        }

        try {
            // ✅ 현재 display none이 아닌 스킨만 선택
            const visibleSkin = getVisibleStockPreviewSkin(modal);

            if (!visibleSkin) {
                applyBtn.disabled = false;
                applyBtn.textContent = originalText;
                alert("삽입할 미리보기를 찾지 못했습니다.");
                return;
            }

            if (visibleSkin.id === 'infographicSkin') {
                applyBtn.textContent = '적용 중...';
                await applyChartPreviewToEditor(modal);
                applyBtn.disabled = false;
                applyBtn.textContent = originalText;
                return;
            }

            const tableAreaHtml = visibleSkin.querySelector(".table-area");

            if (!tableAreaHtml) {
                applyBtn.disabled = false;
                applyBtn.textContent = originalText;
                alert("삽입할 내용이 없습니다.");
                return;
            }

            // ✅ 복제 (원본 보호)
            const clone = tableAreaHtml.cloneNode(true);

            // ✅ 삭제 버튼/삭제행 제거
            clone.querySelectorAll('.cell-delete').forEach(el => el.remove());
            clone.querySelectorAll('.btn-delete').forEach(el => el.remove());

            const cleanedHtml = clone.innerHTML?.trim() ?? "";
            if (!cleanedHtml) {
                applyBtn.disabled = false;
                applyBtn.textContent = originalText;
                alert("삽입할 내용이 없습니다.");
                return;
            }

            const finalHtml = `<p>&nbsp;</p>${cleanedHtml}<p>&nbsp;</p>`;
            const insertedAsPluginTable = insertHtmlTableAsPluginTable(window.mainEditor, finalHtml);

            if (!insertedAsPluginTable) {
                const viewFragment = window.mainEditor.data.processor.toView(finalHtml);
                const modelFragment = window.mainEditor.data.toModel(viewFragment);

                window.mainEditor.model.change(() => {
                    window.mainEditor.model.insertContent(
                        modelFragment,
                        window.mainEditor.model.document.selection
                    );
                });
            }

            window.mainEditor.editing.view.focus();

            bootstrap.Modal.getInstance(modal)?.hide();
            applyBtn.disabled = false;
            applyBtn.textContent = originalText;

        } catch (err) {
            console.error(err);
            applyBtn.disabled = false;
            applyBtn.textContent = originalText;
            alert("에디터 삽입 중 오류가 발생했습니다.");
        }
    });
}

export function resetStock1Modal() {
    const modal = document.getElementById('stock1-modal');
    if (!modal) return;

    stockPreviewRequestDto = null;
    stockPreviewResponseDto = null;

    // ✅ 0. 탭 초기화 (DB 탭으로)
    const tabDb = modal.querySelector('a[data-bs-toggle="tab"][href="#db-bt"]');
    if (tabDb) {
        const inst = bootstrap.Tab.getOrCreateInstance(tabDb);
        inst.show();
    }

    // ✅ 0-1. 버튼 상태도 DB 기준으로
    const previewBtn = modal.querySelector('#btn-stock-preview');
    const applyBtn = modal.querySelector('#btn-setting-upload-html');
    previewBtn?.classList.remove('d-none');
    applyBtn?.classList.add('d-none');

    // ✅ 0-2. 모달 에디터 초기화(내용 비우기)
    const modalEditor = window.modalTableEditor;
    if (modalEditor) {
        try {
            modalEditor.setData('');
        } catch (e) {
            // ignore
        }
    }

    // ✅ 1. 텍스트 입력 초기화 (탭 2개 모두)
    modal.querySelectorAll('.StockTitle').forEach(el => el.value = '');
    modal.querySelectorAll('.unit').forEach(el => el.value = '');
    modal.querySelectorAll('.cmd').forEach(el => el.value = '');

    // 2. 셀렉트 초기화 (fsType, amountUnit, periodType은 HTML default 유지)
    const selects = [
        '#startYear',
        '#startQuarter',
        '#endYear',
        '#endQuarter',
        '#tableHeaderPosition',
        '#chartType'
    ];

    selects.forEach(selector => {
        const el = modal.querySelector(selector);
        if (el) el.selectedIndex = 0;
    });

    // 3. 분기 비활성화
    const startQuarter = modal.querySelector('#startQuarter');
    const endQuarter = modal.querySelector('#endQuarter');
    if (startQuarter) startQuarter.disabled = true;
    if (endQuarter) endQuarter.disabled = true;

    // 4. 체크박스 해제
    const checkData = modal.querySelector('#checkData');
    const checkRatio = modal.querySelector('#checkRatio');
    if (checkData) checkData.checked = false;
    if (checkRatio) checkRatio.checked = false;

    // 5. 결과 형태 기본값
    const resultTable = modal.querySelector('#resultTable');
    const resultChart = modal.querySelector('#resultChart');
    if (resultTable) resultTable.checked = true;
    if (resultChart) resultChart.checked = false;

    // 6. selector-box 초기화 (첫 박스만 남기기)
    resetSelectorBoxes(modal, 'DATA');
    resetSelectorBoxes(modal, 'RATIO');
    clearChartSeriesOptions(modal);
    syncChartSeriesOptions(modal);
}

function clearChartSeriesOptions(modal) {
    const list = modal?.querySelector('.hide-box .chart-series-list');
    if (list) {
        list.innerHTML = '';
    }
}

function resetSelectorBoxes(modal, category) {
    const boxes = modal.querySelectorAll(
        `.fsStatement[data-category="${category}"]`
    );

    if (!boxes.length) return;

    const firstBox = boxes[0].closest('.selector-box');
    const container = firstBox.parentElement;

    // 첫 번째 제외하고 전부 제거
    container.querySelectorAll('.selector-box').forEach((box, idx) => {
        if (idx !== 0) box.remove();
    });

    // 첫 번째 박스 리셋
    const statement = firstBox.querySelector('.fsStatement');
    const account = firstBox.querySelector('.fsAccount');
    const btn = firstBox.querySelector('.str-btn');

    if (statement) statement.selectedIndex = 0;

    if (account) {
        account.innerHTML = '<option selected="">계정과목 선택</option>';
    }

    if (btn) {
        btn.classList.remove('btn-danger', 'stock-data-minus-btn');
        btn.classList.add('btn-primary', 'stock-data-add-btn');
        btn.textContent = '+';
    }

    assignSelectorBoxSourceId(firstBox);
}

// 탭 활성화 시 버튼 제어
function bindStockTabActivation() {
    const modal = document.getElementById('stock1-modal');
    if (!modal) return;

    const directTabBtn = modal.querySelector('a[data-bs-toggle="tab"][href="#seting-bt"]');
    const dbTabBtn = modal.querySelector('a[data-bs-toggle="tab"][href="#db-bt"]');
    if (!directTabBtn || !dbTabBtn) return;

    if (modal.dataset.boundStockTab === '1') return;
    modal.dataset.boundStockTab = '1';

    const previewBtn = modal.querySelector('#btn-stock-preview');
    const applyBtn = modal.querySelector('#btn-setting-upload-html');

    // ✅ 직접입력 탭 활성화
    directTabBtn.addEventListener('shown.bs.tab', async () => {
        try {
            previewBtn?.classList.add("d-none");
            applyBtn?.classList.remove("d-none");

        } catch (error) {
            console.error('[Modal CKEditor] init error:', error);
        }
    });

    // ✅ DB 탭 활성화
    dbTabBtn.addEventListener('shown.bs.tab', () => {
        previewBtn?.classList.remove("d-none");
        applyBtn?.classList.add("d-none");
    });
}

function bindSettingApplyToEditor() {
    const modal = document.getElementById('stock1-modal');
    if (!modal) return;

    const applyBtn = modal.querySelector('#btn-setting-upload-html');
    if (!applyBtn) return;

    if (applyBtn.dataset.bound === '1') return;
    applyBtn.dataset.bound = '1';

    applyBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (!window.mainEditor || window.mainEditor.isDestroyed) {
            alert("에디터가 준비되지 않았습니다.");
            return;
        }

        // ✅ 현재 활성 탭(직접입력) 안의 제목/단위/출처만 읽기(중복 input 문제 방지)
        const activePane = modal.querySelector('.tab-pane.active.show');
        if (!activePane || activePane.id !== 'seting-bt') return;

        const titleInput = activePane.querySelector('.StockTitle');
        const unitInput = activePane.querySelector('.unit');
        const cmdInput = activePane.querySelector('.cmd');

        const title = (titleInput?.value ?? '').trim();
        if (!title) {
            alert("제목을 입력하세요.");
            return;
        }

        const unit = (unitInput?.value ?? '').trim();
        if (!unit) {
            alert("단위를 입력하세요.");
            return;
        }

        const cmd  = (cmdInput?.value ?? '').trim();
        if (!cmd) {
            alert("출처를 입력하세요.");
            return;
        }

        try {
            const modalEditor = window.modalTableEditor;
            if (!modalEditor || modalEditor.isDestroyed) {
                alert('직접입력 에디터가 준비되지 않았습니다.');
                return;
            }

            const rawHtml = (modalEditor.getData() ?? '').trim();
            if (!rawHtml) {
                alert('표 내용을 입력해주세요.');
                return;
            }

            // ✅ 테이블 클래스 보정(스타일 "재무정보 표"에 맞추기)
            const tmp = document.createElement('div');
            tmp.innerHTML = rawHtml;

            // CKEditor 테이블(figure.table > table) / 일반 table 모두 대응
            const table = tmp.querySelector('table');
            if (!table) {
                alert('테이블을 입력해주세요.');
                return;
            }
            table.classList.add('table');

            const safeTitle = escapeHtml(title);
            const safeUnit  = escapeHtml(unit);
            const safeCmd   = escapeHtml(cmd);

            const finalHtml = `
                    <p>&nbsp;</p>
                    <p class="table-title">${safeTitle}</p>
                    <p class="table-txt">단위 : ${safeUnit} / 출처 : ${safeCmd}</p>
                    ${tmp.innerHTML}
                    <p>&nbsp;</p>
                `.trim();

            const viewFragment = window.mainEditor.data.processor.toView(finalHtml);
            const modelFragment = window.mainEditor.data.toModel(viewFragment);

            window.mainEditor.model.change(() => {
                window.mainEditor.model.insertContent(
                    modelFragment,
                    window.mainEditor.model.document.selection
                );
            });

            window.mainEditor.editing.view.focus();

            // ✅ 모달 닫기 전에 직접입력 에디터 내용 초기화
            if (modalEditor && !modalEditor.isDestroyed) {
                modalEditor.setData('');
            }

            bootstrap.Modal.getInstance(modal)?.hide();

        } catch (err) {
            console.error(err);
            alert('적용 중 오류가 발생했습니다.');
        }
    });
}
