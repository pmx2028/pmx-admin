import { loadDataTable } from "../common/datatable-handler.js";
import { initSearchAddressCascader } from "../common/search-filters.js";

const PageState = {
    selectedApartId: null,
    selectedApartName: "",
    modalRoleId: null,
    selectedUserId: null,
    selectedUserName: "",
    modifyApartUserId: null,
    modifyRoleId: null,
    modifyApartId: null,
    modifyUserId: null,
    categories: [],
    categoryCodes: [],
    weekdayOptions: [],
    userRoles: [],
};

document.addEventListener("DOMContentLoaded", async () => {
    await initSearchAddressCascader();
    await loadCategoryCodes();
    await loadUserRoles();
    reloadApartTable();
    reloadManagerTable();
    reloadTrainerTable();
    bindSearchEvents();
    bindApartSelection();
    bindModalOpenEvents();
    bindModalEvents();
});

function bindSearchEvents() {
    const searchInput = $id("apart-search-text");
    const searchBtn = $id("btn-apart-search");
    const resetBtn = $id("btn-apart-reset");

    const runSearch = () => {
        PageState.selectedApartId = null;
        PageState.selectedApartName = "";
        reloadApartTable(true);
        reloadManagerTable(true);
        reloadTrainerTable(true);
    };

    searchBtn?.addEventListener("click", runSearch);
    resetBtn?.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        $id("search-target-depth1").value = "-";
        fillSelect("search-target-depth2", [], { placeholder: "전체", placeholderValue: "-" });
        runSearch();
    });
    searchInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            runSearch();
        }
    });
}

function bindApartSelection() {
    $("#apartDataTable tbody").on("click", "tr", function () {
        const table = $("#apartDataTable").DataTable();
        const row = table.row(this).data();
        if (!row?.id) return;

        PageState.selectedApartId = row.id;
        PageState.selectedApartName = row.name ?? "";
        $("#apartDataTable tbody tr").removeClass("is-selected");
        $(this).addClass("is-selected");

        reloadManagerTable(true);
        reloadTrainerTable(true);
    });
}

function bindModalOpenEvents() {
    $id("btn-manager-add")?.addEventListener("click", () => openApartUserModal(getUserRoleId("MANAGER")));
    $id("btn-trainer-add")?.addEventListener("click", () => openApartUserModal(getUserRoleId("TRAINER")));
}

function bindModalEvents() {
    $id("btn-user-search")?.addEventListener("click", () => reloadStaffTable(true));
    $id("btn-user-reset")?.addEventListener("click", () => {
        const input = $id("target-user-text");
        if (input) input.value = "";
        reloadStaffTable(true);
    });
    $id("target-user-text")?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            reloadStaffTable(true);
        }
    });

    $("#staffDataTable").on("click", "tbody tr", function () {
        const table = $("#staffDataTable").DataTable();
        const targetRow = $(this).hasClass("child") ? $(this).prev("tr") : $(this);
        const row = table.row(targetRow).data();
        if (!row?.id) return;

        PageState.selectedUserId = row.id;
        PageState.selectedUserName = row.name ?? "";
        $("#staffDataTable tbody tr").removeClass("is-selected");
        targetRow.addClass("is-selected");
        renderSelectedUser(row);
        setApartUserMessage("");
    });

    $id("categoryId")?.addEventListener("change", () => {
        fillChildCategorySelect();
        toggleLessonOptionRows();
    });
    $id("modify-categoryId")?.addEventListener("change", () => {
        fillModifyChildCategorySelect();
        toggleModifyLessonOptionRows();
    });
    $id("confirmAddApartUser")?.addEventListener("click", handleCreateApartUser);
    $id("confirmModifyApartUser")?.addEventListener("click", handleModifyApartUser);
    $id("apart-usaer-modal")?.addEventListener("hidden.bs.modal", resetApartUserModal);
    $id("apart-user-modify-modal")?.addEventListener("hidden.bs.modal", resetModifyApartUserModal);

    document.addEventListener("click", async (e) => {
        const editBtn = e.target.closest('[data-action="edit-apart-user"]');
        if (editBtn) {
            const apartUserId = editBtn.getAttribute("data-apart-user-id");
            if (apartUserId) await openModifyApartUserModal(apartUserId);
            return;
        }

        const deleteBtn = e.target.closest('[data-action="delete-apart-user"]');
        if (deleteBtn) {
            const apartUserId = deleteBtn.getAttribute("data-apart-user-id");
            if (apartUserId) await deleteApartUser(apartUserId);
        }
    });
}

