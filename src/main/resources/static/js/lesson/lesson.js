import { loadDataTable } from "../common/datatable-handler.js";

const PageState = {
    activeTab: "gxtuni",
    selectedApartId: null,
    categories: [],
    gxTuniCategories: [],
    gxTuniCategoryDetailsByParent: new Map(),
    gxTuniApartUsers: [],
    gxTuniApartUsersApartId: null,
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
    await initSearchAddressCascader();
    await reloadApartSelect();
    bindSearchEvents();
    bindTabEvents();
    bindBulkSaveEvent();
    void reloadLessonTable(true);
});

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

function bindSearchEvents() {
    const runSearch = async () => {
        await reloadApartSelect();
        void reloadLessonTable(true);
    };

    $id("btn-search")?.addEventListener("click", runSearch);
    $id("btn-reset")?.addEventListener("click", async () => {
        setVal("search-target-depth1", "-");
        fillSelect("search-target-depth2", [], { placeholder: "전체", placeholderValue: "-" });
        setVal("search-target-apart", "-");
        setVal("target-text", "");
        initYearMonthSearch();
        PageState.selectedApartId = null;
        PageState.gxTuniApartUsers = [];
        PageState.gxTuniApartUsersApartId = null;
        await reloadApartSelect();
        void reloadLessonTable(true);
    });

    $id("target-text")?.addEventListener("keydown", async (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        await runSearch();
    });

    $id("search-year")?.addEventListener("change", () => void reloadLessonTable(true));
    $id("search-month")?.addEventListener("change", () => void reloadLessonTable(true));
    $id("search-target-apart")?.addEventListener("change", () => {
        PageState.selectedApartId = toNumOrNull(getVal("search-target-apart"));
        PageState.gxTuniApartUsers = [];
        PageState.gxTuniApartUsersApartId = null;
        void reloadLessonTable(true);
    });
}

function bindTabEvents() {
    document.querySelectorAll("[data-lesson-tab]").forEach((tab) => {
        tab.addEventListener("click", () => {
            const nextTab = tab.getAttribute("data-lesson-tab");
            if (!nextTab || nextTab === PageState.activeTab) return;

            PageState.activeTab = nextTab;
            document.querySelectorAll("[data-lesson-tab]").forEach((item) => {
                item.classList.toggle("active", item === tab);
            });
            void reloadLessonTable(true);
        });
    });
}

function bindBulkSaveEvent() {
    $id("btn-bulk-save")?.addEventListener("click", handleBulkSave);
}

async function ensureLessonTabResources() {
    if (PageState.activeTab !== "gxtuni") return;

    await loadCategories();
    await loadGxTuniApartUsers();
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
        onDrawCallbackList: PageState.activeTab === "gxtuni" ? [bindGxTuniTableEvents] : [],
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
        void reloadLessonTable(false);
    } catch (err) {
        console.error(err);
        alert(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
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

async function initSearchAddressCascader() {
    await loadAddressSelect("search-target-depth1", { placeholder: "전체", placeholderValue: "-" });
    fillSelect("search-target-depth2", [], { placeholder: "전체", placeholderValue: "-" });

    $id("search-target-depth1")?.addEventListener("change", async () => {
        const addressId = toNumOrNull(getVal("search-target-depth1"));
        await loadAddress1Select(addressId, "search-target-depth2", { placeholder: "전체", placeholderValue: "-" });
        await reloadApartSelect();
    });

    $id("search-target-depth2")?.addEventListener("change", async () => {
        await reloadApartSelect();
    });
}

async function reloadApartSelect() {
    const previousApartId = getVal("search-target-apart");
    const params = new URLSearchParams({
        draw: "1",
        start: "0",
        length: "200",
    });

    const keyword = getVal("target-text");
    const addressId = getVal("search-target-depth1");
    const addressId1 = getVal("search-target-depth2");

    if (keyword) params.set("search_NAME_LIKE", keyword);
    if (addressId && addressId !== "-") params.set("search_ADDRESS_ID_IS", addressId);
    if (addressId1 && addressId1 !== "-") params.set("search_ADDRESS1_ID_IS", addressId1);

    const resp = await fetchJson(`/api/aparts?${params.toString()}`);
    const items = normalizeList(resp).map((item) => ({
        id: item.id,
        name: item.name,
    }));

    fillSelect("search-target-apart", items, { placeholder: "아파트 선택", placeholderValue: "-" });

    if (previousApartId && items.some((item) => String(item.id) === String(previousApartId))) {
        setVal("search-target-apart", previousApartId);
        PageState.selectedApartId = toNumOrNull(previousApartId);
        return;
    }

    PageState.selectedApartId = null;
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
}

async function loadAddressSelect(selectId, options = {}) {
    const resp = await fetchJson("/api/address");
    const items = normalizeList(resp).map((item) => ({
        id: item.id,
        name: item.name,
    }));
    fillSelect(selectId, items, { placeholder: "전체", placeholderValue: "-", ...options });
}

async function loadAddress1Select(addressId, selectId, options = {}) {
    if (!addressId) {
        fillSelect(selectId, [], { placeholder: "전체", placeholderValue: "-", ...options });
        return;
    }

    const resp = await fetchJson(`/api/address/${addressId}/`);
    const items = normalizeList(resp).map((item) => ({
        id: item.id,
        name: item.name,
    }));
    fillSelect(selectId, items, { placeholder: "전체", placeholderValue: "-", ...options });
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
                return Number(status) === 1 ? "운영" : Number(status) === 0 ? "폐강" : "-"
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
                return Number(status) === 0 ? "미운영" : "운영";
            },
        },
    ];
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
    const csrf = getCsrf();
    const res = await fetch(url, {
        method: "POST",
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

function fillSelect(selectId, items, { placeholder = "전체", placeholderValue = "-" } = {}) {
    const select = $id(selectId);
    if (!select) return;

    select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = placeholderValue;
    defaultOption.textContent = placeholder;
    select.appendChild(defaultOption);

    (items || []).forEach((item) => {
        const option = document.createElement("option");
        option.value = String(item.id);
        option.textContent = String(item.name);
        select.appendChild(option);
    });
}

function setVal(id, value) {
    const el = $id(id);
    if (el) el.value = value ?? "";
}

const $id = (id) => document.getElementById(id);
const getVal = (id) => $id(id)?.value?.trim() ?? "";
const toNumOrNull = (value) => value === "" || value === "-" || value == null ? null : Number(value);
