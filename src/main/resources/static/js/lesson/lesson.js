import { loadDataTable } from "../common/datatable-handler.js";
import { fillSelect, initSearchAddressCascader } from "../common/search-filters.js";

const PageState = {
    activeTab: "gxtuni",
    selectedApartId: null,
    categories: [],
    gxTuniCategories: [],
    gxTuniCategoryDetailsByParent: new Map(),
    gxTuniApartUsers: [],
    gxTuniApartUsersApartId: null,
    gxTuniWeekdayOptions: [],
    gxTuniWeekdayFilter: null,
    lessonRegistered:null,
    lessonConfirmedStatus: null,
    lessonConfirmedId: null,
    pendingOrder: null,
};

const TAB_CONFIG = {
    gxtuni: {
        ajaxUrl: "/api/lessons/gxtuni",
        categoryId: null,
        columnsFn: getGxTuniTableColumns,
    },
    health: {
        ajaxUrl: "/api/lessons/healthgolf",
        categoryId: 2,
        columnsFn: getHealthGolfTableColumns,
    },
    golf: {
        ajaxUrl: "/api/lessons/healthgolf",
        categoryId: 3,
        columnsFn: getHealthGolfTableColumns,
    },
};

document.addEventListener("DOMContentLoaded", async () => {
    initYearMonthSearch();
    applySearchParamsFromUrl();
    await initSearchAddressCascader({
        apartOptions: getLessonApartOptions(),
        initialApartValue: PageState.selectedApartId,
        onApartChange: (apartId) => {
            PageState.selectedApartId = apartId;
            updateSearchButtonState();
        },
    });
    bindSearchEvents();
    bindTabEvents();
    bindBulkSaveEvent();
    bindConfirmedStatusEvent();
    bindGxTuniWeekdayFilterEvents();
    bindLessonApplyEvent();
    bindOrderConfirmModalEvents();
    updateSearchButtonState();
    await reloadLessonConfirmedStatus();
    void reloadLessonTable(true);
});

// 연도/월/아파트가 모두 선택되어야 검색 가능
function canSearch() {
    const year = getVal("search-year");
    const month = getVal("search-month");
    const apartId = PageState.selectedApartId ?? toNumOrNull(getVal("search-target-apart"));
    return Boolean(year) && Boolean(month) && apartId != null;
}

function updateSearchButtonState() {
    const btn = $id("btn-search");
    if (!btn) return;

    const enabled = canSearch();
    btn.disabled = !enabled;
    btn.title = enabled ? "" : "연도, 월, 아파트를 모두 선택해 주세요.";
}

function getLessonApartOptions() {
    return {
        apiUrl: "/api/lessons/confirmed/lesson",
        idKey: "apartId",
        nameKey: "apartName",
        length: 200,
        extraParams: () => ({
            search_YEAR_IS: getVal("search-year"),
            search_MONTH_IS: getVal("search-month"),
        }),
    };
}

function initYearMonthSearch() {
    const now = new Date();
    setVal("search-year", now.getFullYear());

    const monthSelect = $id("search-month");
    if (!monthSelect) return;

    monthSelect.innerHTML = "";
    for (let i = 1; i <= 12; i += 1) {
        const value = String(i).padStart(2, "0");
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = `${i}월`;
        monthSelect.appendChild(opt);
    }
    monthSelect.value = String(now.getMonth() + 1).padStart(2, "0");
}

function applySearchParamsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const year = params.get("year");
    const month = params.get("month");
    const apartId = params.get("apartId");

    if (year) setVal("search-year", year);
    if (month) setVal("search-month", month.padStart(2, "0"));
    if (apartId) {
        PageState.selectedApartId = Number(apartId);
    }
}

function bindSearchEvents() {
    const runSearch = async () => {
        if (!canSearch()) return;
        await reloadLessonConfirmedStatus();
        void reloadLessonTable(true);
    };

    $id("btn-search")?.addEventListener("click", runSearch);
    $id("btn-reset")?.addEventListener("click", async () => {
        setVal("search-target-depth1", "-");
        setVal("search-target-apart", "-");
        fillSelect("search-target-depth2", [], { placeholder: "전체", placeholderValue: "-" });
        initYearMonthSearch();
        PageState.selectedApartId = null;
        PageState.gxTuniApartUsers = [];
        PageState.gxTuniApartUsersApartId = null;
        PageState.gxTuniWeekdayOptions = [];
        PageState.gxTuniWeekdayFilter = null;
        await initSearchAddressCascader({
            apartOptions: getLessonApartOptions(),
            onApartChange: (apartId) => {
                PageState.selectedApartId = apartId;
                updateSearchButtonState();
            },
        });
        updateSearchButtonState();
        await reloadLessonConfirmedStatus();
        void reloadLessonTable(true);
    });

    $id("search-target-apart")?.addEventListener("change", () => {
        PageState.selectedApartId = toNumOrNull(getVal("search-target-apart"));
        PageState.gxTuniApartUsers = [];
        PageState.gxTuniApartUsersApartId = null;
        PageState.gxTuniWeekdayOptions = [];
        PageState.gxTuniWeekdayFilter = null;
        updateSearchButtonState();
    });

    $id("search-year")?.addEventListener("input", updateSearchButtonState);
    $id("search-month")?.addEventListener("change", updateSearchButtonState);
}