async function openApartUserModal(roleId) {
    if (!PageState.selectedApartId) {
        alert("먼저 아파트를 선택해 주세요.");
        return;
    }

    PageState.modalRoleId = roleId;
    PageState.selectedUserId = null;
    PageState.selectedUserName = "";

    const label = getUserRoleName(roleId);
    $id("apart-user-modal-title").textContent = `${label} 등록`;
    $id("staff-list-title").textContent = `${label} 목록`;
    setVal("selected-apart-name", PageState.selectedApartName);
    setVal("selected-user-name", "");
    resetApartUserForm();
    toggleRoleInputRows();
    await loadWeekdayOptions();
    fillWeekdaySelect("weekdayCodes");

    await loadCategories();
    fillRootCategorySelect();

    bootstrap.Modal.getOrCreateInstance($id("apart-usaer-modal")).show();
    setTimeout(() => reloadStaffTable(true), 150);
}

function reloadApartTable(resetPage = false) {
    const tableId = "apartDataTable";
    const $table = $(`#${tableId}`);

    if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().ajax.reload(null, resetPage);
        return;
    }

    loadDataTable({
        tableId,
        ajaxUrl: "/api/aparts",
        columns: getApartTableColumns(),
        defaultOrderIndex: null,
        minTableWidth: 520,
        getExtraDataFn: () => {
            const params = {};
            const keyword = $id("apart-search-text")?.value?.trim() ?? "";
            const addressVal = $id("search-target-depth1")?.value ?? "-";
            const address1Val = $id("search-target-depth2")?.value ?? "-";
            if (keyword) params["search_NAME_LIKE"] = keyword;
            if (addressVal && addressVal !== "-") {
                params["search_ADDRESS_ID_IS"] = Number(addressVal);
            }
            if (address1Val && address1Val !== "-") {
                params["search_ADDRESS1_ID_IS"] = Number(address1Val);
            }
            return params;
        },
        enableOrdering: false,
        mobileBreakpoint: 640,
        enableCardView: true,
        enableResponsive: false,
        titleColumnName: "아파트명",
        extraOptions: { dom: "rtip" },
    });
}

function reloadManagerTable(resetPage = false) {
    reloadApartUserTable({
        tableId: "managerDataTable",
        roleId: getUserRoleId("MANAGER"),
        resetPage,
    });
}

function reloadTrainerTable(resetPage = false) {
    reloadApartUserTable({
        tableId: "trainerDataTable",
        roleId: getUserRoleId("TRAINER"),
        resetPage,
    });
}

function reloadApartUserTable({ tableId, roleId, resetPage = false }) {
    const $table = $(`#${tableId}`);

    if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().ajax.reload(null, resetPage);
        return;
    }

    loadDataTable({
        tableId,
        ajaxUrl: "/api/apart-user",
        columns: getApartUserTableColumns(),
        defaultOrderIndex: null,
        minTableWidth: 760,
        getExtraDataFn: () => ({
            search_APART_ID_IS: PageState.selectedApartId ?? -1,
            search_ROLE_ID_IS: roleId,
            //search_ACTIVATED_IS: 1,
        }),
        enableOrdering: false,
        mobileBreakpoint: 640,
        enableCardView: true,
        enableResponsive: false,
        titleColumnName: "이름",
        extraOptions: { dom: "rtip" },
    });
}

function reloadStaffTable(resetPage = false) {
    const tableId = "staffDataTable";
    const $table = $(`#${tableId}`);

    if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().ajax.reload(null, resetPage);
        return;
    }

    loadDataTable({
        tableId,
        ajaxUrl: "/api/users",
        columns: getStaffTableColumns(),
        defaultOrderIndex: null,
        minTableWidth: 620,
        getExtraDataFn: () => {
            const params = {
                search_ROLE_ID_IS: PageState.modalRoleId,
                search_ACTIVATED_IS: 1,
            };
            const keyword = $id("target-user-text")?.value?.trim() ?? "";
            if (keyword) params["search_NAME_LIKE"] = keyword;
            return params;
        },
        enableOrdering: false,
        mobileBreakpoint: 640,
        enableCardView: true,
        enableResponsive: false,
        titleColumnName: "이름",
        extraOptions: { dom: "rtip" },
    });
}

