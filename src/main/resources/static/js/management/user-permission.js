import {loadDataTable} from "../common/datatable-handler.js";

/* ================= 선택 상태 저장 유틸 ================= */
function setLastSelectedInModal(
    { id = "", name = "", occupationName = "", positionName = "", departmentName = "", unitName = "" }
) {
    const label = document.getElementById("selectedUserLabel");
    if (!label) return;

    if (name) {
        label.textContent = `선택된 사용자: ${name}`;
        Object.assign(label.dataset, {
            id,
            name,
            occupationName,
            positionName,
            departmentName,
            unitName,
        });
    } else {
        label.textContent = "선택된 사용자: 없음";
        Object.keys(label.dataset).forEach((k) => (label.dataset[k] = ""));
    }
}

const $id = (id) => document.getElementById(id);

let allPermissions = [];
let selectedUserId = null;
let selectedUserName = null;
let currentRoleFetchAborter = null;
let originalGrantedIds = []; // 서버에서 받은 초기 권한 상태

const userListContainer = document.querySelector(".user-list");
const userNameTarget = document.getElementById("selected-user-name");
const actionPermissionList = document.querySelector(".action-permission-list");
const pagePermissionList = document.querySelector(".page-permission-list");
const saveButton = document.querySelector(".data-save");
const resetButton = document.querySelector(".data-reset");
const deleteButton = document.getElementById("removeActiveBtn");

// 권한 API 뷰 상태 저장용
let currentUserViewMap = new Map();   // permissionId -> { defaultAllow, userOverride, effective }
let originalOverrides = new Map();    // permissionId -> "ALLOW" | "DENY"
let originalEffectiveIds = [];        // 최초 effective 체크박스 집합(비교용)

/* =============== 페이지 엔트리 =============== */
document.addEventListener("DOMContentLoaded", async () => {
    // Reset 버튼 초기 비활성화
    resetButton.disabled = true;

    // === 초기 로드 ===
    loadAllPermissions();

    fetch("/api/user-permission/users")
        .then((res) => res.json())
        .then((payload) => renderUserList(payload.data || []))
        .catch(console.error);

    // user-list에 이벤트 위임: 이후에 append된 버튼도 자동으로 동작
    userListContainer.addEventListener("click", (e) => {
        const btn = e.target.closest('.list-group-item[data-user-id][data-user-name]');
        if (!btn || !userListContainer.contains(btn)) return;
        handleUserClick(btn);
    });

    // 저장 버튼 클릭
    saveButton?.addEventListener("click", async () => {
        if (!selectedUserId) {
            alert("먼저 사용자를 선택하세요.");
            return;
        }

        const overrides = computeOverridesFromUI();
        // console.log(overrides);

        try {

            const res = await putWithCsrf(`/api/user-permission/${selectedUserId}/permissions`, overrides);
            const result = await res.json();

            if (result.success) {
                alert("권한이 저장되었습니다.");
                // 서버 상태 재조회하여 스냅샷 갱신
                await loadRolePermissions(selectedUserId);
                resetButton.disabled = true;
            } else {
                alert("저장 실패: " + (result.message || "서버 오류"));
                await loadRolePermissions(selectedUserId);
            }
        } catch (err) {
            console.error(err);
            alert("저장 중 오류가 발생했습니다.");
        }
    });

    // 되돌리기 버튼 클릭
    resetButton?.addEventListener("click", async () => {
        if (!selectedUserId) return;
        await loadRolePermissions(selectedUserId);
        resetButton.disabled = true; // ✅ 되돌린 후 다시 비활성화
    });


    // 선택삭제 버튼 클릭
    deleteButton?.addEventListener("click", async () => {
        if (!selectedUserId) {
            alert("조직 목록에서 항목을 선택해 주세요.");
            return;
        }

        if (!confirm(`선택한 사용자(${selectedUserName})를 권한부여 목록에서 제거합니다.`)) return;

        try {
            const res = await deleteWithCsrf(`/api/user-permission/${selectedUserId}/permissions`);
            const result = await res.json();

            if (result.success) {
                alert("삭제 완료되었습니다.");
                location.reload();
            } else {
                alert("삭제 실패: " + (result.message || "서버 오류"));
            }
        } catch (err) {
            console.error(err);
            alert("삭제 중 오류가 발생했습니다.");
        }

    });

    // ================================  modal 관련 이벤트 ====================================
    const modalEl = document.getElementById("userPermissionModal");
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl, {backdrop: "static"});
    const openBtn = document.getElementById("orgAddBtn");
    if (openBtn) openBtn.addEventListener("click", () => modal.show());

    // 모달이 화면에 뜰 때: 1) 이벤트 바인딩(1회)
    modalEl.addEventListener("shown.bs.modal", async () => {
        await bindAddUserModal(modalEl);
    });

    // 모달 닫힐 때 초기화
    modalEl.addEventListener("hidden.bs.modal", () => {
        resetAddUserModalState(modalEl);
    });
});


