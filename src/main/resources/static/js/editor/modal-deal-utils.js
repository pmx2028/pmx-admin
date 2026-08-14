// #modal-deal-utils.js
// modal-deal 모달에서 사용

import { insertHtmlTableAsPluginTable } from "./ckeditor5_article.js";

export function initModalDealUtils() {
    const modal = document.getElementById("deal-modal");
    if (modal) {
        modal.addEventListener("show.bs.modal", resetDealModal);
    }

    bindDealTypeChange();
    bindDataTypeBoxAddRemoveEvents();
    bindDealDateFlatpickr();
    bindPreviewButtonActivation();
    bindDealPreviewRequest();
    bindDealApplyToEditor();
    bindDealResetButton();
}

// base_common_item 테이블 데이터 사용
const DEAL_TYPE_SECONDARY_MAP = {
    bond: [
        { value: "ALL", label: "전체" },
        { value: "8", label: "SB" },
        { value: "9", label: "FB" },
        { value: "10", label: "은행채" },
        { value: "11", label: "ABS" },
        { value: "12", label: "CoCo" }
    ],
    ipo: [
        { value: "ALL", label: "전체" },
        { value: "17", label: "IPO" },
        { value: "18", label: "이전상장" },
    ],
    ci: [
        { value: "ALL", label: "전체" },
        { value: "14", label: "유상증자" },
        { value: "15", label: "RCPS" },
        { value: "16", label: "주식매수선택권" },
    ],
    mez: [
        { value: "ALL", label: "전체" },
        { value: "20", label: "CB" },
        { value: "21", label: "BW" },
        { value: "22", label: "EB" },
        { value: "296", label: "PB" },
    ],

    // 다른것과 성격이 달라 mna 제외 (2026/02/23)
    // mna: [
    //     { value: "ALL", label: "전체" },
    //     { value: "212", label: "합병" },
    //     { value: "213", label: "분할" },
    //     { value: "214", label: "경영권 이전" },
    //     { value: "215", label: "사업·영업 양수도" },
    //     { value: "216", label: "지분 인수도" },
    //     { value: "217", label: "블록딜" },
    //     { value: "218", label: "부동산 매매" },
    // ]
};

function bindDealResetButton() {
    const modal = document.getElementById("deal-modal");
    if (!modal) return;

    const resetBtn = modal.querySelector("#btn-deal-reset");
    if (!resetBtn) return;

    if (resetBtn.dataset.bound === "1") return;
    resetBtn.dataset.bound = "1";

    resetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        resetDealModal();
    });
}

function bindDealTypeChange() {
    document.querySelectorAll('.selector-box').forEach(box => {
        const primary = box.querySelector('.deal-type-primary');
        const secondary = box.querySelector('.deal-type-secondary');

        if (!primary || !secondary) return;
        if (primary.dataset.bound === "1") return;
        primary.dataset.bound = "1";

        primary.addEventListener("change", function () {
            loadSecondaryOptions(this.value, secondary);
            updateDealDateTypeState();
        });
    });
}

function updateDealDateTypeState() {
    const modal = document.getElementById("deal-modal");
    if (!modal) return;

    const dealDateTypeSelect = modal.querySelector("#dealDateType");
    if (!dealDateTypeSelect) return;

    const allBoxes = modal.querySelectorAll(".selector-box");

    const hasIpoOrCi = Array.from(allBoxes).some(box => {
        const primary = box.querySelector(".deal-type-primary")?.value;
        return primary === "ALL" || primary === "ipo" || primary === "ci";
    });

    if (hasIpoOrCi) {
        dealDateTypeSelect.value = "ISS_DT";
        dealDateTypeSelect.disabled = true;
    } else {
        dealDateTypeSelect.disabled = false;
    }
}

function loadSecondaryOptions(primaryValue, secondarySelect) {
    secondarySelect.innerHTML = "";
    secondarySelect.disabled = false;

    // 기본 옵션
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Deal 종류 2";
    defaultOption.selected = true;
    secondarySelect.appendChild(defaultOption);

    if (primaryValue === "ALL") {
        secondarySelect.disabled = true;
        return;
    }

    if (!primaryValue || !DEAL_TYPE_SECONDARY_MAP[primaryValue]) return;

    DEAL_TYPE_SECONDARY_MAP[primaryValue].forEach(opt => {
        const optionEl = document.createElement("option");
        optionEl.value = opt.value;
        optionEl.textContent = opt.label;
        secondarySelect.appendChild(optionEl);
    });
}