function bindTabEvents() {
    document.querySelectorAll("[data-lesson-tab]").forEach((tab) => {
        tab.addEventListener("click", async () => {
            const nextTab = tab.getAttribute("data-lesson-tab");
            if (!nextTab || nextTab === PageState.activeTab) return;

            PageState.activeTab = nextTab;
            document.querySelectorAll("[data-lesson-tab]").forEach((item) => {
                item.classList.toggle("active", item === tab);
            });
            PageState.gxTuniWeekdayFilter = null;
            await reloadLessonConfirmedStatus();
            void reloadLessonTable(true);
        });
    });
}

function bindBulkSaveEvent() {
    $id("btn-bulk-save")?.addEventListener("click", handleBulkSave);
}

function bindConfirmedStatusEvent() {
    $id("btn-confirmed-status")?.addEventListener("click", handleConfirmedStatusClick);
}

function bindLessonApplyEvent() {
    document.addEventListener("click", (event) => {
        const btn = event.target.closest(".btn-lesson-apply");
        if (!btn) return;

        void handleLessonApplyClick(btn);
    });
}

async function handleLessonApplyClick(btn) {
    if (btn.disabled) return;

    const row = getLessonRowFromButton(btn);
    const payload = buildLessonOrderPayload(row, btn);

    if (payload == null) {
        alert("주문 생성에 필요한 강습 정보를 찾을 수 없습니다.");
        return;
    }

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "처리 중...";

    try {
        const orderResp = await postJson("/api/orders", payload);
        const order = orderResp?.data;
        if (order?.id == null) {
            throw new Error("생성된 주문 정보를 확인할 수 없습니다.");
        }

        openOrderConfirmModal(order);
    } catch (err) {
        console.error(err);
        alert(err.message || "신청 처리 중 오류가 발생했습니다.");
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

function bindOrderConfirmModalEvents() {
    $id("btn-order-confirm-card")?.addEventListener("click", () => void handlePaymentMethodClick("CARD"));
    $id("btn-order-confirm-vbank")?.addEventListener("click", () => void handlePaymentMethodClick("VBANK"));
}

function openOrderConfirmModal(order) {
    PageState.pendingOrder = order;

    setText("order-confirm-no", order.orderNo ?? "-");
    setText("order-confirm-name", order.orderName ?? "-");
    setText("order-confirm-amount", formatCurrency(order.orderAmount));
    setText("order-confirm-discount", formatCurrency(order.discountAmount));
    setText("order-confirm-payment-amount", formatCurrency(order.paymentAmount));

    setOrderConfirmButtonsDisabled(false);

    const modalEl = $id("order-confirm-modal");
    if (modalEl) {
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
}

async function handlePaymentMethodClick(paymentMethod) {
    const order = PageState.pendingOrder;
    if (order?.id == null) {
        alert("주문정보를 확인할 수 없습니다. 다시 시도해 주세요.");
        return;
    }

    setOrderConfirmButtonsDisabled(true);

    try {
        const paymentResp = await postJson("/api/payments", {
            orderId: order.id,
            pgCompany: "HECTO",
            paymentMethod,
            amount: order.paymentAmount,
        });
        const paymentId = paymentResp?.data?.id;
        if (paymentId == null) {
            throw new Error("생성된 결제 정보를 확인할 수 없습니다.");
        }

        window.location.href = `/pay/checkout/${paymentId}`;
    } catch (err) {
        console.error(err);
        alert(err.message || "결제 요청 처리 중 오류가 발생했습니다.");
        setOrderConfirmButtonsDisabled(false);
    }
}

function setOrderConfirmButtonsDisabled(disabled) {
    $id("btn-order-confirm-card")?.toggleAttribute("disabled", disabled);
    $id("btn-order-confirm-vbank")?.toggleAttribute("disabled", disabled);
}

function formatCurrency(amount) {
    const value = toNumOrNull(amount);
    return value == null ? "-" : `${value.toLocaleString()}원`;
}

function setText(id, text) {
    const el = $id(id);
    if (el) el.textContent = text;
}

function getLessonRowFromButton(btn) {
    const table = $("#lessonDataTable").DataTable();
    const tr = btn.closest("tr");
    if (tr == null) return null;

    const rowApi = table.row(tr);
    if (rowApi?.data() != null) {
        return rowApi.data();
    }

    const parentRow = tr.previousElementSibling;
    if (parentRow != null) {
        return table.row(parentRow).data() ?? null;
    }

    return null;
}

function buildLessonOrderPayload(row, btn) {
    const lessonId = toNumOrNull(btn.dataset.lessonId) ?? row?.id ?? row?.lessonId ?? null;
    const memberId = toNumOrNull(btn.dataset.memberId) ?? row?.memberId ?? row?.userId ?? null;
    const apartId = row?.apartId ?? PageState.selectedApartId ?? toNumOrNull(getVal("search-target-apart"));
    const orderAmount = toNumOrNull(row?.lessonPrice);

    if (lessonId == null || memberId == null || orderAmount == null) {
        return null;
    }

    return {
        memberId,
        apartId,
        lessonId,
        orderName: getLessonOrderName(row),
        orderAmount,
        discountAmount: 0,
    };
}

function getLessonOrderName(row) {
    const year = row?.year ?? getVal("search-year");
    const month = row?.month ?? getVal("search-month");
    const lessonName = [row?.categoryName, row?.categoryName1].filter(Boolean).join(" ");
    const timeName = [row?.weekdayName, row?.timeName].filter(Boolean).join(" ");

    return [year && month ? `${year}년 ${month}월` : "", lessonName, timeName]
        .filter(Boolean)
        .join(" ");
}

async function ensureLessonTabResources() {
    if (PageState.activeTab !== "gxtuni") {
        renderGxTuniWeekdayFilterOptions();
        return;
    }

    await loadCategories();
    await loadGxTuniApartUsers();
    renderGxTuniWeekdayFilterOptions();
}

async function reloadLessonTable(resetPage = false) {
    const tableId = "lessonDataTable";
    const $table = $(`#${tableId}`);
    const config = TAB_CONFIG[PageState.activeTab] ?? TAB_CONFIG.gxtuni;
    await ensureLessonTabResources();

    if ($.fn.DataTable.isDataTable($table)) {
        const table = $table.DataTable();
        if ($table.data("lesson-tab") === PageState.activeTab) {
            table.ajax.url(config.ajaxUrl);
            table.ajax.reload(null, resetPage);
            return;
        }
        table.destroy();
        $table.empty();
    }

    $table.data("lesson-tab", PageState.activeTab);

    const drawCallbacks = [applyLessonConfirmedLock];
    if (PageState.activeTab === "gxtuni") {
        drawCallbacks.unshift(bindGxTuniTableEvents);
        drawCallbacks.push(applyGxTuniWeekdayFilter);
    }

    loadDataTable({
        tableId,
        ajaxUrl: config.ajaxUrl,
        columns: config.columnsFn(),
        defaultOrderIndex: null,
        minTableWidth: 1100,
        getExtraDataFn: getLessonSearchParams,
        enableOrdering: false,
        mobileBreakpoint: 640,
        enableCardView: true,
        enableResponsive: false,
        titleColumnName: "강습",
        onDrawCallbackList: drawCallbacks,
        extraOptions: {
            dom: "rtip",
            pageLength: 200,
        },
    });
}

function getLessonSearchParams() {
    const config = TAB_CONFIG[PageState.activeTab] ?? TAB_CONFIG.gxtuni;
    const apartId = PageState.selectedApartId ?? toNumOrNull(getVal("search-target-apart"));
    const params = {
        length: 200,
        search_YEAR_IS: getVal("search-year"),
        search_MONTH_IS: getVal("search-month"),
        search_APART_ID_IS: apartId ?? -1,
    };

    if (config.categoryId != null) {
        params.search_CATEGORY_ID_IS = config.categoryId;
    }

    return params;
}

async function handleBulkSave() {
    if (isLessonLocked()) {
        alert("확정되었거나 마감된 강습은 수정할 수 없습니다.");
        return;
    }

    const table = $("#lessonDataTable").DataTable();
    const payload = PageState.activeTab === "gxtuni"
        ? collectGxTuniRows(table)
        : collectHealthGolfRows(table);
    if (payload.length === 0) {
        alert("저장할 데이터가 없습니다.");
        return;
    }

    const validationMessage = PageState.activeTab === "gxtuni"
        ? validateGxTuniRows(payload)
        : validateHealthGolfRows(payload);
    if (validationMessage) {
        alert(validationMessage);
        return;
    }

    const btn = $id("btn-bulk-save");
    const originalText = btn?.innerHTML;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = "저장 중...";
    }

    try {
        const bulkUrl = PageState.activeTab === "gxtuni"
            ? "/api/lessons/gxtuni/bulk"
            : "/api/lessons/healthgolf/bulk";
        const res = await postJson(bulkUrl, payload);
        alert(`저장되었습니다. 등록 ${res?.data?.created ?? 0}건, 수정 ${res?.data?.updated ?? 0}건, 삭제 ${res?.data?.deleted ?? 0}건`);
        void reloadLessonConfirmedStatus();
        void reloadLessonTable(false);
    } catch (err) {
        console.error(err);
        alert(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
        if (btn) {
            btn.disabled = isLessonLocked();
            btn.innerHTML = originalText;
        }
    }
}

async function handleConfirmedStatusClick() {
    const btn = $id("btn-confirmed-status");
    if (!btn) return;

    const payload = getLessonConfirmedPayload();
    if (payload == null) {
        alert("연도, 월, 아파트 , 강습을 선택해 주세요.");
        return;
    }

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "처리 중...";

    try {
        if (PageState.lessonConfirmedStatus == null) {
            await postJson("/api/lessons/confirmed", { ...payload, confirmed: 0, activated: 1 });
        } else if (PageState.lessonConfirmedId == null) {
            throw new Error("확정 대상 정보를 찾을 수 없습니다.");
        } else if (Number(PageState.lessonConfirmedStatus) === 0) {
            await putJson(`/api/lessons/${PageState.lessonConfirmedId}/confirmed`, { ...payload, confirmed: 1, activated: 1 });
        } else if (Number(PageState.lessonConfirmedStatus) === 1) {
            await putJson(`/api/lessons/${PageState.lessonConfirmedId}/confirmed`, { ...payload, confirmed: 2, activated: 1 });
        }

        await reloadLessonConfirmedStatus();
        void reloadLessonTable(false);
    } catch (err) {
        console.error(err);
        alert(err.message || "확정 상태 처리 중 오류가 발생했습니다.");
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

async function reloadLessonConfirmedStatus() {
    const btn = $id("btn-confirmed-status");
    if (!btn) return;

    const apartId = PageState.selectedApartId ?? toNumOrNull(getVal("search-target-apart"));
    const year = getVal("search-year");
    const month = getVal("search-month");
    const lessonType = PageState.activeTab;

    if (!apartId || !year || !month || !lessonType) {
        PageState.lessonConfirmedStatus = null;
        PageState.lessonConfirmedId = null;
        btn.classList.add("d-none");
        applyLessonConfirmedLock();
        return;
    }

    btn.classList.remove("d-none", "btn-primary", "btn-warning", "btn-success", "btn-secondary", "btn-outline-secondary");
    btn.classList.add("btn-outline-secondary");
    btn.disabled = true;
    btn.textContent = "확인 중...";

    try {
        const params = new URLSearchParams({
            year,
            month,
            apartId: String(apartId),
            lessonType: lessonType,
        });
        const resp = await fetchJson(`/api/lessons/confirmed?${params.toString()}`);
        const confirmed = resp?.data?.confirmed ?? null;
        const lessonRegistered = resp?.data?.lessonRegistered ?? false;
        PageState.lessonRegistered = lessonRegistered;
        PageState.lessonConfirmedStatus = confirmed;
        PageState.lessonConfirmedId = resp?.data?.id ?? null;

        btn.classList.remove("btn-outline-secondary", "btn-primary", "btn-warning", "btn-success", "btn-secondary");

        if (lessonRegistered == false) {
            btn.classList.add("btn-secondary");
            btn.disabled = true;
            btn.textContent = "미등록";
            applyLessonConfirmedLock();
            return;
        }

        if (confirmed == null) {
            btn.classList.add("btn-primary");
            btn.disabled = false;
            btn.textContent = "등록처리";
            applyLessonConfirmedLock();
            return;
        }

        if (Number(confirmed) === 0) {
            btn.classList.add("btn-warning");
            btn.disabled = false;
            btn.textContent = "확정처리";
            applyLessonConfirmedLock();
            return;
        }
        if (Number(confirmed) === 1) {
            btn.classList.add("btn-warning");
            btn.disabled = false;
            btn.textContent = "마감처리";
            applyLessonConfirmedLock();
            return;
        }

        btn.classList.add("btn-secondary");
        btn.disabled = true;
        btn.textContent = "마감";
        applyLessonConfirmedLock();
    } catch (err) {
        console.error(err);
        PageState.lessonConfirmedStatus = null;
        PageState.lessonConfirmedId = null;
        btn.classList.remove("btn-primary", "btn-warning", "btn-success", "btn-secondary");
        btn.classList.add("btn-outline-secondary");
        btn.disabled = true;
        btn.textContent = "확인 실패";
        applyLessonConfirmedLock();
    }
}

function getLessonConfirmedPayload() {
    const apartId = PageState.selectedApartId ?? toNumOrNull(getVal("search-target-apart"));

    const year = getVal("search-year");
    const month = getVal("search-month");
    const lessonType = PageState.activeTab;

    if (!apartId || !year || !month || !lessonType) {
        return null;
    }

    return {
        year,
        month,
        apartId,
        lessonType
    };
}

function isLessonConfirmed() {
    return Number(PageState.lessonConfirmedStatus) === 1;
}

// 미등록(null)/등록(0) 상태는 수정 가능, 확정(1) 또는 마감(2) 상태면 수정 불가
function isLessonLocked() {
    if (PageState.lessonRegistered == null || !PageState.lessonRegistered) return false;
    const status = Number(PageState.lessonConfirmedStatus);
    return status === 1 || status === 2;
}

function applyLessonConfirmedLock() {
    const locked = isLessonLocked();
    $id("btn-bulk-save")?.toggleAttribute("disabled", locked);

    document.querySelectorAll("#lessonDataTable input, #lessonDataTable select, #lessonDataTable button").forEach((control) => {
        if (control.classList.contains("btn-lesson-apply")) return;
        control.disabled = locked;
    });
}

function collectGxTuniRows(table) {
    const rows = [];

    table.rows().every(function () {
        const row = { ...this.data() };
        const node = this.node();
        const userId = toNumOrNull(node?.querySelector(".gx-user-select")?.value);

        row.year = getVal("search-year");
        row.month = getVal("search-month");
        row.apartId = row.apartId ?? PageState.selectedApartId ?? toNumOrNull(getVal("search-target-apart"));
        row.categoryId = toNumOrNull(node?.querySelector(".gx-category-select")?.value) ?? row.categoryId;
        row.categoryId1 = toNumOrNull(node?.querySelector(".gx-category-detail-select")?.value) ?? row.categoryId1;
        row.userId = userId;
        row.commission = getRowInputValue(node, "commission");
        row.lessonPrice = getRowInputValue(node, "lessonPrice");
        row.lessonCnt = getRowInputValue(node, "lessonCnt");
        row.capacity = getRowInputValue(node, "capacity");
        row.minCapacity = getRowInputValue(node, "minCapacity");
        row.selected = userId != null;
        row.activated = userId == null ? 0 : 1;

        rows.push(row);
    });

    return rows;
}

function collectHealthGolfRows(table) {
    const rows = [];

    table.rows().every(function () {
        const row = { ...this.data() };
        const node = this.node();
        const checked = node?.querySelector(".lesson-row-check")?.checked ?? false;

        row.selected = checked;
        row.id = row.id ?? row.lessonId ?? null;
        row.lessonId = row.lessonId ?? row.id ?? null;
        row.year = getVal("search-year");
        row.month = getVal("search-month");
        row.apartId = row.apartId ?? PageState.selectedApartId ?? toNumOrNull(getVal("search-target-apart"));
        row.categoryId = TAB_CONFIG[PageState.activeTab]?.categoryId ?? row.categoryId;
        row.commission = getRowInputValue(node, "commission");
        row.lessonPrice = getRowInputValue(node, "lessonPrice");
        row.lessonCnt = getRowInputValue(node, "lessonCnt");
        row.activated = checked ? 1 : 0;

        rows.push(row);
    });

    return rows;
}

function validateGxTuniRows(rows) {
    if (!toNumOrNull(getVal("search-target-apart"))) {
        return "아파트를 선택해 주세요.";
    }

    const invalid = rows.find((row) => {
        if (row.userId == null) return false;
        return row.commission == null
            || row.lessonPrice == null
            || row.lessonCnt == null
            || row.capacity == null
            || row.minCapacity == null;
    });

    if (invalid) {
        return `${invalid.weekdayName ?? ""} ${invalid.timeName ?? ""} 강사가 선택된 행은 수수료, 금액, 횟수, 정원, 최소정원을 모두 입력해 주세요.`.trim();
    }

    return null;
}

function validateHealthGolfRows(rows) {
    if (!toNumOrNull(getVal("search-target-apart"))) {
        return "아파트를 선택해 주세요.";
    }

    const invalid = rows.find((row) => {
        if (!Boolean(row.selected)) return false;
        return row.commission == null || row.lessonPrice == null || row.lessonCnt == null;
    });

    if (invalid) {
        return `${invalid.userName ?? ""} ${invalid.categoryName1 ?? ""} 선택된 행은 수수료, 금액, 횟수를 모두 입력해 주세요.`.trim();
    }

    return null;
}

function getRowInputValue(rowNode, field) {
    const input = rowNode?.querySelector(`.lesson-input[data-field="${field}"]`);
    return input == null || input.value === "" ? null : Number(input.value);
}

async function loadCategories() {
    if (PageState.categories.length > 0) return;

    const resp = await fetchJson("/api/categories/tree");
    const data = resp?.data ?? [];
    PageState.categories = Array.isArray(data) ? data : [];
    cacheGxTuniCategories();
}

function cacheGxTuniCategories() {
    PageState.gxTuniCategories = PageState.categories.filter((category) => {
        return category.parentId == null && isGxTuniCategoryRoot(category);
    });

    PageState.gxTuniCategoryDetailsByParent = new Map();
    PageState.gxTuniCategories.forEach((category) => {
        const children = PageState.categories.filter((child) => sameId(child.parentId, category.id));
        PageState.gxTuniCategoryDetailsByParent.set(String(category.id), children);
    });
}

async function loadGxTuniApartUsers() {
    const apartId = PageState.selectedApartId ?? toNumOrNull(getVal("search-target-apart"));
    if (!apartId) {
        PageState.gxTuniApartUsers = [];
        PageState.gxTuniApartUsersApartId = null;
        PageState.gxTuniWeekdayOptions = [];
        PageState.gxTuniWeekdayFilter = null;
        return;
    }
    if (Number(PageState.gxTuniApartUsersApartId) === Number(apartId)) return;

    const params = new URLSearchParams({
        draw: "1",
        start: "0",
        length: "200",
        search_APART_ID_IS: String(apartId),
        search_ACTIVATED_IS: "1",
    });
    const resp = await fetchJson(`/api/apart-user?${params.toString()}`);
    PageState.gxTuniApartUsers = normalizeList(resp);
    PageState.gxTuniApartUsersApartId = apartId;
    PageState.gxTuniWeekdayOptions = buildGxTuniWeekdayOptions(PageState.gxTuniApartUsers);
    PageState.gxTuniWeekdayFilter = null;
}

// gxTuniApartUsers 원본은 그대로 두고, weekdayCodes/weekdayNames 값을 code-name 쌍으로 중복 제거해 별도로 보관
function buildGxTuniWeekdayOptions(users) {
    const optionsByCode = new Map();

    users.forEach((user) => {
        if (user.weekdayCodes == null) return;

        const codes = String(user.weekdayCodes)
            .split(",")
            .map((value) => value.trim())
            .filter((value) => value !== "");
        const names = user.weekdayNames == null
            ? []
            : String(user.weekdayNames)
                  .split("/")
                  .map((value) => value.trim())
                  .filter((value) => value !== "");

        codes.forEach((code, index) => {
            if (!optionsByCode.has(code)) {
                optionsByCode.set(code, names[index] ?? code);
            }
        });
    });

    return Array.from(optionsByCode, ([code, name]) => ({ code, name })).sort(
        (a, b) => Number(a.code) - Number(b.code)
    );
}

function renderGxTuniWeekdayFilterOptions() {
    const select = $id("gx-weekday-filter-select");
    if (!select) return;

    const options = PageState.gxTuniWeekdayOptions;
    if (PageState.activeTab !== "gxtuni" || options.length === 0) {
        select.classList.add("d-none");
        select.innerHTML = "";
        return;
    }

    select.classList.remove("d-none");
    select.innerHTML = [
        optionHtml("", "전체", PageState.gxTuniWeekdayFilter == null),
        ...options.map((option) =>
            optionHtml(option.code, option.name, sameId(option.code, PageState.gxTuniWeekdayFilter))
        ),
    ].join("");
}

function bindGxTuniWeekdayFilterEvents() {
    $id("gx-weekday-filter-select")?.addEventListener("change", (event) => {
        const code = event.target.value;
        PageState.gxTuniWeekdayFilter = code === "" ? null : code;
        applyGxTuniWeekdayFilter();
    });
}

function applyGxTuniWeekdayFilter() {
    const $table = $("#lessonDataTable");
    if (!$.fn.DataTable.isDataTable($table)) return;

    const table = $table.DataTable();
    const filter = PageState.gxTuniWeekdayFilter;

    table.rows().every(function () {
        const data = this.data();
        const rowWeekdayCode = data?.weekdayCode ?? data?.weekdaycode;
        const matches = filter == null || sameId(rowWeekdayCode, filter);
        $(this.node()).toggle(matches);
    });
}

function getGxTuniTableColumns() {
    return [
        textColumn("weekdayName", "요일", "8%"),
        textColumn("timeName", "시간", "8%"),
        {
            data: "categoryId",
            title: "강습",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (value, type, row, meta) => renderGxTuniCategorySelect(row, meta),
        },
        {
            data: "categoryId1",
            title: "세부강습",
            className: "data-txt",
            orderable: false,
            width: "12%",
            render: (value, type, row, meta) => renderGxTuniCategoryDetailSelect(row, meta),
        },
        {
            data: "userId",
            title: "강사",
            className: "data-txt",
            orderable: false,
            width: "14%",
            render: (value, type, row, meta) => renderGxTuniUserSelect(row, meta),
        },
        inputNumberColumn("commission", "수수료", "9%"),
        inputNumberColumn("lessonPrice", "금액", "9%"),
        inputNumberColumn("lessonCnt", "횟수", "8%"),
        inputNumberColumn("capacity", "정원", "8%"),
        inputNumberColumn("minCapacity", "최소정원", "8%"),
        {
            data: "activated",
            title: "상태",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (value, type, row) => {
                const status = value ?? row.lessonActivated;
                const statusText = Number(status) === 1 ? "운영" : Number(status) === 0 ? "폐강" : "-";
                return renderLessonStatusWithApplyButton(statusText, row);
            },
        },
        {
            data: "cancelReason",
            title: "폐강사유",
            className: "data-txt",
            orderable: false,
            width: "8%",
            render: (value, type, row) => renderGxTuniCancelReason(row),
        },
    ];
}

function renderGxTuniCancelReason(row) {
    if (Number(row.lessonActivated) === 1) {
        return `
            <button type="button" class="btn btn-sm btn-outline-danger btn-lesson-cancel"
                data-lesson-id="${escapeAttr(row.id ?? row.lessonId ?? "")}">
                폐강신청
            </button>
        `;
    }

    if (Number(row.lessonActivated) === 0) {
        return escapeHtml(row.cancelReason ?? "-");
    }

    return "-";
}

function renderGxTuniCategorySelect(row, meta) {
    const options = getGxTuniRootCategories()
        .map((category) => optionHtml(category.id, category.name, sameId(category.id, row.categoryId)))
        .join("");

    return `
        <select class="form-select form-select-sm gx-category-select" data-row-index="${meta.row}">
            <option value="">선택</option>
            ${options}
        </select>
    `;
}

function renderGxTuniCategoryDetailSelect(row, meta) {
    const categoryId = row.categoryId;
    const options = getChildCategories(categoryId)
        .map((category) => optionHtml(category.id, category.name, sameId(category.id, row.categoryId1)))
        .join("");

    return `
        <select class="form-select form-select-sm gx-category-detail-select" data-row-index="${meta.row}">
            <option value="">선택</option>
            ${options}
        </select>
    `;
}

function renderGxTuniUserSelect(row, meta) {
    const users = getGxTuniUsersForRow(row);
    const options = users
        .map((user) => optionHtml(user.userId, formatApartUserName(user), sameId(user.userId, row.userId)))
        .join("");

    return `
        <select class="form-select form-select-sm gx-user-select" data-row-index="${meta.row}">
            <option value="">선택</option>
            ${options}
        </select>
    `;
}

function bindGxTuniTableEvents(api) {
    const table = api || $("#lessonDataTable").DataTable();
    const tableNode = table.table().node();

    if (tableNode.dataset.gxEventsBound === "1") return;
    tableNode.dataset.gxEventsBound = "1";
    tableNode.addEventListener("change", (event) => {
        const select = event.target;
        if (!(select instanceof HTMLSelectElement)) return;

        if (select.classList.contains("gx-category-select")) {
            handleGxTuniCategoryChange(table, select);
            return;
        }

        if (select.classList.contains("gx-category-detail-select")) {
            handleGxTuniCategoryDetailChange(table, select);
            return;
        }

        if (select.classList.contains("gx-user-select")) {
            handleGxTuniUserChange(table, select);
        }
    });
}

function handleGxTuniCategoryChange(table, select) {
    const rowApi = table.row(select.closest("tr"));
    const row = rowApi.data();
    row.categoryId = toNumOrNull(select.value);
    row.categoryName = getSelectedOptionText(select);
    row.categoryId1 = null;
    row.categoryName1 = null;
    row.userId = null;
    row.userName = null;
    clearGxTuniUserValues(row);
    renderGxTuniRowControls(select.closest("tr"), row);
}

function handleGxTuniCategoryDetailChange(table, select) {
    const rowApi = table.row(select.closest("tr"));
    const row = rowApi.data();
    row.categoryId1 = toNumOrNull(select.value);
    row.categoryName1 = getSelectedOptionText(select);
    const selectedDetail = getCategoryById(row.categoryId1);
    if (selectedDetail?.parentId != null) {
        const parent = getCategoryById(selectedDetail.parentId);
        row.categoryId = selectedDetail.parentId;
        row.categoryName = parent?.name ?? row.categoryName;
    }
    row.userId = null;
    row.userName = null;
    clearGxTuniUserValues(row);
    renderGxTuniRowControls(select.closest("tr"), row);
}

function handleGxTuniUserChange(table, select) {
    const rowApi = table.row(select.closest("tr"));
    const row = rowApi.data();
    const userId = toNumOrNull(select.value);
    const apartUser = PageState.gxTuniApartUsers.find((item) => {
        if (!sameId(item.userId, userId)) return false;
        return row.categoryId1 == null || row.categoryId1 === "" || sameId(item.categoryId1, row.categoryId1);
    });

    row.userId = userId;
    row.userName = apartUser == null ? "" : apartUser.userName;
    if (apartUser != null) {
        row.categoryId = apartUser.categoryId;
        row.categoryName = apartUser.categoryName;
        row.categoryId1 = apartUser.categoryId1;
        row.categoryName1 = apartUser.categoryName1;
        row.commission = apartUser.commission;
        row.lessonPrice = apartUser.lessonPrice;
        row.lessonCnt = apartUser.lessonCnt;
        row.capacity = apartUser.capacity;
        row.minCapacity = apartUser.minCapacity;
    } else {
        clearGxTuniUserValues(row);
    }

    renderGxTuniRowControls(select.closest("tr"), row);
}

function renderGxTuniRowControls(rowNode, row) {
    if (!rowNode) return;

    const categorySelect = rowNode.querySelector(".gx-category-select");
    if (categorySelect) {
        categorySelect.value = row.categoryId == null ? "" : String(row.categoryId);
    }

    const detailSelect = rowNode.querySelector(".gx-category-detail-select");
    if (detailSelect) {
        detailSelect.innerHTML = `
            <option value="">선택</option>
            ${getChildCategories(row.categoryId)
                .map((category) => optionHtml(category.id, category.name, sameId(category.id, row.categoryId1)))
                .join("")}
        `;
        detailSelect.value = row.categoryId1 == null ? "" : String(row.categoryId1);
    }

    const userSelect = rowNode.querySelector(".gx-user-select");
    if (userSelect) {
        userSelect.innerHTML = `
            <option value="">선택</option>
            ${getGxTuniUsersForRow(row)
                .map((user) => optionHtml(user.userId, formatApartUserName(user), sameId(user.userId, row.userId)))
                .join("")}
        `;
        userSelect.value = row.userId == null ? "" : String(row.userId);
    }

    setRowInputValue(rowNode, "commission", row.commission);
    setRowInputValue(rowNode, "lessonPrice", row.lessonPrice);
    setRowInputValue(rowNode, "lessonCnt", row.lessonCnt);
    setRowInputValue(rowNode, "capacity", row.capacity);
    setRowInputValue(rowNode, "minCapacity", row.minCapacity);
}

function setRowInputValue(rowNode, field, value) {
    const input = rowNode?.querySelector(`.lesson-input[data-field="${field}"]`);
    if (input) input.value = value ?? "";
}

function clearGxTuniUserValues(row) {
    row.commission = null;
    row.lessonPrice = null;
    row.lessonCnt = null;
    row.capacity = null;
    row.minCapacity = null;
}

function getGxTuniRootCategories() {
    return PageState.gxTuniCategories;
}

function getChildCategories(categoryId) {
    if (categoryId == null || categoryId === "") return [];
    return PageState.gxTuniCategoryDetailsByParent.get(String(categoryId)) ?? [];
}

function getGxTuniUsersForRow(row) {
    const weekdayCode = row.weekdayCode ?? row.weekdaycode;
    return PageState.gxTuniApartUsers.filter((user) => {
        if (row.categoryId1 == null || row.categoryId1 === "") return false;
        if (!sameId(user.categoryId1, row.categoryId1)) return false;
        return hasWeekdayCode(user.weekdayCodes, weekdayCode);
    });
}

function getCategoryById(categoryId) {
    if (categoryId == null || categoryId === "") return null;
    return PageState.categories.find((category) => sameId(category.id, categoryId)) ?? null;
}

function hasWeekdayCode(weekdayCodes, weekdayCode) {
    if (weekdayCode == null || weekdayCodes == null) return false;
    return String(weekdayCodes)
        .split(",")
        .map((value) => value.trim())
        .includes(String(weekdayCode));
}

function isGxTuniCategory(categoryId) {
    if (PageState.gxTuniCategories.length > 0) {
        return PageState.gxTuniCategories.some((category) => sameId(category.id, categoryId));
    }
    return sameId(categoryId, 1) || sameId(categoryId, 4);
}

function isGxTuniCategoryRoot(category) {
    const name = String(category?.name ?? "").toUpperCase();
    return name.includes("GX") || name.includes("트니");
}

function formatApartUserName(user) {
    return [user.userName, user.categoryName1 ? `(${user.categoryName1})` : ""].filter(Boolean).join(" ");
}

function optionHtml(value, label, selected = false) {
    return `<option value="${escapeAttr(value ?? "")}" ${selected ? "selected" : ""}>${escapeHtml(label ?? "")}</option>`;
}

function getSelectedOptionText(select) {
    const option = select.selectedOptions?.[0];
    return option == null || option.value === "" ? null : option.textContent.trim();
}

function sameId(left, right) {
    if (left == null || right == null || left === "" || right === "") return false;
    return String(left) === String(right);
}

function getHealthGolfTableColumns() {
    return [
        {
            data: "id",
            title: "선택",
            className: "data-txt",
            orderable: false,
            width: "8%",
            render: (data, type, row, meta) => {
                const checked = row.id != null ? "checked" : "";
                return `
                    <input type="checkbox" class="form-check-input lesson-row-check"
                        data-row-index="${meta.row}" data-lesson-id="${row.id ?? ""}" ${checked}>
                `;
            },
        },
        textColumn("categoryName", "강습", "20%"),
        textColumn("categoryName1", "세부강습", "20%"),
        textColumn("userName", "강사", "20%"),
        inputNumberColumn("commission", "수수료", "9%"),
        inputNumberColumn("lessonPrice", "금액", "9%"),
        inputNumberColumn("lessonCnt", "횟수", "8%"),
        {
            data: "activated",
            title: "상태",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (value, type, row) => {
                const status = value ?? row.lessonActivated ?? row.apartUserActivated;
                const statusText = Number(status) === 0 ? "미운영" : "운영";
                return renderLessonStatusWithApplyButton(statusText, row);
            },
        },
    ];
}

function renderLessonStatusWithApplyButton(statusText, row) {
    const label = escapeHtml(statusText ?? "-");
    if (!isLessonConfirmed() || !hasAssignedTeacher(row)) {
        return label;
    }

    return `
        <div class="d-inline-flex align-items-center justify-content-center gap-1 flex-wrap">
            <span>${label}</span>
            <button type="button" class="btn btn-sm btn-outline-primary btn-lesson-apply"
                data-lesson-id="${escapeAttr(row.id ?? row.lessonId ?? "")}"
                data-member-id="${escapeAttr(row.memberId ?? row.userId ?? "")}">
                신청
            </button>
        </div>
    `;
}

function hasAssignedTeacher(row) {
    return (row?.userId != null && row.userId !== "") || Boolean(row?.userName);
}

function rowNumberColumn(width) {
    return {
        data: null,
        title: "#",
        className: "data-txt",
        orderable: false,
        width,
        render: (data, type, row, meta) => {
            const start = meta?.settings?._iDisplayStart ?? 0;
            return start + meta.row + 1;
        },
    };
}

function textColumn(data, title, width) {
    return {
        data,
        title,
        className: "data-txt",
        orderable: false,
        width,
        render: (value) => value ?? "-",
    };
}

function inputNumberColumn(data, title, width) {
    return {
        data,
        title,
        className: "data-txt",
        orderable: false,
        width,
        render: (value, type, row, meta) => {
            return `
                <input type="number" class="form-control form-control-sm lesson-input"
                    data-row-index="${meta.row}" data-field="${data}" value="${escapeAttr(value ?? "")}">
            `;
        },
    };
}

function escapeAttr(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

async function fetchJson(url) {
    const csrf = getCsrf();
    const res = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            ...(csrf ? { [csrf.header]: csrf.token } : {}),
        },
        credentials: "include",
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.message || `${res.status} ${res.statusText}`);
    return data;
}

async function postJson(url, payload) {
    return sendJson("POST", url, payload);
}

async function putJson(url, payload) {
    return sendJson("PUT", url, payload);
}

async function sendJson(method, url, payload) {
    const csrf = getCsrf();
    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(csrf ? { [csrf.header]: csrf.token } : {}),
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.message || `${res.status} ${res.statusText}`);
    return data;
}

function getCsrf() {
    const token = document.querySelector('meta[name="_csrf"]')?.getAttribute("content");
    const header = document.querySelector('meta[name="_csrf_header"]')?.getAttribute("content") || "X-CSRF-TOKEN";
    return token ? { header, token } : null;
}

function normalizeList(resp) {
    const data = resp?.data ?? [];
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
        id: item.id ?? item.value ?? item.key,
        name: item.name ?? item.title ?? String(item.id ?? ""),
        ...item,
    }));
}

function setVal(id, value) {
    const el = $id(id);
    if (el) el.value = value ?? "";
}

const $id = (id) => document.getElementById(id);
const getVal = (id) => $id(id)?.value?.trim() ?? "";
const toNumOrNull = (value) => value === "" || value === "-" || value == null ? null : Number(value);
