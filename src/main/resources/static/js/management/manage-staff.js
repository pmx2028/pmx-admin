// /js/management/member.js
import { loadDataTable } from "../common/datatable-handler.js";
import { initCoverFileUpload } from "./management-utils.js";

/* =========================
 * 전역 상태 (생성/수정 모드)
 * ========================= */
const UserModalState = {
    mode: "create", // 'create' | 'edit'
    userId: null,
};

const PageState = {
    roleCodes: [],
};

let isSubmitting = false;

function setSubmitting(on) {
    isSubmitting = on;
    const btn = $id("user-confirm");
    if (!btn) return;

    if (on) {
        btn.disabled = true;
        btn.dataset.originalText = btn.textContent;
        btn.textContent = "처리 중...";
    } else {
        btn.disabled = false;
        if (btn.dataset.originalText) {
            btn.textContent = btn.dataset.originalText;
        }
    }
}

/* =========================
 * DOMContentLoaded
 * ========================= */
document.addEventListener("DOMContentLoaded", async () => {
    // 직책
    await loadRole("search-target", {placeholder: "전체", placeholderValue: "-"});

    // 사용자 목록 테이블 초기 로드
    reloadStaffTable("staffDataTable");

    // 이미지 등록1
    initCoverFileUpload({
        modalId: "user-modal"
    });
    // 이미지 등록2
    initCoverFileUpload({
        modalId: "user-modal",
        fileInputId: "formFile1",
        fileNameDisplayId: "fileNameDisplay1",
        deleteFileBtnId: "deleteFileBtn1",
        previewImageId: "previewImage1",
        loadingId: "uploadLoading1",
        datasetKey: "coverId1"
    });
    // 모달 셀렉트 초기화
    initUserModalSelects(); // Role

    // '사용자추가' 버튼 → 생성 모드로 오픈
    //    (해당 버튼에 .management-btn 클래스가 있으므로 해당 셀렉터로 바인딩)
    document.querySelector('button.management-btn[data-bs-target="#user-modal"]')
        ?.addEventListener("click", () => {
            UserModalState.mode = "create";
            void openCreateModal();
        });

    // DataTable '수정' 버튼 위임 바인딩
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest('[data-action="edit-user"]');
        if (!btn) return;
        const userId = btn.getAttribute("data-user-id");
        if (!userId) return;

        const modal = bootstrap.Modal.getOrCreateInstance($id("user-modal"));
        await openEditModal(userId);
        modal.show();
    });

    // 검색/초기화
    const searchBtn = $id("btn-search");
    const resetBtn = $id("btn-reset");
    const nameInput = $id("target-text");
    const runSearch = () => {
        const $table = $("#staffDataTable");
        if ($.fn.DataTable.isDataTable($table)) {
            $table.DataTable().ajax.reload(null, true);
            return;
        }
        reloadStaffTable("staffDataTable");
    };
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            runSearch();
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            $id("search-target").value = "-";
            $id("target-text").value = "";
            runSearch();
        });
    }
    // Enter 키로 검색 실행
    if (nameInput) {
        nameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                runSearch();
            }
        });
    }

    // 일반직원 퇴사처리 버튼 이벤트
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest('[data-action="resign-user"]');
        if (!btn) return;

        const userId = btn.getAttribute("data-user-id");
        if (!userId) return;

        // 확인 다이얼로그
        const ok = confirm("해당 사용자를 퇴사 처리하시겠습니까?");
        if (!ok) return;

        // 버튼 중복 클릭 방지
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "처리중";

        try {
            await resignUser(userId);
            alert("퇴사 처리되었습니다.");
            reloadStaffTable("staffDataTable"); // DataTable 새로고침
        } catch (err) {
            console.error(err);
            alert(err.message || "퇴사 처리 중 오류가 발생했습니다.");
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });

    // 편집국 퇴사 버튼 이벤트
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest('[data-action="resign-user-with-date"]');
        if (!btn) return;

        const userId = btn.getAttribute("data-user-id");
        if (!userId) return;

        const modalEl = $id("resign-modal")
        if (!modalEl) return;

        // userId 저장
        modalEl.dataset.userId = userId;

        initAssignDatePicker({ mode: "create" });
        bindResignConfirmHandler();

        const $displayInput = $('input[type="text"][name="assign-date"]');
        const $hiddenInput  = $('input[type="hidden"][name="assign-date"]');
        $displayInput.val("");
        $hiddenInput.val("");

        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    });

    // 모달이 완전히 닫히면 항상 초기화
    $id("user-modal")?.addEventListener("hidden.bs.modal", () => {
        resetUserModal();
        UserModalState.mode = "create";
        UserModalState.userId = null;
    });

    $id("assign-modal")?.addEventListener("hidden.bs.modal", () => {
        resetAssignModal();
    });
});