async function bindAddUserModal(modalEl) {
    const table = modalEl.querySelector("#staffDataTable");
    if (!table) return;

    const tableId = "staffDataTable";
    resetAddUserModalState(modalEl);

    // 검색/초기화
    const searchBtn = $id("btn-search");
    const resetBtn = $id("btn-reset");
    const nameInput = $id("search-text");
    if (searchBtn && !searchBtn.dataset.bound) {
        searchBtn.addEventListener("click", () => {
            clearStaffTableSelection(modalEl);
            reloadStaffTable(tableId, modalEl, { resetToFirstPage: true });
        });
        searchBtn.dataset.bound = "true";
    }
    if (resetBtn && !resetBtn.dataset.bound) {
        resetBtn.addEventListener("click", () => {
            $id("search-text").value = "";
            clearStaffTableSelection(modalEl);
            reloadStaffTable(tableId, modalEl, { resetToFirstPage: true });
        });
        resetBtn.dataset.bound = "true";
    }
    // Enter 키로 검색 실행
    if (nameInput && !nameInput.dataset.bound) {
        nameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                clearStaffTableSelection(modalEl);
                reloadStaffTable(tableId, modalEl, { resetToFirstPage: true });
            }
        });
        nameInput.dataset.bound = "true";
    }

    // 추가버튼 클릭 이벤트
    const addBtn = modalEl.querySelector("#addUserBtn");
    if (addBtn && !addBtn.dataset.bound) {
        addBtn.addEventListener("click", onAddUserClick);
        addBtn.dataset.bound = "true"; // ← 한번만 바인딩
    }

    userTableListClickInModal(modalEl);
    reloadStaffTable(tableId, modalEl, { resetToFirstPage: true });
}

function resetAddUserModalState(modalEl) {
    const searchInput = modalEl.querySelector("#search-text");
    if (searchInput) searchInput.value = "";

    clearStaffTableSelection(modalEl);
}

function clearStaffTableSelection(modalEl) {
    modalEl.querySelectorAll("#staffDataTable tr.table-active")
        .forEach((row) => row.classList.remove("table-active"));

    setLastSelectedInModal({
        id: "", name: "", occupationName: "", positionName: "", departmentName:"", unitName:""});
}

function userTableListClickInModal(modalEl) {
    // 테이블 리스트 클릭 이벤트
    const table = modalEl.querySelector("#staffDataTable");
    if (!table || table.dataset.bound) return;

    table.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        if (!tr) return;

        // console.log(tr);
        const nameCell = tr.querySelector("td[data-user-id]");
        if (!nameCell) return;
        const { userId, userName, occupationName, positionName, departmentName, unitName } = nameCell.dataset;
        // console.log(userId, userName, occupationName, positionName, departmentName, unitName);

        table.querySelectorAll("tr.table-active").forEach(r => r.classList.remove("table-active"));
        tr.classList.add("table-active");

        // 선택결과 표시
        setLastSelectedInModal({
            id:userId,
            name:userName,
            occupationName:occupationName,
            positionName:positionName,
            departmentName:departmentName,
            unitName:unitName}
        );
    });
    table.dataset.bound = "true";
}