async function loadCategories() {
    if (PageState.categories.length > 0) return;
    const resp = await fetchJson("/api/categories/tree");
    const data = resp?.data ?? [];
    PageState.categories = Array.isArray(data) ? data : [];
}

async function loadCategoryCodes() {
    if (PageState.categoryCodes.length > 0) return;
    const resp = await fetchJson("/api/code/category-codes");
    const data = resp?.data ?? [];
    PageState.categoryCodes = Array.isArray(data) ? data : [];
}

async function loadWeekdayOptions() {
    if (PageState.weekdayOptions.length > 0) return;
    const resp = await fetchJson("/api/code/weekday-codes");
    const data = resp?.data ?? [];
    PageState.weekdayOptions = Array.isArray(data) ? data : [];
}

async function loadUserRoles() {
    if (PageState.userRoles.length > 0) return;
    const resp = await fetchJson("/api/code/user-roles");
    const data = resp?.data ?? [];
    PageState.userRoles = Array.isArray(data) ? data : [];
}

function fillRootCategorySelect() {
    const roots = PageState.categories.filter((item) => item.parentId == null);
    fillSelect("categoryId", roots, { placeholder: "대분류 선택", placeholderValue: "-" });
    fillChildCategorySelect();
    toggleLessonOptionRows();
}

function fillChildCategorySelect() {
    const parentId = toNumOrNull(getVal("categoryId"));
    const children = parentId == null
        ? []
        : PageState.categories.filter((item) => Number(item.parentId) === Number(parentId));

    fillSelect("categoryId1", children, { placeholder: "세부강습명 선택", placeholderValue: "-" });
}

function fillModifyRootCategorySelect() {
    const roots = PageState.categories.filter((item) => item.parentId == null);
    fillSelect("modify-categoryId", roots, { placeholder: "대분류 선택", placeholderValue: "-" });
    fillModifyChildCategorySelect();
    toggleModifyLessonOptionRows();
}

function fillModifyChildCategorySelect() {
    const parentId = toNumOrNull(getVal("modify-categoryId"));
    const children = parentId == null
        ? []
        : PageState.categories.filter((item) => Number(item.parentId) === Number(parentId));

    fillSelect("modify-categoryId1", children, { placeholder: "세부강습명 선택", placeholderValue: "-" });
}

function getCategoryCodeValue(codeName) {
    const categoryCode = PageState.categoryCodes.find((item) => item.code === codeName);
    return categoryCode == null ? null : Number(categoryCode.id);
}

function isCategoryRoot(categoryId, codeNames) {
    const rootId = toNumOrNull(getVal(categoryId));
    return codeNames
        .map(getCategoryCodeValue)
        .filter((value) => value != null)
        .includes(rootId);
}

function shouldShowFullLessonOptions(categoryId) {
    return isCategoryRoot(categoryId, ["GX", "TUNI"]);
}

function shouldShowLessonCount(categoryId) {
    return isCategoryRoot(categoryId, ["GX", "TUNI", "HEALTH", "GOLF"]);
}

function toggleLessonOptionRows() {
    if (isManagerModal()) {
        document.querySelectorAll(".lesson-option-row").forEach((row) => row.classList.add("d-none"));
        return;
    }

    const showFullOptions = shouldShowFullLessonOptions("categoryId");
    const showLessonCount = shouldShowLessonCount("categoryId");

    document.querySelectorAll(".lesson-option-row").forEach((row) => {
        row.classList.toggle("d-none", !showFullOptions);
    });

    $id("lessonCnt")?.closest(".lesson-option-row")?.classList.toggle("d-none", !showLessonCount);

    if (!showLessonCount) {
        setVal("lessonCnt", "");
    }

    if (!showFullOptions) {
        ["capacity", "minCapacity"].forEach((id) => setVal(id, ""));
        setMultiSelectValues("weekdayCodes", []);
    }
}