/* =========================
 * 공통 유틸
 * ========================= */
const same = (a, b) => String(a) === String(b);
const toNumOrNull = (v) => (v === "" || v === "-" ? null : Number(v));
const getSelectedText = (id) => $id(id)?.selectedOptions?.[0]?.textContent?.trim() ?? "";

/* CSRF */
function getCsrf() {
    const token = document.querySelector('meta[name="_csrf"]')?.getAttribute("content");
    const header = document.querySelector('meta[name="_csrf_header"]')?.getAttribute("content") || "X-CSRF-TOKEN";
    return token ? { header, token } : null;
}

/* GET JSON */
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

/* =========================
 * DataTable 재로드
 * ========================= */
function reloadStaffTable(tableId) {
    const ajaxUrl = "/api/users";
    const columnsFn = getStaffTableColumns();

    loadDataTable({
        tableId,
        ajaxUrl,
        columns: columnsFn,
        defaultOrderIndex: null,
        minTableWidth: 1100, // 스크롤 기준 너비 전달
        getExtraDataFn: () => {
            // 검색 조건 추가
            const params = {};
            const nameKeyword = $id("target-text")?.value?.trim() ?? "";
            const roleVal = $id("search-target")?.value ?? "-";
            // 이름
            if (nameKeyword) params["search_NAME_LIKE"] = nameKeyword;
            // 직군 (전체 제외)
            if (roleVal && roleVal !== "-") {
                params["search_ROLE_ID_IS"] = Number(roleVal);
            }
            return params;
        },
        enableOrdering: false,
        mobileBreakpoint: 640,
        enableCardView: true,
        enableResponsive : false,
        extraOptions: {
            dom: 'rtip'
        }
    });
}

/* =========================
 * RolePermissionController 연동
 * ========================= */
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

function normalizeList(resp, key) {
    const data = resp?.data?.[key] ?? resp?.data ?? [];
    // console.log(data);
    if (!Array.isArray(data)) return [];
    return data.map((x) => ({
        id: x.id ?? x.value ?? x.key,
        name: x.name ?? x.compName ?? x.title ?? String(x.id ?? ""),
        code: x.code,
        type: x.type,
        active: x.active,
        virtual: x.virtual
    }));
}

async function loadRoleCodes() {
    if (PageState.roleCodes.length > 0) return;
    const resp = await fetchJson("/api/code/user-roles");
    PageState.roleCodes = normalizeList(resp);
}

async function loadRole(selectId, options = { placeholder: "전체", placeholderValue: "-" }) {
    await loadRoleCodes();
    fillSelect(selectId, PageState.roleCodes, options);
}

/* =========================
 * 모달 초기화/닫기
 * ========================= */
function resetUserModal() {
    ["login", "password", "pw-check", "name", "email", "mobile" ,"zipcode" ,"address" ,"birthday"].forEach((id) => {
        const el = $id(id);
        if (el) el.value = "";
    });

    setSelectedSex("");

    ["role"].forEach((id) => {
        const el = $id(id);
        if (el) el.value = "-";
    });

}

function closeUserModal() {
    const modalEl = $id("user-modal");
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.hide();
}

/* =========================
 * 생성/수정 모드 UI/핸들러 세팅
 * ========================= */
function setConfirmHandler(fn) {
    const btn = $id("user-confirm");
    if (!btn) return;
    // 기존 핸들러 제거 후 재바인딩
    btn.replaceWith(btn.cloneNode(true));
    $id("user-confirm").addEventListener("click", fn);
}

function paintModalUiByMode() {
    const titleEl = $id("user-modal-title");
    const confirmBtn = $id("user-confirm");
    if (!titleEl || !confirmBtn) return;

    if (UserModalState.mode === "create") {
        titleEl.textContent = "새 계정 생성";
        confirmBtn.textContent = "생성";
    } else {
        titleEl.textContent = "계정 정보 수정";
        confirmBtn.textContent = "저장";
    }
}