export function bindDataTypeBoxAddRemoveEvents() {
    document.addEventListener('click', function (event) {

        // "+" 버튼 클릭
        if (event.target.classList.contains('deal-data-add-btn')
            && event.target.textContent === '+') {

            const originalBox = event.target.closest('.selector-box');
            if (!originalBox) return;

            const copiedBox = originalBox.cloneNode(true);
            copiedBox.querySelector('.deal-type-primary')?.removeAttribute('data-bound');

            // 버튼 상태 변경
            const addButton = copiedBox.querySelector('.str-btn');
            addButton.classList.remove('btn-primary');
            addButton.classList.add('btn-danger', 'deal-data-minus-btn');
            addButton.textContent = '-';

            const container = originalBox.parentElement;
            const boxes = container.querySelectorAll('.selector-box');
            const last = boxes[boxes.length - 1];
            last.insertAdjacentElement('afterend', copiedBox);

            bindDealTypeChange();
        }

        // "-" 버튼 클릭 시 삭제
        if (event.target.classList.contains('deal-data-minus-btn')
            && event.target.textContent === '-') {

            const targetBox = event.target.closest('.selector-box');
            targetBox.remove();

            updateDealDateTypeState();
        }
    });
}

// ✅ flatpickr 연동
function bindDealDateFlatpickr() {
    const modal = document.getElementById("deal-modal");
    if (!modal || typeof flatpickr === "undefined") return;

    const startInput = modal.querySelector('input[name="startDate"]');
    const endInput = modal.querySelector('input[name="endDate"]');
    const presetSelect = modal.querySelector("#dealDateRangePreset");
    if (!startInput || !endInput) return;

    // 중복 init 방지 (모달 reopen 대응)
    getFlatpickrInstance(startInput)?.destroy();
    getFlatpickrInstance(endInput)?.destroy();

    const startFp = flatpickr(startInput, {
        dateFormat: "Y-m-d",
        altInput: true, // 사용자가 읽을 수 있는 다른 형식의 입력 생성
        altFormat: "Y-m-d",
        locale: "ko", // 한국어 로케일 설정
        disableMobile: true,
        allowInput: false, // 직접 입력 방지 (달력 선택만 허용)
        onChange: (selectedDates) => {
            if (!selectedDates?.length) return;
            endFp.set("minDate", selectedDates[0]);
            syncDealDateRangePreset(modal);
        }
    });

    const endFp = flatpickr(endInput, {
        dateFormat: "Y-m-d",
        altInput: true, // 사용자가 읽을 수 있는 다른 형식의 입력 생성
        altFormat: "Y-m-d",
        locale: "ko", // 한국어 로케일 설정
        disableMobile: true,
        allowInput: false, // 직접 입력 방지 (달력 선택만 허용)
        onChange: (selectedDates) => {
            if (!selectedDates?.length) return;
            startFp.set("maxDate", selectedDates[0]);
            syncDealDateRangePreset(modal);
        }
    });

    // 프리셋 선택 시 기간 자동 세팅
    if (presetSelect) {
        presetSelect.addEventListener("change", () => {
            const key = presetSelect.value;
            if (!key) return;

            applyDealDateRange(modal, key);

            // 다음 선택을 위해 초기화(선택사항)
            // presetSelect.value = "";
        });
    }

    // 모달 닫힐 때 프리셋 초기화(선택사항)
    modal.addEventListener("hidden.bs.modal", () => {
        applyDealDateRange(modal, "LAST_6_MONTHS");
    });

    // 기본값: 최근 6개월
    applyDealDateRange(modal, "LAST_6_MONTHS");
}