function toggleModifyLessonOptionRows() {
    if (isModifyManagerModal()) {
        document.querySelectorAll(".modify-lesson-option-row").forEach((row) => row.classList.add("d-none"));
        return;
    }

    const showFullOptions = shouldShowFullLessonOptions("modify-categoryId");
    const showLessonCount = shouldShowLessonCount("modify-categoryId");

    document.querySelectorAll(".modify-lesson-option-row").forEach((row) => {
        row.classList.toggle("d-none", !showFullOptions);
    });

    $id("modify-lessonCnt")?.closest(".modify-lesson-option-row")?.classList.toggle("d-none", !showLessonCount);

    if (!showLessonCount) {
        setVal("modify-lessonCnt", "");
    }

    if (!showFullOptions) {
        ["modify-capacity", "modify-minCapacity"].forEach((id) => setVal(id, ""));
        setMultiSelectValues("modify-weekdayCodes", []);
    }
}

async function handleCreateApartUser(e) {
    e.preventDefault();

    try {
        const payload = buildApartUserPayload();
        const duplicated = await checkApartUserDuplicate(payload);
        if (duplicated) {
            setApartUserMessage("이미 등록된 사용자입니다.", "invalid");
            return;
        }

        await postCreateApartUser(payload);
        alert("등록되었습니다.");
        bootstrap.Modal.getOrCreateInstance($id("apart-usaer-modal")).hide();
        reloadManagerTable(true);
        reloadTrainerTable(true);
    } catch (err) {
        console.error(err);
        setApartUserMessage(err.message || "등록 중 오류가 발생했습니다.", "invalid");
    }
}

async function handleModifyApartUser(e) {
    e.preventDefault();

    try {
        const payload = buildModifyApartUserPayload();
        const duplicated = await checkApartUserDuplicate(payload, PageState.modifyApartUserId);
        if (duplicated) {
            setApartUserModifyMessage("이미 등록된 사용자입니다.", "invalid");
            return;
        }

        await putUpdateApartUser(PageState.modifyApartUserId, payload);
        alert("저장되었습니다.");
        bootstrap.Modal.getOrCreateInstance($id("apart-user-modify-modal")).hide();
        reloadManagerTable(true);
        reloadTrainerTable(true);
    } catch (err) {
        console.error(err);
        setApartUserModifyMessage(err.message || "수정 중 오류가 발생했습니다.", "invalid");
    }
}

function buildApartUserPayload() {
    const categoryId = isManagerModal() ? null : toNumOrNull(getVal("categoryId"));
    const categoryId1 = isManagerModal() ? null : toNumOrNull(getVal("categoryId1"));

    if (!PageState.selectedApartId) throw new Error("아파트를 선택해 주세요.");
    if (!PageState.selectedUserId) throw new Error("등록할 사용자를 선택해 주세요.");
    if (!isManagerModal() && categoryId == null) throw new Error("대분류를 선택해 주세요.");
    if (!isManagerModal() && categoryId1 == null) throw new Error("세부강습명을 선택해 주세요.");
    validateApartUserRequiredFields({
        managerMode: isManagerModal(),
        categorySelectId: "categoryId",
        commission: toNumOrNull(getVal("commission")),
        lessonPrice: toNumOrNull(getVal("lessonPrice")),
        lessonCnt: toNumOrNull(getVal("lessonCnt")),
        weekdayCodes: getSelectedWeekdayCodes("weekdayCodes"),
        capacity: toNumOrNull(getVal("capacity")),
        minCapacity: toNumOrNull(getVal("minCapacity")),
    });

    return {
        apartId: Number(PageState.selectedApartId),
        userId: Number(PageState.selectedUserId),
        roleId: Number(PageState.modalRoleId),
        categoryId,
        categoryId1,
        commission: toNumOrNull(getVal("commission")),
        lessonPrice: isManagerModal() ? null : toNumOrNull(getVal("lessonPrice")),
        lessonCnt: isManagerModal() ? null : toNumOrNull(getVal("lessonCnt")),
        weekdayCodes: isManagerModal() ? null : getSelectedWeekdayCodes("weekdayCodes"),
        capacity: isManagerModal() ? null : toNumOrNull(getVal("capacity")),
        minCapacity: isManagerModal() ? null : toNumOrNull(getVal("minCapacity")),
        activated: toNumOrNull(getVal("modalUsageSelect")) ?? 1,
    };
}