async function openCreateModal() {
    UserModalState.mode = "create";
    UserModalState.userId = null;

    $id("login").disabled = false;

    resetUserModal();
    paintModalUiByMode();

    setConfirmHandler(handleCreateConfirm);
}

async function openEditModal(userId) {
    UserModalState.mode = "edit";
    UserModalState.userId = userId;

    resetUserModal();
    paintModalUiByMode();

    // 상세 조회
    const detail = await fetchJson(`/api/users/${userId}`);
    const u = detail?.data ?? {};
    // console.log("detail user", u);

    // 셀렉트 채우기 → 값 세팅
    await loadRole("role");
    $id("role").value = String(u.roleId ?? "-");


    // 값 주입
    $id("login").value = u.login ?? "";
    $id("login").disabled = true;
    $id("name").value = u.name ?? "";
    $id("email").value = u.email ?? "";
    $id("mobile").value = u.mobile ?? "";
    $id("zipcode").value = u.zipcode ?? "";
    $id("address").value = u.address ?? "";
    setSelectedSex(u.sex ?? "");
    $id("birthday").value = u.birthday ?? "";

    // 비밀번호(옵션)
    $id("password").value = "";
    $id("pw-check").value = "";

    // 권한 체크박스 세팅
    const levelCheckbox = $id("level");
    if (levelCheckbox) {
        if (u.level === 0) {
            levelCheckbox.checked = true; // 권한없음
        } else if (u.level === 10) {
            levelCheckbox.checked = false;
        }
    }

    // ========== 사진 (미리보기 / 삭제 버튼 / 파일 input) ==========
    const modalEl = document.getElementById("user-modal");
    const previewImg = modalEl.querySelector("#previewImage");
    const fileNameDisplay = modalEl.querySelector("#fileNameDisplay");
    const deleteBtn = modalEl.querySelector("#deleteFileBtn");
    const fileInput = modalEl.querySelector("#formFile");
    const loadingEl = modalEl.querySelector("#uploadLoading");


    const previewImg1 = modalEl.querySelector("#previewImage1");
    const fileNameDisplay1 = modalEl.querySelector("#fileNameDisplay1");
    const deleteBtn1 = modalEl.querySelector("#deleteFileBtn1");
    const fileInput1 = modalEl.querySelector("#formFile1");
    const loadingEl1 = modalEl.querySelector("#uploadLoading1");


    fileInput.dataset.coverId = u.coverId;
    fileInput1.dataset.coverId1 = u.coverId1;

    if (loadingEl) {
        loadingEl.classList.add("d-none");
    }

    if (loadingEl1) {
        loadingEl1.classList.add("d-none");
    }


    if (u.coverImageUrl) {
        previewImg.src = u.coverImageUrl;
        previewImg.classList.remove("d-none");
        fileNameDisplay.textContent = u.coverImageTitle;
        fileNameDisplay.classList.remove("d-none", "opacity-0");
        if (deleteBtn) deleteBtn.style.display = "";
    } else {
        previewImg.src = "";
        previewImg.classList.add("d-none");
        fileNameDisplay.textContent = "";
        fileNameDisplay.classList.add("d-none");
        if (deleteBtn) deleteBtn.style.display = "none";
    }

    if (u.coverImageUrl1) {
        previewImg1.src = u.coverImageUrl1;
        previewImg1.classList.remove("d-none");
        fileNameDisplay1.textContent = u.coverImageTitle1;
        fileNameDisplay1.classList.remove("d-none", "opacity-0");
        if (deleteBtn1) deleteBtn1.style.display = "";
    } else {
        previewImg1.src = "";
        previewImg1.classList.add("d-none");
        fileNameDisplay1.textContent = "";
        fileNameDisplay1.classList.add("d-none");
        if (deleteBtn1) deleteBtn1.style.display = "none";
    }

    if (fileInput) {
        fileInput.value = "";
    }
    if (fileInput1) {
        fileInput1.value = "";
    }

    setConfirmHandler(handleEditConfirm);
}

/* =========================
 * DTO 빌더 (생성/수정)
 * ========================= */
function getSelectedDataset(selectId) {
    const sel = document.getElementById(selectId);
    if (!sel || !sel.selectedOptions.length) return {};
    return sel.selectedOptions[0].dataset || {};
}