function applyDealDateRange(modal, presetKey) {
    if (!modal) return;

    const startInput = modal.querySelector('input[name="startDate"]');
    const endInput = modal.querySelector('input[name="endDate"]');
    const presetSelect = modal.querySelector("#dealDateRangePreset");
    const range = resolvePresetRange(presetKey);

    if (presetSelect) {
        presetSelect.value = range ? presetKey : "";
    }

    if (!range || !startInput || !endInput) return;

    const startValue = formatDealDateYmd(range.start);
    const endValue = formatDealDateYmd(range.end);

    startInput.value = startValue;
    endInput.value = endValue;

    const startPicker = getFlatpickrInstance(startInput);
    const endPicker = getFlatpickrInstance(endInput);

    if (startPicker?.altInput) {
        startPicker.altInput.value = startValue;
    }
    if (endPicker?.altInput) {
        endPicker.altInput.value = endValue;
    }

    if (!startPicker || !endPicker) return;

    modal.dataset.applyingDateRange = "1";
    startPicker.set("maxDate", null);
    endPicker.set("minDate", null);
    startPicker.setDate(range.start, true);
    endPicker.setDate(range.end, true);
    delete modal.dataset.applyingDateRange;
}

function getFlatpickrInstance(input) {
    if (!input) return null;
    return input._flatpickr ?? input._fp ?? null;
}

function syncDealDateRangePreset(modal) {
    if (!modal || modal.dataset.applyingDateRange === "1") return;

    const startInput = modal.querySelector('input[name="startDate"]');
    const endInput = modal.querySelector('input[name="endDate"]');
    const presetSelect = modal.querySelector("#dealDateRangePreset");
    if (!startInput || !endInput || !presetSelect) return;

    const startValue = startInput.value?.trim();
    const endValue = endInput.value?.trim();
    if (!startValue || !endValue) return;

    const presetKeys = [
        "LAST_1_MONTH",
        "THIS_QUARTER",
        "PREVIOUS_QUARTER",
        "LAST_3_MONTHS",
        "LAST_6_MONTHS",
        "LAST_1_YEAR",
        "PREVIOUS_1_YEAR"
    ];

    const matchedPreset = presetKeys.find((key) => {
        const range = resolvePresetRange(key);
        if (!range) return false;

        return startValue === formatDealDateYmd(range.start)
            && endValue === formatDealDateYmd(range.end);
    });

    presetSelect.value = matchedPreset ?? "";
}