function buildModifyApartUserPayload() {
    const categoryId = isModifyManagerModal() ? null : toNumOrNull(getVal("modify-categoryId"));
    const categoryId1 = isModifyManagerModal() ? null : toNumOrNull(getVal("modify-categoryId1"));

    if (!PageState.modifyApartUserId) throw new Error("수정 대상을 찾을 수 없습니다.");
    if (!PageState.modifyApartId) throw new Error("아파트 정보를 찾을 수 없습니다.");
    if (!PageState.modifyUserId) throw new Error("사용자 정보를 찾을 수 없습니다.");
    if (!isModifyManagerModal() && categoryId == null) throw new Error("대분류를 선택해 주세요.");
    if (!isModifyManagerModal() && categoryId1 == null) throw new Error("세부강습명을 선택해 주세요.");
    validateApartUserRequiredFields({
        managerMode: isModifyManagerModal(),
        categorySelectId: "modify-categoryId",
        commission: toNumOrNull(getVal("modify-commission")),
        lessonPrice: toNumOrNull(getVal("modify-lessonPrice")),
        lessonCnt: toNumOrNull(getVal("modify-lessonCnt")),
        weekdayCodes: getSelectedWeekdayCodes("modify-weekdayCodes"),
        capacity: toNumOrNull(getVal("modify-capacity")),
        minCapacity: toNumOrNull(getVal("modify-minCapacity")),
    });

    return {
        apartId: Number(PageState.modifyApartId),
        userId: Number(PageState.modifyUserId),
        roleId: Number(PageState.modifyRoleId),
        categoryId,
        categoryId1,
        commission: toNumOrNull(getVal("modify-commission")),
        lessonPrice: isModifyManagerModal() ? null : toNumOrNull(getVal("modify-lessonPrice")),
        lessonCnt: isModifyManagerModal() ? null : toNumOrNull(getVal("modify-lessonCnt")),
        weekdayCodes: isModifyManagerModal() ? null : getSelectedWeekdayCodes("modify-weekdayCodes"),
        capacity: isModifyManagerModal() ? null : toNumOrNull(getVal("modify-capacity")),
        minCapacity: isModifyManagerModal() ? null : toNumOrNull(getVal("modify-minCapacity")),
        activated: toNumOrNull(getVal("modify-modalUsageSelect")) ?? 1,
    };
}

function validateApartUserRequiredFields({ managerMode, categorySelectId, commission, lessonPrice, lessonCnt, weekdayCodes, capacity, minCapacity }) {
    if (commission == null) {
        throw new Error("수수료를 입력해 주세요.");
    }

    if (managerMode) {
        return;
    }

    if (lessonPrice == null) {
        throw new Error("강습요금을 입력해 주세요.");
    }

    if (shouldShowLessonCount(categorySelectId) && lessonCnt == null) {
        throw new Error("강습횟수를 입력해 주세요.");
    }

    if (!shouldShowFullLessonOptions(categorySelectId)) {
        return;
    }

    if (!weekdayCodes) {
        throw new Error("요일을 선택해 주세요.");
    }
    if (capacity == null) {
        throw new Error("강습인원을 입력해 주세요.");
    }
    if (minCapacity == null) {
        throw new Error("강습최소 인원을 입력해 주세요.");
    }
}

async function postCreateApartUser(payload) {
    const res = await postWithCsrf("/api/apart-user", payload);
    const resJson = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(resJson?.message || resJson?.data?.message || `등록 실패 (code: ${res.status})`);
    }
    return resJson?.data;
}

async function putUpdateApartUser(apartUserId, payload) {
    const res = await putWithCsrf(`/api/apart-user/${apartUserId}`, payload);
    const resJson = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(resJson?.message || resJson?.data?.message || `수정 실패 (code: ${res.status})`);
    }
    return resJson?.data;
}

async function checkApartUserDuplicate(payload, excludeId = null) {
    const params = new URLSearchParams({
        apartId: String(payload.apartId),
        userId: String(payload.userId),
    });
    if (payload.categoryId1 != null) {
        params.set("categoryId1", String(payload.categoryId1));
    }
    if (excludeId != null) {
        params.set("excludeId", String(excludeId));
    }

    const resp = await fetchJson(`/api/apart-user/duplicate?${params.toString()}`);
    return Boolean(resp?.data?.duplicated);
}