function buildUserCreatePayloadFromModal_Create() {
    const login = getVal("login");
    const password = getVal("password");
    const pwCheck = getVal("pw-check");
    const name = getVal("name");

    const roleId = toNumOrNull(getVal("role"));
    const email = getVal("email");
    const mobile = getVal("mobile");
    const zipcode = getVal("zipcode");
    const address = getVal("address");
    const sex = getSelectedSex();
    const birthday = getVal("birthday");

    if (!login) throw new Error("아이디를 입력해 주세요.");
    if (!password) throw new Error("비밀번호를 입력해 주세요.");
    if (!same(password, pwCheck)) throw new Error("비밀번호가 일치하지 않습니다.");
    if (!name) throw new Error("이름을 입력해 주세요.");
    if (!email) throw new Error("이메일을 입력해 주세요.");
    if (!mobile) throw new Error("휴대폰 번호를 입력해 주세요.");

    if (roleId == null) throw new Error("역활을 선택해 주세요.");

    // 사진
    const modalEl = document.getElementById("user-modal");
    const fileInput = modalEl.querySelector("#formFile");
    const fileInput1 = modalEl.querySelector("#formFile1");
    const coverId = fileInput.dataset.coverId;
    const coverId1 = fileInput1.dataset.coverId1;

    // 권한
    const levelCheckbox = document.getElementById("level");
    const level = levelCheckbox && levelCheckbox.checked ? 0 : 10;

    return {
        login,
        password,
        name,
        roleId,
        email,
        mobile,
        zipcode,
        address,
        sex,
        birthday,
        coverId,
        coverId1,
        level
    };
}

function buildUserUpdatePayloadFromModal_Edit() {
    const name = getVal("name");
    const roleId = toNumOrNull(getVal("role"));

    let roleName = null;
    if (roleId) {
        const selectEl = document.getElementById("role");
        roleName = selectEl?.selectedOptions?.[0]?.text || null;
    }

    const email = getVal("email");
    const mobile = getVal("mobile");
    const zipcode = getVal("zipcode");
    const address = getVal("address");
    const sex = getSelectedSex();
    const birthday = getVal("birthday");


    if (!name) throw new Error("이름을 입력해 주세요.");
    if (roleId == null) throw new Error("역활 선택해 주세요.");

    // 사진
    const modalEl = document.getElementById("user-modal");
    const fileInput = modalEl.querySelector("#formFile");
    const coverId = fileInput.dataset.coverId;

    // 사진1
    const modalEl1 = document.getElementById("user-modal");
    const fileInput1 = modalEl1.querySelector("#formFile1");
    const coverId1 = fileInput1.dataset.coverId1;


    // 권한
    const levelCheckbox = document.getElementById("level");
    const level = levelCheckbox && levelCheckbox.checked ? 0 : 10;

    const dto = {
        name,
        roleId,
        roleName,
        email,
        mobile,
        zipcode,
        address,
        sex,
        birthday,
        coverId,
        coverId1,
        level
    };

    // 비밀번호는 입력된 경우에만 변경
    const password = getVal("password");
    const pwCheck = getVal("pw-check");
    if (password || pwCheck) {
        if (!password) throw new Error("새 비밀번호를 입력해 주세요.");
        if (!same(password, pwCheck)) throw new Error("비밀번호가 일치하지 않습니다.");
        dto.password = password;
    }
    return dto;
}

/* =========================
 * API
 * ========================= */
async function postCreateUser(payload) {
    const res = await postWithCsrf("/api/users", payload);
    const resJson = await res.json().catch(() => null);
    const data = resJson ? resJson.data : null;
    if (!res.ok) throw new Error(data?.message || `${resJson.message}`);
    return data;
}

async function postUpdateUser(userId, payload) {
    const res = await putWithCsrf(`/api/users/${userId}`, payload);
    const resJson = await res.json().catch(() => null);
    const data = resJson ? resJson.data : null;
    if (!res.ok) throw new Error(data?.message || `사용자 수정 실패 (code: ${res.status})`);
    return data;
}

/* =========================
 * 확인 버튼 핸들러
 * ========================= */