function onAddUserClick(e) {
    const modalEl = document.getElementById("userPermissionModal");
    const label = modalEl.querySelector("#selectedUserLabel");
    const userId = label?.dataset.id || "";
    const userName = label?.dataset.name || "";
    const occupationName = label?.dataset.occupationName || "";
    const positionName = label?.dataset.positionName || "";
    const departmentName = label?.dataset.departmentName || "";
    const unitName = label?.dataset.unitName || "";

    if (!userId || !userName || userName === "없음") {
        alert("사용자를 선택해 주세요.");
        return;
    }

    const list = document.querySelector(".user-list");
    if (!list) return;

    // 빈 목록 안내가 있으면 제거
    list.querySelector(".notice-user-empty")?.remove();

    const dup = list.querySelector(`.list-group-item[data-user-id="${userId}"]`);
    if (dup) {
        dup.click();
        bootstrap.Modal.getInstance(modalEl)?.hide();
        return;
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
    btn.dataset.userId = String(userId);
    btn.dataset.userName = userName;
    btn.innerHTML = `
        <div>
            <strong>${userName}</strong><br>
            <small class="d-flex flex-wrap gap-2 align-items-center">
                <span>직군: ${occupationName}</span>
                <span>직책: ${positionName}</span>
                <span>소속 부서: ${departmentName}</span>
                <span>소속 팀: ${unitName}</span>
            </small>
        </div>
        <i class="ri-arrow-right-s-line"></i>
      `;

    list.append(btn);
    btn.click();

    setLastSelectedInModal({
        id: "", name: "", occupationName: "", positionName: "", departmentName:"", unitName:""});
    bootstrap.Modal.getInstance(modalEl)?.hide();
}

async function loadRolePermissions(userId) {
    const res = await fetch(`/api/user-permission/${userId}/permissions`);
    const payload = await res.json();
    const list = payload?.data?.permissions ?? [];

    // Map 갱신
    currentUserViewMap = new Map(
        list.map(v => [Number(v.permissionId), {
            defaultAllow: !!v.defaultAllow,
            orgAllow: !!v.orgAllow,
            userOverride: v.userEffect ?? null,   // "ALLOW" | "DENY" | null
            effective: !!v.effective
        }])
    );

    // 원본 스냅샷 저장 (되돌리기/변경감지)
    originalOverrides = new Map(
        list.filter(v => v.userEffect != null)
            .map(v => [Number(v.permissionId), String(v.userEffect)])
    );
    originalEffectiveIds = list.filter(v => v.effective).map(v => Number(v.permissionId));
    resetButton.disabled = true;

    // 렌더
    renderPermissionLists(allPermissions, currentUserViewMap);
}


// =========================
// 전체 권한 목록 불러오기
// =========================
async function loadAllPermissions() {
    const res = await fetch("/api/permissions");
    const payload = await res.json();
    allPermissions = payload.data || [];
    renderPermissionLists(allPermissions, currentUserViewMap); // 빈 Map 사용
}

// =========================
// 권한 리스트 렌더링
// =========================
function renderPermissionLists(permissions, userViewMap) {
    const articlePermissions = permissions.filter((p) => p.type === "ACTION");
    const pagePermissions = permissions.filter((p) => p.type === "PAGE");

    const renderList = (list, container) => {
        container.innerHTML = list.length
            ? list
                .map(
                    (p) => {
                        const view = userViewMap.get(p.id) ?? { defaultAllow:false, orgAllow:false, userOverride:null, effective:false };
                        const isDefault = view.defaultAllow && view.userOverride == null;
                        const isDefaultDenied = view.defaultAllow && view.userOverride === "DENY";
                        const isOrgAdd = view.orgAllow && !view.defaultAllow && view.userOverride == null;
                        const isOrgDenied = view.orgAllow && view.userOverride === "DENY";

                        const badges = [
                            isDefault ? `<small class="text-muted ms-1">(기본 권한)</small>` : "",
                            isDefaultDenied ? `<small class="text-muted ms-1">(기본 권한 차단)</small>` : "",
                            isOrgAdd ? `<small class="text-muted ms-1">(조직 권한)</small>` : "",
                            isOrgDenied ? `<small class="text-muted ms-1">(조직 권한 차단)</small>` : ""
                        ].join("");

                        return `
                            <label class="list-group-item justify-content-between align-items-center">
                                <input class="form-check-input me-1" type="checkbox"
                                    data-permission-id="${p.id}" ${view.effective ? "checked" : ""}>
                                <span>${p.name}${badges}</span>
                            </label>`;
                    }
                )
                .join("")
            : `<div class="text-muted p-2">등록된 권한이 없습니다.</div>`;
    };

    renderList(articlePermissions, actionPermissionList);
    renderList(pagePermissions, pagePermissionList);

    // ✅ 체크박스 변경 이벤트 감지 → Reset 버튼 활성화
    document.querySelectorAll(".permission-grid input[type='checkbox']").forEach((chk) => {
        chk.addEventListener("change", handleCheckboxChange);
    });
}

// 현재 UI 상태로부터 오버라이드 계산
function computeOverridesFromUI() {
    const overrides = [];
    for (const p of allPermissions) {
        const input = document.querySelector(`.permission-grid input[data-permission-id="${p.id}"]`);
        if (!input) continue;
        const checked = input.checked;
        const view = currentUserViewMap.get(p.id) ?? { defaultAllow: false, userOverride: null, effective: false };

        // 기본 기준 = 기본권한 OR 조직추가권한
        const baseAllow = !!view.defaultAllow || !!view.orgAllow;

        // 규칙: checked가 defaultAllow와 같으면 override 없음
        //       (checked && !defaultAllow) → ALLOW
        //       (!checked && defaultAllow) → DENY
        let effect = null;
        if (checked !== baseAllow) {
            effect = checked ? "ALLOW" : "DENY";
            overrides.push({ permissionId: Number(p.id), effect });
        }
    }
    return overrides;
}

// 두 오버라이드 집합 동일성 비교
function sameOverrides(aMap, arrB) {
    if (aMap.size !== arrB.length) return false;
    for (const { permissionId, effect } of arrB) {
        if (aMap.get(Number(permissionId)) !== effect) return false;
    }
    return true;
}

// 체크박스 변경 감지 → reset 활성화 여부
function handleCheckboxChange() {
    const overrides = computeOverridesFromUI();
    resetButton.disabled = sameOverrides(originalOverrides, overrides);
}

// =========================
// 목록 렌더링
// =========================
function renderUserList(users) {
    if (!users || users.length === 0) {
        userListContainer.innerHTML = `
            <div class="text-muted text-center p-3 notice-user-empty">
                등록된 사용자가 없습니다.
            </div>
        `;
        return;
    }

    userListContainer.innerHTML = users
        .map(
            (r) => `
                <button type="button"
                        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        data-user-id="${r.id}" data-user-name="${r.name}">
                  <div>
                    <strong>${r.name}</strong><br>
                        <small class="d-flex flex-wrap gap-2 align-items-center">
                          <span>역활: ${r.roleName}</span>
                        </small>
                  </div>
                  <i class="ri-arrow-right-s-line"></i>
                </button>`
        )
        .join("");
}

function handleUserClick(btn) {
    const userId = btn.dataset.userId;
    const userName = btn.dataset.userName;
    selectedUserId = userId;
    selectedUserName = userName;

    // UI 업데이트
    userNameTarget.textContent = btn.dataset.userName;
    userListContainer.querySelectorAll(".list-group-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelector(".permission-grid")?.classList.remove("d-none");
    document.querySelector(".btn-grid")?.classList.remove("d-none");

    // 이전 요청 취소
    if (currentRoleFetchAborter) currentRoleFetchAborter.abort();
    currentRoleFetchAborter = new AbortController();

    // 권한 조회
    loadRolePermissions(userId).catch(e => {
        if (e?.name !== "AbortError") console.error(e);
    });
}

function reloadStaffTable(tableId, modalEl, { resetToFirstPage = false } = {}) {
    const ajaxUrl = "/api/users";
    const columnsFn = getStaffTableColumns();

    if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
        const dt = $(`#${tableId}`).DataTable();
        dt.ajax.url(ajaxUrl);
        dt.ajax.reload(null, resetToFirstPage);
        return;
    }

    loadDataTable({
        tableId,
        ajaxUrl,
        columns: columnsFn,
        defaultOrderIndex: null,
        getExtraDataFn: () => {
            // 검색 조건 추가
            const params = {};
            // 이름
            const nameKeyword = $id("search-text")?.value?.trim() ?? "";
            if (nameKeyword) params["search_NAME_LIKE"] = nameKeyword;
            return params;
        },
        enableOrdering: false,
        enableCardView: false,
        extraOptions: {
            dom: 'rtip'
        }
    });
}

/* =========================
 * DataTable 컬럼 정의
 * ========================= */
function getStaffTableColumns() {
    return [
        {
            data: null,
            title: "#",
            className: "data-txt",
            orderable: false,
            width: "2%",
            render: (data, type, row, meta) => {
                const start = meta?.settings?._iDisplayStart ?? 0;
                return start + meta.row + 1;
            }
        },
        {
            data: "login",
            title: "ID",
            className: "data-txt",
            orderable: false,
            width: "9%",
            render: (data) => data ?? "-",
        },
        {
            data: "name",
            title: "이름",
            className: "data-txt",
            orderable: false,
            // width: "6%",
            render: (data) => data ?? "-",
            createdCell: (td, cellData, rowData) => {
                // td → 현재 셀 DOM element
                // rowData → 해당 행의 전체 데이터(JSON)
                td.dataset.userId = rowData.id;
                td.dataset.userName = rowData.name;
                td.dataset.occupationName = rowData.occupationName;
                td.dataset.positionName = rowData.positionName;
                td.dataset.departmentName = rowData.departmentName;
                td.dataset.unitName = rowData.unitName;
            }
        },
        {
            data: "roleName",
            title: "역활",
            className: "data-txt",
            orderable: false,
            // width: "6%",
            render: (data) => data ?? "-",
        },
    ];
}