function formatDealDateYmd(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function resolvePresetRange(key) {
    const today = new Date();

    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const addMonths = (d, m) => new Date(d.getFullYear(), d.getMonth() + m, d.getDate());
    const addDays = (d, days) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

    const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
    const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

    const quarterInfo = (d) => {
        const q = Math.floor(d.getMonth() / 3); // 0~3
        const startMonth = q * 3;
        return {
            start: new Date(d.getFullYear(), startMonth, 1),
            end: new Date(d.getFullYear(), startMonth + 3, 0)
        };
    };

    const t = startOfDay(today);

    switch (key) {
        case "LAST_1_MONTH": {
            const end = t;
            const start = addMonths(t, -1);
            return { start, end };
        }
        case "LAST_3_MONTHS": {
            const end = t;
            const start = addMonths(t, -3);
            return { start, end };
        }
        case "LAST_6_MONTHS": {
            const end = t;
            const start = addMonths(t, -6);
            return { start, end };
        }
        case "LAST_1_YEAR": {
            const end = t;
            const start = addMonths(t, -12);
            return { start, end };
        }
        case "PREVIOUS_1_YEAR": {
            const year = t.getFullYear() - 1;
            const start = new Date(year, 0, 1);  // 작년 1월 1일
            const end = new Date(year, 11, 31);  // 작년 12월 31일
            return { start, end };
        }
        case "THIS_QUARTER": {
            return quarterInfo(t);
        }
        case "PREVIOUS_QUARTER": {
            const curQ = quarterInfo(t);
            const prevQuarterEnd = addDays(curQ.start, -1);
            return quarterInfo(prevQuarterEnd);
        }
        default:
            return null;
    }
}


// 미리보기 버튼 활성화 조건
function bindPreviewButtonActivation() {
    const modal = document.getElementById("deal-modal");
    if (!modal) return;

    const previewBtn = modal.querySelector("#btn-deal-preview");
    const issMethodSelect = modal.querySelector("#ISS_MTHD_CM_ID");
    const statusSelect = modal.querySelector("#STATUS_CM_ID");
    const amountUnitSelect = modal.querySelector("#dealAmountUnit");

    if (!previewBtn) return;

    function checkActivation() {
        const allBoxes = modal.querySelectorAll(".selector-box");

        const isDealTypeSelected = Array.from(allBoxes).every(box => {
            const primary = box.querySelector(".deal-type-primary")?.value;
            const secondary = box.querySelector(".deal-type-secondary")?.value;
            if (!primary) {
                return false;
            }

            if (primary === "ALL") {
                return true;
            }

            return !!secondary;
        });

        const isIssSelected = !!issMethodSelect?.value;
        const isStatusSelected = !!statusSelect?.value;
        const isAmountUnitSelected = !!amountUnitSelect?.value;

        previewBtn.disabled = !(
            isDealTypeSelected &&
            isIssSelected &&
            isStatusSelected &&
            isAmountUnitSelected
        );
    }

    // ✅ 초기 상태 반영
    checkActivation();

    // ✅ change 위임 (동적으로 추가된 셀렉트도 포함)
    modal.addEventListener("change", (e) => {
        if (
            e.target.closest(".selector-box") ||
            e.target.id === "ISS_MTHD_CM_ID" ||
            e.target.id === "STATUS_CM_ID" ||
            e.target.id === "dealAmountUnit"
        ) {
            checkActivation();
        }
    });

    // ✅ selector-box 삭제(-) 후에도 반영되게
    modal.addEventListener("click", (e) => {
        if (e.target.classList.contains("deal-data-minus-btn")) {
            setTimeout(checkActivation, 0);
        }
    });
}

function buildDealSearchDto() {
    const modal = document.getElementById("deal-modal");
    if (!modal) return null;

    const corpId = modal.dataset.bcmId;
    if (!corpId) {
        alert("종목을 선택해주세요.");
        return null;
    }
    const corpName = modal.dataset.bcmCorpName;

    const allBoxes = modal.querySelectorAll(".selector-box");
    const dealTypes = [];

    let hasNonMnaType = false;

    for (const box of allBoxes) {
        const primary = box.querySelector(".deal-type-primary")?.value;
        const secondary = box.querySelector(".deal-type-secondary")?.value;

        if (!primary) {
            alert("Deal 종류 1을 선택해주세요.");
            return null;
        }

        if (primary !== "ALL" && !secondary) {
            alert("Deal 종류 2를 선택해주세요.");
            return null;
        }

        if (primary !== "mna") {
            hasNonMnaType = true;
        }

        dealTypes.push({ primary, secondary });
    }

    const issMethod = modal.querySelector("#ISS_MTHD_CM_ID")?.value;
    if (hasNonMnaType && !issMethod) {
        alert("모집방법을 선택해주세요.");
        return null;
    }

    const status = modal.querySelector("#STATUS_CM_ID")?.value;
    if (!status) {
        alert("Deal 상태를 선택해주세요.");
        return null;
    }

    const amountUnit = modal.querySelector("#dealAmountUnit")?.value;
    if (!amountUnit) {
        alert("금액 단위를 선택해주세요.");
        return null;
    }

    const startDate = modal.querySelector('input[name="startDate"]')?.value;
    const endDate = modal.querySelector('input[name="endDate"]')?.value;

    if (!startDate || !endDate) {
        alert("조회 기간을 선택해주세요.");
        return null;
    }

    return {
        corpId: Number(corpId),
        corpName: corpName,
        dealTypes,
        issMethodCmId: hasNonMnaType ? Number(issMethod) : null,
        statusCmId: Number(status),
        amountUnit,
        dateType: modal.querySelector("#dealDateType")?.value ?? "ISS_DT",
        startDate,
        endDate
    };
}

function bindDealPreviewRequest() {
    const modal = document.getElementById("deal-modal");
    if (!modal) return;

    const previewBtn = modal.querySelector("#btn-deal-preview");
    if (!previewBtn) return;

    previewBtn.addEventListener("click", async function () {
        // collapse 토글 전에 데이터 먼저 로딩
        const dto = buildDealSearchDto();
        if (!dto) {
            return;
        }

        try {
            previewBtn.disabled = true;

            const res = await postWithCsrf("/api/editor/deal/data", dto);
            const result = await res.json();

            if (!result.success || !result.data) {
                alert("미리보기 조회 실패");
                return;
            }

            renderDealPreviewTable(result.data, dto);

            // ✅ 데이터 로드 성공 후 collapse 열기
            const collapseEl = document.getElementById("collapseDeal");
            if (collapseEl) {
                const collapse = bootstrap.Collapse.getOrCreateInstance(collapseEl);
                collapse.show();
            }

            // 적용 버튼 표시
            const applyBtn = modal.querySelector("#upload-html2");
            if (applyBtn) {
                applyBtn.classList.remove("d-none");
            }

            const resetBtn = modal.querySelector("#btn-deal-reset");
            if (resetBtn) {
                resetBtn.classList.remove("d-none");
            }

            previewBtn.classList.add("d-none");

        } catch (e) {
            console.error(e);
            alert("미리보기 요청 중 오류가 발생했습니다.");
        } finally {
            previewBtn.disabled = false;
        }
    });
}

function renderDealPreviewTable(rows, dto) {
    const modal = document.getElementById("deal-modal");
    if (!modal) return;

    const tableArea = modal.querySelector("#collapseDeal .table-area");
    if (!tableArea) return;

    const table = tableArea.querySelector("table");
    const thead = table?.querySelector("thead");
    const tbody = table?.querySelector("tbody");
    if (!table || !thead || !tbody) return;

    const titleEl = tableArea.querySelector(".table-title");
    const periodEl = tableArea.querySelector(".table-txt");

    // 제목
    if (titleEl) {
        const manualTitle = modal.querySelector(".StockTitle")?.value?.trim();
        titleEl.textContent = manualTitle || `${dto?.corpName ?? ""} Deal List`;
    }

    // 기간 / 단위
    if (periodEl) {
        const start = dto?.startDate ?? "";
        const end = dto?.endDate ?? "";
        const unit = (modal.querySelector(".unit")?.value?.trim()) || resolveAmountUnitLabel(dto?.amountUnit);
        periodEl.textContent = `기간 : ${start} ~ ${end} / 단위 : ${unit}`;
    }

    // 기존 데이터 행 제거
    tbody.innerHTML = "";

    // 데이터 없으면 빈 행
    if (!Array.isArray(rows) || rows.length === 0) {
        const emptyTr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = thead.querySelectorAll("th").length || 10;
        td.textContent = "조회된 데이터가 없습니다.";
        emptyTr.appendChild(td);
        tbody.appendChild(emptyTr);
        return;
    }

    // 렌더링
    rows.forEach(r => {
        const tr = document.createElement("tr");

        const issMethod =
            r.issSubMthd == null
                ? (r.issMthd == null ? '' : r.issMthd)
                : r.issSubMthd;

        tr.appendChild(tdText(resolvePreviewCategoryLabel(r.ppMthd)));              // 구분
        tr.appendChild(tdText(issMethod));             // 모집방법
        tr.appendChild(tdText(r.dealName));            // 채권명(현재는 링크만, href는 추후)
        tr.appendChild(tdText(r.issDt));               // 발행일
        tr.appendChild(tdText(r.xprDt));               // 만기일

        // 발행액(issAmt) - API 기본: 백만원 단위
        tr.appendChild(tdText(formatNumber(convertFromMillionUnit(r.issAmt, dto?.amountUnit))));

        tr.appendChild(tdText(r.intrt));               // 표면금리
        tr.appendChild(tdText(r.finalXprIntRate));     // 만기수익률
        tr.appendChild(tdText(formatNumber(r.issPrc))); // 발행가액
        tr.appendChild(tdText(formatNumber(r.issQty))); // 발행주수

        tbody.appendChild(tr);
    });
}

function tdText(v) {
    const td = document.createElement("td");
    td.textContent = (v === null || v === undefined || v === "") ? "" : String(v);
    return td;
}

function resolvePreviewCategoryLabel(value) {
    if (value === "유상증자") {
        return "유증";
    }

    return value;
}

function formatNumber(v) {
    if (v === null || v === undefined || v === "") return "";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);

    const hasFraction = !Number.isInteger(n);
    return n.toLocaleString("ko-KR", {
        maximumFractionDigits: hasFraction ? 2 : 0
    });
}