async function handleCreateConfirm(e) {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting) return;
    setSubmitting(true);

    try {
        const dto = buildUserCreatePayloadFromModal_Create();
        await postCreateUser(dto);
        alert("사용자 계정이 생성되었습니다.");
        closeUserModal();
        resetUserModal();
        reloadStaffTable("staffDataTable");
    } catch (err) {
        console.error(err);
        alert(err.message || "요청 처리 중 오류가 발생했습니다.");
    } finally {
        setSubmitting(false);
    }
}

async function handleEditConfirm(e) {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting) return;
    setSubmitting(true);

    try {
        const dto = buildUserUpdatePayloadFromModal_Edit();
        await postUpdateUser(UserModalState.userId, dto);
        alert("변경사항이 저장되었습니다.");
        closeUserModal();
        resetUserModal();
        reloadStaffTable("staffDataTable");
    } catch (err) {
        console.error(err);
        alert(err.message || "요청 처리 중 오류가 발생했습니다.");
    } finally {
        setSubmitting(false);
    }
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
            width: "10%",
            render: (data) => data ?? "-",
        },
        {
            data: "roleName",
            title: "직책",
            className: "data-txt",
            orderable: false,
            width: "7%",
            render: (data) => data ?? "-",
        },
        {
            data: "email",
            title: "이메일",
            className: "data-txt",
            orderable: false,
            width: "20%",
            render: (data) => data ?? "-",
        },
        {
            data: "mobile",
            title: "휴대폰",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (data) => data ?? "-",
        },
        {
            data: "btnActions",
            title: "작업",
            className: "bt-box",
            orderable: false,
            width: "13%",
            render: (data, type, row) => {
                // btnAction 배열이 없거나 비어있으면 바로 반환
                if (!Array.isArray(row.btnActions) || row.btnActions.length === 0) return "-";

                // 버튼 템플릿을 동적으로 조립
                const buttons = [];

                if (row.btnActions.includes("EDIT")) {
                    buttons.push(`
                        <button type="button" class="btn btn-outline-secondary"
                            data-action="edit-user" data-user-id="${row.id}"
                            data-bs-toggle="modal" data-bs-target="#user-modal">
                            수정
                        </button>
                    `);
                }

                if (row.btnActions.includes("ASSIGN")) {
                    buttons.push(`
                        <button type="button" class="btn btn-outline-secondary"
                            data-action="assign-user" data-user-id="${row.id}"
                            data-last-assign-at="${row.lastAssignAt}"
                            data-company-name="${row.companyName}"
                            data-division-name="${row.divisionName}"
                            data-department-name="${row.departmentName}"
                            data-unit-name="${row.unitName}">
                            부서발령
                        </button>
                    `);
                }

                // 일반 직원용 퇴사 버튼
                if (row.btnActions.includes("RESIGN")) {
                    buttons.push(`
                        <button type="button" class="btn btn-danger"
                            data-action="resign-user" data-user-id="${row.id}">
                            퇴사
                        </button>
                    `);
                }

                // 편집국용 퇴사 버튼
                if (row.btnActions.includes("RESIGN_WITH_DATE")) {
                    buttons.push(`
                        <button type="button" class="btn btn-danger"
                            data-action="resign-user-with-date" data-user-id="${row.id}">
                            퇴사
                        </button>
                    `);
                }
                return buttons.join(" ");
            }
        }
    ];
}

/* =========================
 * 초기 셀렉트/이벤트 바인딩
 * ========================= */
function initUserModalSelects() {
    loadRole("role").then(async () => {
        const occSel = $id("role");
        const occVal = toNumOrNull(occSel?.value);
    });
}

function getSelectedSex() {
    return document.querySelector('input[name="sex"]:checked')?.value ?? "";
}

function setSelectedSex(value) {
    const raw = String(value ?? "");
    const normalized = raw === "남" || raw === "남성" || raw.toUpperCase() === "MALE" ? "M"
        : raw === "여" || raw === "여성" || raw.toUpperCase() === "FEMALE" ? "F"
            : raw;
    document.querySelectorAll('input[name="sex"]').forEach((radio) => {
        radio.checked = radio.value === normalized;
    });
}

// 공통: 하위 셀렉트 초기화
function resetSelects(ids = []) {
    ids.forEach((sid) => fillSelect(sid, [], { placeholder: "선택", placeholderValue: "-" }));
}