async function openModifyApartUserModal(apartUserId) {
    await loadCategories();
    await loadWeekdayOptions();
    resetModifyApartUserModal();

    const resp = await fetchJson(`/api/apart-user/${apartUserId}`);
    const data = resp?.data ?? {};

    PageState.modifyApartUserId = data.id;
    PageState.modifyRoleId = data.roleId;
    PageState.modifyApartId = data.apartId;
    PageState.modifyUserId = data.userId;

    const label = getUserRoleName(PageState.modifyRoleId);
    setText("apart-user-modify-modal-title", `${label} 등록 정보 수정`);
    setVal("modify-selected-apart-name", data.apartName ?? "");
    setVal("modify-selected-user-name", formatUserLabel(data));
    setText("modify-selected-user-summary", [data.roleName, data.mobile, data.email].filter(Boolean).join(" / "));
    setVal("modify-modalUsageSelect", data.activated ?? 1);

    fillWeekdaySelect("modify-weekdayCodes");
    toggleModifyRoleInputRows();
    fillModifyRootCategorySelect();
    setModifyCategory(data.categoryId, data.categoryId1);
    toggleModifyLessonOptionRows();
    setVal("modify-commission", data.commission);
    setVal("modify-lessonPrice", data.lessonPrice);
    setVal("modify-lessonCnt", data.lessonCnt);
    setVal("modify-capacity", data.capacity);
    setVal("modify-minCapacity", data.minCapacity);
    setMultiSelectValues("modify-weekdayCodes", parseWeekdayCodes(data.weekdayCodes));

    bootstrap.Modal.getOrCreateInstance($id("apart-user-modify-modal")).show();
}

function setModifyCategory(categoryId, categoryId1) {
    if (categoryId != null) {
        setVal("modify-categoryId", categoryId);
        fillModifyChildCategorySelect();
        setVal("modify-categoryId1", categoryId1 ?? "-");
        return;
    }

    const selected = PageState.categories.find((item) => Number(item.id) === Number(categoryId1));
    if (!selected) {
        setVal("modify-categoryId", "-");
        fillModifyChildCategorySelect();
        return;
    }

    if (selected.parentId == null) {
        setVal("modify-categoryId", selected.id);
        fillModifyChildCategorySelect();
        setVal("modify-categoryId1", "-");
        return;
    }

    setVal("modify-categoryId", selected.parentId);
    fillModifyChildCategorySelect();
    setVal("modify-categoryId1", selected.id);
}

async function deleteApartUser(apartUserId) {
    if (!confirm("삭제 처리하시겠습니까?")) return;

    try {
        const res = await putWithCsrf(`/api/apart-user/${apartUserId}/resign`, "");
        const resJson = await res.json().catch(() => null);
        if (!res.ok) {
            throw new Error(resJson?.message || resJson?.data?.message || `삭제 실패 (code: ${res.status})`);
        }
        alert("삭제 처리되었습니다.");
        reloadManagerTable(true);
        reloadTrainerTable(true);
    } catch (err) {
        console.error(err);
        alert(err.message || "삭제 처리 중 오류가 발생했습니다.");
    }
}

function resetApartUserModal() {
    PageState.selectedUserId = null;
    PageState.selectedUserName = "";
    $("#staffDataTable tbody tr").removeClass("is-selected");
    resetApartUserForm();
}

function resetModifyApartUserModal() {
    PageState.modifyApartUserId = null;
    PageState.modifyRoleId = getUserRoleId("MANAGER");
    PageState.modifyApartId = null;
    PageState.modifyUserId = null;
    [
        "modify-selected-apart-name",
        "modify-selected-user-name",
        "modify-categoryId",
        "modify-categoryId1",
        "modify-commission",
        "modify-lessonPrice",
        "modify-lessonCnt",
        "modify-weekdayCodes",
        "modify-capacity",
        "modify-minCapacity",
    ].forEach((id) => setVal(id, ""));
    setVal("modify-modalUsageSelect", "1");
    setText("modify-selected-user-summary", "");
    setApartUserModifyMessage("");
}