function resolveAmountUnitLabel(unit) {
    switch (unit) {
        case "KRW": return "원";
        case "MILLION_KRW": return "백만원";
        case "BILLION_KRW": return "억원";
        default: return unit ?? "";
    }
}

function convertFromMillionUnit(value, amountUnit) {
    if (value === null || value === undefined || value === "") return "";

    const n = Number(value);
    if (Number.isNaN(n)) return value;

    switch (amountUnit) {
        case "KRW":
            // 백만원 -> 원
            return n * 1_000_000;
        case "BILLION_KRW":
            // 백만원 -> 억원 (1억 = 100백만원)
            return n / 100;
        case "MILLION_KRW":
        default:
            // 백만원 그대로
            return n;
    }
}

function resetDealModal() {
    const modal = document.getElementById("deal-modal");
    if (!modal) return;

    // selector-box 하나만 남기고 초기화
    const boxes = modal.querySelectorAll(".selector-box");
    boxes.forEach((box, index) => {
        if (index === 0) {
            box.querySelector(".deal-type-primary").value = "";
            box.querySelector(".deal-type-secondary").innerHTML =
                '<option value="" selected>Deal 종류 2</option>';

            box.querySelector(".deal-type-secondary").disabled = false;

            const btn = box.querySelector(".str-btn");
            btn.classList.remove("btn-danger", "deal-data-minus-btn");
            btn.classList.add("btn-primary");
            btn.textContent = "+";
        } else {
            box.remove();
        }
    });

    // 모집방법 / 상태 / 단위
    const iss = modal.querySelector("#ISS_MTHD_CM_ID");
    const status = modal.querySelector("#STATUS_CM_ID");
    const unit = modal.querySelector("#dealAmountUnit");

    if (iss) iss.value = "";
    if (status) status.value = "";
    if (unit) unit.value = "MILLION_KRW";

    // 날짜타입 기본값
    const dateType = modal.querySelector("#dealDateType");
    if (dateType) {
        dateType.value = "ISS_DT";
        dateType.disabled = false;
    }

    // 제목 / 단위 input
    applyDealDateRange(modal, "LAST_6_MONTHS");

    const titleInput = modal.querySelector(".StockTitle");
    const unitInput = modal.querySelector(".unit");

    if (titleInput) titleInput.value = "";
    if (unitInput) unitInput.value = "";

    // collapse 닫기
    const collapseEl = document.getElementById("collapseDeal");
    if (collapseEl) {
        const instance = bootstrap.Collapse.getOrCreateInstance(collapseEl, {
            toggle: false
        });
        instance.hide();
    }

    // 테이블 초기화 (헤더만 남김)
    const tbody = modal.querySelector("#collapseDeal tbody");
    if (tbody) {
        const headerRow = tbody.querySelector("tr");
        tbody.innerHTML = "";
        if (headerRow) tbody.appendChild(headerRow);
    }

    const applyBtn = modal.querySelector("#upload-html2");
    if (applyBtn) {
        applyBtn.classList.add("d-none");
    }

    const resetBtn = modal.querySelector("#btn-deal-reset");
    if (resetBtn) {
        resetBtn.classList.add("d-none");
    }

    const previewBtn = modal.querySelector("#btn-deal-preview");
    if (previewBtn) {
        previewBtn.classList.remove("d-none");
        previewBtn.disabled = true;
    }
}