// 사용자 퇴사처리
async function resignUser(userId, date="") {
    const res = await putWithCsrf(`/api/users/${userId}/resign`, date); // 바디는 비워도 OK
    const resJson = await res.json().catch(() => null);
    const data = resJson ? resJson.data : null;
    if (!res.ok) throw new Error(data?.message || `퇴사 처리중 오류가 발생했습니다.`);
    return data;
}

async function initOrgCascaderInAssignModal() {
    // 1) 회사 목록 로드
    await loadCompaniesSelect("assign-company");
    // 하위 초기화
    resetSelects(["assign-division", "assign-department", "assign-unit"]);

    // 2) 회사 변경 → 본부 로드
    $id("assign-company")?.addEventListener("change", async () => {
        const companyId = toNumOrNull(getVal("assign-company"));
        resetSelects(["assign-division", "assign-department", "assign-unit"]);
        if (companyId != null) {
            await loadDivisionsByCompany(companyId, "assign-division");
        }
    });

    // 3) 본부 변경 → 부 로드
    $id("assign-division")?.addEventListener("change", async () => {
        const divisionId = toNumOrNull(getVal("assign-division"));
        resetSelects(["assign-department", "assign-unit"]);
        if (divisionId != null) {
            await loadDepartmentsByDivision(divisionId, "assign-department");
        }
    });

    // 4) 부 변경 → 팀 로드
    $id("assign-department")?.addEventListener("change", async () => {
        const departmentId = toNumOrNull(getVal("assign-department"));
        resetSelects(["assign-unit"]);
        if (departmentId != null) {
            await loadUnitsByDepartment(departmentId, "assign-unit");
        }
    });
}

/**
 * 모달 닫기
 */
function closeAssignModal() {
    const modalEl = $id("assign-modal");
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.hide();
}

/**
 * 모달 입력 초기화
 */
function resetAssignModal() {
    // 날짜
    const $displayInput = $('input[type="text"][name="assign-date"]');
    const $hiddenInput  = $('input[type="hidden"][name="assign-date"]');
    $displayInput.val("");
    $hiddenInput.val("");

    // 조직 셀렉트
    ["assign-company", "assign-division", "assign-department", "assign-unit"].forEach((id) => {
        const el = $id(id);
        if (el) el.value = "-";
    });

    fillAssignCurrentOrg({});

    // userId 제거
    const modalEl = $id("assign-modal");
    if (modalEl) delete modalEl.dataset.userId;
}

function formatAssignDisplayDate(value) {
    const raw = value?.trim?.() ?? "";
    if (!raw || raw === "null" || raw === "undefined") return "-";

    const datePart = raw.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (datePart) return datePart.replace(/-/g, "/");

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;

    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
}

function fillAssignCurrentOrg({
    lastAssignAt = "",
    companyName = "",
    divisionName = "",
    departmentName = "",
    unitName = "",
} = {}) {
    const currentOrgMap = {
        "assign-last-assign-at": formatAssignDisplayDate(lastAssignAt),
        "assign-current-company": companyName,
        "assign-current-division": divisionName,
        "assign-current-department": departmentName,
        "assign-current-unit": unitName,
    };

    Object.entries(currentOrgMap).forEach(([id, value]) => {
        const el = $id(id);
        if (el) {
            el.textContent = value?.trim() ? value.trim() : "-";
        }
    });
}

/**
 * 조직 캐스케이더도 오픈 시마다 이벤트 중복 바인딩될 수 있으니 1회만
 */
async function initOrgCascaderInAssignModalOnce() {
    const modalEl = $id("assign-modal");
    if (!modalEl) return;

    if (modalEl.dataset.orgCascaderInited === "true") return;
    await initOrgCascaderInAssignModal();
    modalEl.dataset.orgCascaderInited = "true";
}

/**
 * assign 모달에서 DTO 생성
 * - assignDate: hidden input 값(YYYY-MM-DD)
 */