function resetApartUserForm() {
    ["selected-user-name", "categoryId", "categoryId1", "commission", "lessonPrice", "lessonCnt", "capacity", "minCapacity"].forEach((id) => setVal(id, ""));
    setMultiSelectValues("weekdayCodes", []);
    const summary = $id("selected-user-summary");
    if (summary) summary.textContent = "사용자를 선택해 주세요.";
    setApartUserMessage("");
    setVal("modalUsageSelect", "1");
    toggleLessonOptionRows();
}

function toggleRoleInputRows() {
    const managerMode = isManagerModal();
    document.querySelectorAll(".trainer-only-row").forEach((row) => {
        row.classList.toggle("d-none", managerMode);
    });

    if (managerMode) {
        ["categoryId", "categoryId1", "lessonPrice", "lessonCnt", "capacity", "minCapacity"].forEach((id) => setVal(id, ""));
        setMultiSelectValues("weekdayCodes", []);
    }
}

function isManagerModal() {
    return Number(PageState.modalRoleId) === Number(getUserRoleId("MANAGER"));
}

function isModifyManagerModal() {
    return Number(PageState.modifyRoleId) === Number(getUserRoleId("MANAGER"));
}

function getUserRoleId(code) {
    return PageState.userRoles.find((role) => role.code === code)?.id ?? null;
}

function getUserRoleName(roleId) {
    return PageState.userRoles.find((role) => Number(role.id) === Number(roleId))?.name ?? "";
}

function toggleModifyRoleInputRows() {
    const managerMode = isModifyManagerModal();
    document.querySelectorAll(".modify-trainer-only-row").forEach((row) => {
        row.classList.toggle("d-none", managerMode);
    });

    if (managerMode) {
        ["modify-categoryId", "modify-categoryId1", "modify-lessonPrice", "modify-lessonCnt", "modify-capacity", "modify-minCapacity"].forEach((id) => setVal(id, ""));
        setMultiSelectValues("modify-weekdayCodes", []);
    }
}

function renderSelectedUser(row) {
    setVal("selected-user-name", formatUserLabel(row));

    const summary = $id("selected-user-summary");
    if (summary) {
        const parts = [
            row.roleName,
            row.mobile,
            row.email,
        ].filter(Boolean);
        summary.textContent = parts.length > 0 ? parts.join(" / ") : "선택된 사용자입니다.";
    }
}

function formatUserLabel(row) {
    return [
        row.userName ?? row.name,
        row.userLogin ?? row.login ? `(${row.userLogin ?? row.login})` : "",
    ].filter(Boolean).join(" ");
}

function setApartUserMessage(message = "", type = "") {
    const el = $id("apart-user-message");
    if (!el) return;

    el.textContent = message;
    el.classList.toggle("text-danger", type === "invalid");
    el.classList.toggle("text-success", type === "valid");
}