// 적용 버튼 클릭 시, 미리보기 테이블(table-area)을 에디터에 삽입
function bindDealApplyToEditor() {
    const modal = document.getElementById("deal-modal");
    if (!modal) return;

    const applyBtn = modal.querySelector("#upload-html2");
    if (!applyBtn) return;

    // 중복 바인딩 방지
    if (applyBtn.dataset.bound === "1") return;
    applyBtn.dataset.bound = "1";

    applyBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const tableArea = modal.querySelector("#collapseDeal .table-area");
        if (!tableArea) {
            alert("삽입할 테이블이 없습니다.");
            return;
        }

        // table-area 안의 내용만 에디터로 삽입
        const html = tableArea.innerHTML?.trim() ?? "";
        if (!html) {
            alert("삽입할 내용이 없습니다.");
            return;
        }

        if (!window.mainEditor || window.mainEditor.isDestroyed) {
            alert("에디터가 준비되지 않았습니다.");
            return;
        }

        try {
            const finalHtml = `<p>&nbsp;</p>${html}<p>&nbsp;</p>`;
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

            // 모달 닫기
            bootstrap.Modal.getInstance(modal)?.hide();
        } catch (err) {
            console.error(err);
            alert("에디터 삽입 중 오류가 발생했습니다.");
        }
    });
}