function buildAssignPayloadFromModal(modalEl) {
    const userId = modalEl?.dataset?.userId ? Number(modalEl.dataset.userId) : null;

    const assignDate = $('input[type="hidden"][name="assign-date"]').val()?.trim() ?? "";

    const companyId = toNumOrNull(getVal("assign-company"));
    const divisionId = toNumOrNull(getVal("assign-division"));
    const departmentId = toNumOrNull(getVal("assign-department"));
    const unitId = toNumOrNull(getVal("assign-unit"));

    const divisionData = getSelectedDataset("assign-division");
    const departmentData = getSelectedDataset("assign-department");

    if (!userId) throw new Error("사용자 ID를 찾을 수 없습니다.");
    if (!assignDate) throw new Error("발령일자를 선택해 주세요.");
    if (companyId == null) throw new Error("회사를 선택해 주세요.");

    // (네 기존 정책 그대로 유지)
    if (divisionData.virtual === "true" && departmentData.virtual === "true" && unitId == null) {
        throw new Error(
            "사용자는 반드시 실제 본부/국,부서,팀 중 하나에 속해야 합니다.\n소속 조직을 선택해 주세요."
        );
    }

    return {
        assignDate,     // 'yyyy-MM-dd'
        companyId,
        divisionId,
        departmentId,
        unitId
    };
}

/**
 * 부서발령 API
 * - 컨트롤러 라우트에 맞게 URL만 조정하면 됨
 */
async function postAssignUser(userId, payload) {
    const res = await postWithCsrf(`/api/users/${userId}/assign`, payload);
    const resJson = await res.json().catch(() => null);
    const data = resJson ? resJson.data : null;
    if (!res.ok) throw new Error(data?.message || resJson?.message || `부서발령 실패 (code: ${res.status})`);
    return data;
}

/**
 * 확인 버튼 핸들러(부서발령)
 */
async function handleAssignConfirm(e) {
    e.preventDefault();
    e.stopPropagation();

    const modalEl = $id("assign-modal");
    if (!modalEl) return;

    const btn = $id("assign-confirm");
    if (!btn) return;

    if (btn.dataset.submitting === "true") return;
    btn.dataset.submitting = "true";

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "처리 중...";

    try {
        const payload = buildAssignPayloadFromModal(modalEl);
        await postAssignUser(payload ? modalEl.dataset.userId : null, payload);

        alert("부서 발령이 완료되었습니다.");
        closeAssignModal();
        resetAssignModal();
        reloadStaffTable("staffDataTable");
    } catch (err) {
        console.error(err);
        alert(err.message || "부서 발령 처리 중 오류가 발생했습니다.");
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
        btn.dataset.submitting = "false";
    }
}

/**
 * assign-confirm 버튼은 모달 열 때마다 중복 바인딩될 수 있어서
 * replaceWith 방식으로 1회 바인딩 패턴 사용
 */
function bindAssignConfirmHandler() {
    const btn = $id("assign-confirm");
    if (!btn) return;

    btn.replaceWith(btn.cloneNode(true));
    $id("assign-confirm")?.addEventListener("click", handleAssignConfirm);
}

function initAssignDatePicker({ mode = "create", initialValue = null } = {}) {
    initSingleDatePicker({
        target: 'input[type="text"][name="assign-date"]',
        valueInput: 'input[type="hidden"][name="assign-date"]',

        enableTime: false,

        // 화면 표시: YYYY/MM/DD
        displayFormat: "YYYY/MM/DD",
        // 서버 전송(hidden): YYYY-MM-DD
        hiddenFormat: "YYYY-MM-DD",

        mode,
        initialValue, // edit 모드일 때만 의미 있음
    });
}

function bindResignConfirmHandler() {
    const btn = $id("resign-confirm");
    if (!btn) return;

    btn.replaceWith(btn.cloneNode(true));
    $id("resign-confirm")?.addEventListener("click", handleResignConfirm);
}

async function handleResignConfirm(e) {
    e.preventDefault();
    e.stopPropagation();

    const modalEl = $id("resign-modal");
    if (!modalEl) return;

    const btn = $id("resign-confirm");
    if (!btn) return;

    if (btn.dataset.submitting === "true") return;
    btn.dataset.submitting = "true";

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "처리 중...";

    try {
        const modalEl = $id("resign-modal");
        if (!modalEl) return;

        const userId = modalEl.dataset.userId;
        const ResignDate = $('input[type="hidden"][name="assign-date"]').val()?.trim() ?? "";
        await resignUser(userId, ResignDate);

        alert("퇴사 처리가 완료되었습니다.");

        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();

        reloadStaffTable("staffDataTable");

    } catch (err) {
        console.error(err);
        alert(err.message || "퇴사 처리 중 오류가 발생했습니다.");
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
        btn.dataset.submitting = "false";
    }
}