function setApartUserModifyMessage(message = "", type = "") {
    const el = $id("apart-user-modify-message");
    if (!el) return;

    el.textContent = message;
    el.classList.toggle("text-danger", type === "invalid");
    el.classList.toggle("text-success", type === "valid");
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

function getCsrf() {
    const token = document.querySelector('meta[name="_csrf"]')?.getAttribute("content");
    const header = document.querySelector('meta[name="_csrf_header"]')?.getAttribute("content") || "X-CSRF-TOKEN";
    return token ? { header, token } : null;
}

function fillSelect(selectId, items, { placeholder = "전체", placeholderValue = "-" } = {}) {
    const sel = $id(selectId);
    if (!sel) return;
    sel.innerHTML = "";

    const opt0 = document.createElement("option");
    opt0.value = placeholderValue;
    opt0.textContent = placeholder;
    sel.appendChild(opt0);

    (items || []).forEach((item) => {
        const opt = document.createElement("option");
        opt.value = String(item.id);
        opt.textContent = String(item.name);
        sel.appendChild(opt);
    });
}

function fillWeekdaySelect(selectId) {
    const container = $id(selectId);
    if (!container) return;
    if (container.querySelectorAll('input[type="checkbox"]').length === PageState.weekdayOptions.length) return;

    container.innerHTML = "";
    PageState.weekdayOptions.forEach((item) => {
        const wrapper = document.createElement("div");
        wrapper.className = "form-check form-check-inline mb-1";

        const input = document.createElement("input");
        input.className = "form-check-input";
        input.type = "checkbox";
        input.id = `${selectId}-${item.id}`;
        input.value = String(item.id);

        const label = document.createElement("label");
        label.className = "form-check-label";
        label.htmlFor = input.id;
        label.textContent = item.name;

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    });
}

function getSelectedWeekdayCodes(selectId) {
    const container = $id(selectId);
    if (!container) return null;
    const values = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
        .map((input) => input.value);
    return values.length > 0 ? values.join(",") : null;
}

function setMultiSelectValues(selectId, values = []) {
    const container = $id(selectId);
    if (!container) return;
    const valueSet = new Set((values || []).map(String));
    Array.from(container.querySelectorAll('input[type="checkbox"]')).forEach((input) => {
        input.checked = valueSet.has(input.value);
    });
}

function parseWeekdayCodes(value) {
    if (!value) return [];
    return String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

const toNumOrNull = (v) => (v === "" || v === "-" || v == null ? null : Number(v));
const getVal = (id) => $id(id)?.value?.trim() ?? "";
const getSelectedText = (id) => $id(id)?.selectedOptions?.[0]?.textContent?.trim() ?? "";

function setVal(id, value) {
    const el = $id(id);
    if (el) el.value = value ?? "";
}

function setText(id, value) {
    const el = $id(id);
    if (el) el.textContent = value ?? "";
}

function getApartTableColumns() {
    return [
        {
            data: null,
            title: "#",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (data, type, row, meta) => {
                const start = meta?.settings?._iDisplayStart ?? 0;
                return start + meta.row + 1;
            },
        },
        {
            data: "addressName",
            title: "행정구역",
            className: "data-txt",
            orderable: false,
            width: "20%",
            render: (data) => data ?? "-",
        },
        {
            data: "addressName1",
            title: "시/군/구",
            className: "data-txt",
            orderable: false,
            width: "20%",
            render: (data) => data ?? "-",
        },
        {
            data: "name",
            title: "아파트명",
            className: "data-txt text-start",
            orderable: false,
            width: "34%",
            render: (data) => data ?? "-",
        },
        {
            data: "activated",
            title: "상태",
            className: "data-txt",
            orderable: false,
            width: "16%",
            render: (data) => Number(data) === 1 ? "운영" : "미운영",
        },
    ];
}

function getApartUserTableColumns() {
    return [
        rowNumberColumn("8%"),
        textColumn("userName", "이름", "14%"),
        {
            data: null,
            title: "카테고리",
            className: "data-txt",
            orderable: false,
            width: "14%",
            render: (data, type, row) => {
                return [row.categoryName, row.categoryName1].filter(Boolean).join(" / ") || "-";
            },
        },
        textColumn("mobile", "휴대폰", "15%"),
        textColumn("commission", "수수료", "10%"),
        textColumn("lessonPrice", "금액", "10%"),
        textColumn("lessonCnt", "횟수", "8%"),
        textColumn("weekdayNames", "요일", "10%"),
        {
            data: "btnActions",
            title: "작업",
            className: "bt-box",
            orderable: false,
            width: "11%",
            render: (data, type, row) => {
                if (!Array.isArray(row.btnActions) || row.btnActions.length === 0) return "-";

                const buttons = [];
                if (row.btnActions.includes("EDIT")) {
                    buttons.push(`
                        <button type="button" class="btn btn-outline-secondary"
                            data-action="edit-apart-user" data-apart-user-id="${row.id}">
                            수정
                        </button>
                    `);
                }
                if (row.btnActions.includes("DELETE")) {
                    buttons.push(`
                        <button type="button" class="btn btn-danger"
                            data-action="delete-apart-user" data-apart-user-id="${row.id}">
                            삭제
                        </button>
                    `);
                }
                return buttons.join(" ");
            },
        },
    ];
}

function getStaffTableColumns() {
    return [
        rowNumberColumn("8%"),
        textColumn("login", "ID", "18%"),
        textColumn("name", "이름", "18%"),
        textColumn("roleName", "역할", "18%"),
        textColumn("mobile", "휴대폰", "18%"),
        textColumn("email", "이메일", "20%"),
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
