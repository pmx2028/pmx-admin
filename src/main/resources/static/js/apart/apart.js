// /js/management/manage-staff.js
import { loadDataTable } from "../common/datatable-handler.js";
import { initCoverFileUpload } from "../management/management-utils.js";

/* =========================
 * 전역 상태 (생성/수정 모드)
 * ========================= */
const ApartModalState = {
    mode: "create", // 'create' | 'edit'
    apartId: null,
};

const ApartNameCheckState = {
    name: "",
    excludeId: null,
    duplicated: null,
};

let isSubmitting = false;

function setSubmitting(on) {
    isSubmitting = on;
    const btn = $id("apart-confirm");
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
    // 검색용
    await initSearchAddressCascader();

    // 아파트 목록 테이블 초기 로드
    reloadApartfTable("apartDataTable");

    // 모달 셀렉트 초기화
    //initApartModalSelects(); //

    // '사용자추가' 버튼 → 생성 모드로 오픈
    //    (해당 버튼에 .management-btn 클래스가 있으므로 해당 셀렉터로 바인딩)
    document.querySelector('button.management-btn[data-bs-target="#apart-modal"]')
        ?.addEventListener("click", () => {
            ApartModalState.mode = "create";
            void openCreateModal();
        });

    // DataTable '수정' 버튼 위임 바인딩
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest('[data-action="edit-apart"]');
        if (!btn) return;
        const apartId = btn.getAttribute("data-apart-id");
        if (!apartId) return;

        const modal = bootstrap.Modal.getOrCreateInstance($id("apart-modal"));
        await openEditModal(apartId);
        modal.show();
    });

    // 검색/초기화
    const searchBtn = $id("btn-search");
    const resetBtn = $id("btn-reset");
    const nameInput = $id("target-text");
    const runSearch = () => {
        const $table = $("#apartDataTable");
        if ($.fn.DataTable.isDataTable($table)) {
            $table.DataTable().ajax.reload(null, true);
            return;
        }
        reloadApartfTable("apartDataTable");
    };
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            runSearch();
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            $id("search-target-depth1").value = "-";
            fillSelect("search-target-depth2", [], { placeholder: "전체", placeholderValue: "-" });
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

    bindApartNameDuplicateCheck();

    // 일반직원 퇴사처리 버튼 이벤트
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest('[data-action="resign-apart"]');
        if (!btn) return;

        const apartId = btn.getAttribute("data-apart-id");
        if (!apartId) return;

        // 확인 다이얼로그
        const ok = confirm("해당 아파트를 삭제 처리하시겠습니까?");
        if (!ok) return;

        // 버튼 중복 클릭 방지
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "처리중";

        try {
            await resignApart(apartId);
            alert("삭제 처리되었습니다.");
            reloadApartfTable("apartDataTable"); // DataTable 새로고침
        } catch (err) {
            console.error(err);
            alert(err.message || "삭제 처리 중 오류가 발생했습니다.");
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });

    // 모달이 완전히 닫히면 항상 초기화
    $id("apart-modal")?.addEventListener("hidden.bs.modal", () => {
        resetApartModal();
        ApartModalState.mode = "create";
        ApartModalState.apartId = null;
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
function reloadApartfTable(tableId) {
    const ajaxUrl = "/api/aparts";
    const columnsFn = getApartTableColumns();

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
            const addressVal = $id("search-target-depth1")?.value ?? "-";
            const address1Val = $id("search-target-depth2")?.value ?? "-";
            // 이름
            if (nameKeyword) params["search_NAME_LIKE"] = nameKeyword;
            //  지역
            if (addressVal && addressVal !== "-") {
                params["search_ADDRESS_ID_IS"] = Number(addressVal);
            }
            //시군구
            if (address1Val && address1Val !== "-") {
                params["search_ADDRESS1_ID_IS"] = Number(address1Val);
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
        type: x.type,
        active: x.active,
        virtual: x.virtual
    }));
}

async function loadRole(selectId) {
    const resp = await fetchJson("/api/roles");
    const items = normalizeList(resp, "roles");
    fillSelect(selectId, items, { placeholder: "전체", placeholderValue: "-" });
}

/* =========================
 * 모달 초기화/닫기
 * ========================= */
function resetApartModal() {
    ["name", "hosCnt", "gxCnt", "runCnt", "wetCnt" ,"golfCnt" , "scrCnt" ,"scrGolfCnt"].forEach((id) => {
        const el = $id(id);
        if (el) el.value = "";
    });
    resetApartNameCheck();

    setSelectedActivited("");
    setSelectedInbyYn("");

    ["address" ,"address1"].forEach((id) => {
        const el = $id(id);
        if (el) el.value = "-";
    });

}

function closeApartModal() {
    const modalEl = $id("apart-modal");
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.hide();
}

/* =========================
 * 생성/수정 모드 UI/핸들러 세팅
 * ========================= */
function setConfirmHandler(fn) {
    const btn = $id("apart-confirm");
    if (!btn) return;
    // 기존 핸들러 제거 후 재바인딩
    btn.replaceWith(btn.cloneNode(true));
    $id("apart-confirm").addEventListener("click", fn);
}

function paintModalUiByMode() {
    const titleEl = $id("apart-modal-title");
    const confirmBtn = $id("apart-confirm");
    if (!titleEl || !confirmBtn) return;

    if (ApartModalState.mode === "create") {
        titleEl.textContent = "아파트 등록";
        confirmBtn.textContent = "생성";
    } else {
        titleEl.textContent = "아파트 정보 수정";
        confirmBtn.textContent = "저장";
    }
}

async function openCreateModal() {
    ApartModalState.mode = "create";
    ApartModalState.apartId = null;
    await initModalAddressCascader();
    resetApartModal();
    paintModalUiByMode();

    setConfirmHandler(handleCreateConfirm);
}

async function openEditModal(apartId) {
    ApartModalState.mode = "edit";
    ApartModalState.apartId = apartId;

    resetApartModal();
    paintModalUiByMode();

    // 상세 조회
    const detail = await fetchJson(`/api/aparts/${apartId}`);
    const u = detail?.data ?? {};
    // console.log("detail apart", u);

    // 주소 loading
    await initModalAddressCascader();

    // 값 주입
    $id("address").value = String(u.addressId ?? "-");
    await loadAddress1Select(u.addressId, "address1", { placeholder: "시도군을 선택해 주세요", placeholderValue: "-" });
    $id("address1").value = String(u.addressId1 ?? "-");
    $id("name").value = u.name ?? "";
    setSelectedActivited(u.activated ?? "");
    $id("hosCnt").value = u.hosCnt ?? "";
    $id("gxCnt").value = u.gxCnt ?? "";
    $id("runCnt").value = u.runCnt ?? "";
    $id("wetCnt").value = u.wetCnt ?? "";
    setSelectedInbyYn(u.inbyYn ?? "");
    $id("golfCnt").value = u.golfCnt ?? "";
    $id("scrCnt").value = u.scrCnt ?? "";
    $id("scrGolfCnt").value = u.scrGolfCnt ?? "";

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

function buildApartCreatePayloadFromModal_Create() {

    const addressId = toNumOrNull(getVal("address"));
    const addressId1 = toNumOrNull(getVal("address1"));
    const name = getVal("name").trim();
    const activated = getSelectedActivated();
    const hosCnt = getVal("hosCnt");
    const gxCnt = getVal("gxCnt");
    const runCnt = getVal("runCnt");
    const wetCnt = getVal("wetCnt");
    const inbyYn = getSelectedInbyYn();
    const golfCnt = getVal("golfCnt");
    const scrCnt = getVal("scrCnt");
    const scrGolfCnt = getVal("scrGolfCnt");

    if (!name) throw new Error("아파트명을 입력해 주세요.");
    if (addressId == null) throw new Error("행정구역을 선택해 주세요.");
    if (addressId1 == null) throw new Error("시도군을 선택해 주세요.");

    return {
        addressId,
        addressId1,
        name,
        activated,
        hosCnt,
        gxCnt,
        runCnt,
        wetCnt,
        inbyYn,
        golfCnt,
        scrCnt,
        scrGolfCnt,
    };
}

function buildApartUpdatePayloadFromModal_Edit() {

    const addressId = toNumOrNull(getVal("address"));
    const addressId1 = toNumOrNull(getVal("address1"));
    const name = getVal("name").trim();
    const activated = getSelectedActivated();
    const hosCnt = getVal("hosCnt");
    const gxCnt = getVal("gxCnt");
    const runCnt = getVal("runCnt");
    const wetCnt = getVal("wetCnt");
    const inbyYn = getSelectedInbyYn();
    const golfCnt = getVal("golfCnt");
    const scrCnt = getVal("scrCnt");
    const scrGolfCnt = getVal("scrGolfCnt");

    if (!name) throw new Error("아파트명을 입력해 주세요.");
    if (addressId == null) throw new Error("행정구역을 선택해 주세요.");
    if (addressId1 == null) throw new Error("시도군을 선택해 주세요.");

    const dto = {
        addressId,
        addressId1,
        name,
        activated,
        hosCnt,
        gxCnt,
        runCnt,
        wetCnt,
        inbyYn,
        golfCnt,
        scrCnt,
        scrGolfCnt,
    };

    return dto;
}

/* =========================
 * API
 * ========================= */
async function postCreateApart(payload) {
    const res = await postWithCsrf("/api/aparts", payload);
    const resJson = await res.json().catch(() => null);
    const data = resJson ? resJson.data : null;
    if (!res.ok) throw new Error(data?.message || `${resJson.message}`);
    return data;
}

async function postUpdateApart(apartId, payload) {
    const res = await putWithCsrf(`/api/aparts/${apartId}`, payload);
    const resJson = await res.json().catch(() => null);
    const data = resJson ? resJson.data : null;
    if (!res.ok) throw new Error(data?.message || `아프트정보 수정 실패 (code: ${res.status})`);
    return data;
}

async function checkApartNameDuplicate(name, excludeId = null) {
    const params = new URLSearchParams({ name });
    if (excludeId != null) {
        params.set("excludeId", String(excludeId));
    }

    const resp = await fetchJson(`/api/aparts/name-duplicate?${params.toString()}`);
    return Boolean(resp?.data?.duplicated);
}

function getApartNameCheckExcludeId() {
    return ApartModalState.mode === "edit" ? ApartModalState.apartId : null;
}

function setApartNameCheckMessage(message = "", type = "") {
    const nameInput = $id("name");
    const messageEl = $id("name-check-message");

    if (nameInput) {
        nameInput.classList.toggle("is-invalid", type === "invalid");
        nameInput.classList.toggle("is-valid", type === "valid");
    }
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.classList.toggle("text-danger", type === "invalid");
        messageEl.classList.toggle("text-success", type === "valid");
    }
}

function resetApartNameCheck() {
    ApartNameCheckState.name = "";
    ApartNameCheckState.excludeId = null;
    ApartNameCheckState.duplicated = null;
    setApartNameCheckMessage();
}

async function runApartNameDuplicateCheck({ showAvailableMessage = true } = {}) {
    const name = getVal("name").trim();
    const excludeId = getApartNameCheckExcludeId();

    if (!name) {
        resetApartNameCheck();
        throw new Error("아파트명을 입력해 주세요.");
    }

    if (
        ApartNameCheckState.name === name &&
        String(ApartNameCheckState.excludeId ?? "") === String(excludeId ?? "") &&
        ApartNameCheckState.duplicated !== null
    ) {
        return ApartNameCheckState.duplicated;
    }

    const duplicated = await checkApartNameDuplicate(name, excludeId);
    ApartNameCheckState.name = name;
    ApartNameCheckState.excludeId = excludeId;
    ApartNameCheckState.duplicated = duplicated;

    if (duplicated) {
        setApartNameCheckMessage("이미 등록된 아파트명입니다.", "invalid");
    } else if (showAvailableMessage) {
        setApartNameCheckMessage("등록 가능한 아파트명입니다.", "valid");
    } else {
        setApartNameCheckMessage();
    }

    return duplicated;
}

function bindApartNameDuplicateCheck() {
    const nameInput = $id("name");
    const checkBtn = $id("btn-name-duplicate-check");

    if (nameInput) {
        nameInput.addEventListener("input", resetApartNameCheck);
    }
    if (checkBtn) {
        checkBtn.addEventListener("click", async () => {
            try {
                await runApartNameDuplicateCheck({ showAvailableMessage: true });
            } catch (err) {
                setApartNameCheckMessage(err.message || "아파트명 중복 체크 중 오류가 발생했습니다.", "invalid");
            }
        });
    }
}

// 아파트 사용중지처리
async function resignApart(apartId, date="") {
    const res = await putWithCsrf(`/api/aparts/${apartId}/resign`, date); // 바디는 비워도 OK
    const resJson = await res.json().catch(() => null);
    const data = resJson ? resJson.data : null;
    if (!res.ok) throw new Error(data?.message || `퇴사 처리중 오류가 발생했습니다.`);
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
        const dto = buildApartCreatePayloadFromModal_Create();
        const duplicated = await runApartNameDuplicateCheck({ showAvailableMessage: false });
        if (duplicated) {
            throw new Error("이미 등록된 아파트명입니다.");
        }
        await postCreateApart(dto);
        alert("아파트가 등록되었습니다.");
        closeApartModal();
        resetApartModal();
        reloadApartfTable("apartDataTable");
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
        const dto = buildApartUpdatePayloadFromModal_Edit();
        const duplicated = await runApartNameDuplicateCheck({ showAvailableMessage: false });
        if (duplicated) {
            throw new Error("이미 등록된 아파트명입니다.");
        }
        await postUpdateApart(ApartModalState.apartId, dto);
        alert("변경사항이 저장되었습니다.");
        closeApartModal();
        resetApartModal();
        reloadApartfTable("apartDataTable");
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
function getApartTableColumns() {
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
            data: "addressName",
            title: "행정구역",
            className: "data-txt",
            orderable: false,
            width: "9%",
            render: (data) => data ?? "-",
        },
        {
            data: "addressName1",
            title: "시/군/구",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (data) => data ?? "-",
        },
        {
            data: "name",
            title: "아파트명",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (data) => data ?? "-",
        },
        {
            data: "hosCnt",
            title: "세대수",
            className: "data-txt",
            orderable: false,
            width: "7%",
            render: (data) => data ?? "-",
        },
        {
            data: "gxCnt",
            title: "GX/가용인원",
            className: "data-txt",
            orderable: false,
            width: "20%",
            render: (data) => data ?? "-",
        },
        {
            data: "runCnt",
            title: "헬스/러닝머신",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (data) => data ?? "-",
        },
        {
            data: "wetCnt",
            title: "헬스/웨이트머신",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (data) => data ?? "-",
        },
        {
            data: "inbyYnName",
            title: "헬스/인바디",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (data) => data ?? "-",
        },
        {
            data: "golfCnt",
            title: "골프/총타석",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (data) => data ?? "-",
        },
        {
            data: "scrCnt",
            title: "골프/타석스크린",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (data) => data ?? "-",
        },
        {
            data: "scrGolfCnt",
            title: "골프/스크린골프장",
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
                            data-action="edit-apart" data-apart-id="${row.id}"
                            data-bs-toggle="modal" data-bs-target="#apart-modal">
                            수정
                        </button>
                    `);
                }

                if (row.btnActions.includes("ASSIGN")) {
                    buttons.push(`
                        <button type="button" class="btn btn-outline-secondary"
                            data-action="assign-apart" data-apart-id="${row.id}"
                            data-last-assign-at="${row.lastAssignAt}"
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
function initApartModalSelects() {
    void initModalAddressCascader();
}

function getSelectedInbyYn(value) {
    return document.querySelector('input[name="inbyYn"]:checked')?.value ?? "";
}

function setSelectedInbyYn(value) {
    const raw = String(value ?? "");
    const normalized = raw === "유" ? "1"
        : raw === "무" ? "0"
            : raw;
    document.querySelectorAll('input[name="inbyYn"]').forEach((radio) => {
        radio.checked = radio.value === normalized;
    });
}

function getSelectedActivated() {
    return document.querySelector('input[name="activated"]:checked')?.value ?? "";
}

function setSelectedActivited(value) {
    const raw = String(value ?? "");
    const normalized = raw === "운영" ? "1"
        : raw === "미운영" ? "0"
            : raw;
    document.querySelectorAll('input[name="activated"]').forEach((radio) => {
        radio.checked = radio.value === normalized;
    });
}

// 공통: 하위 셀렉트 초기화
function resetSelects(ids = []) {
    ids.forEach((sid) => fillSelect(sid, [], { placeholder: "선택", placeholderValue: "-" }));
}

async function initSearchAddressCascader() {
    const selectedSearchAddress = getVal("search-target-depth1");
    const selectedSearchAddress1 = getVal("search-target-depth2");

    await loadAddressSelect("search-target-depth1", { placeholder: "전체", placeholderValue: "-" });
    if (selectedSearchAddress && selectedSearchAddress !== "-") {
        $id("search-target-depth1").value = selectedSearchAddress;
        await loadAddress1Select(selectedSearchAddress, "search-target-depth2", { placeholder: "전체", placeholderValue: "-" });
        $id("search-target-depth2").value = selectedSearchAddress1 || "-";
    } else {
        fillSelect("search-target-depth2", [], { placeholder: "전체", placeholderValue: "-" });
    }

    const searchAddress = $id("search-target-depth1");
    if (searchAddress) searchAddress.onchange = async () => {
        const addressId = toNumOrNull(getVal("search-target-depth1"));
        await loadAddress1Select(addressId, "search-target-depth2", { placeholder: "전체", placeholderValue: "-" });
    };
}

async function initModalAddressCascader() {
    await loadAddressSelect("address", { placeholder: "행정구역을 선택해 주세요", placeholderValue: "-" });
    fillSelect("address1", [], { placeholder: "시도군을 선택해 주세요", placeholderValue: "-" });

    const modalAddress = $id("address");
    if (modalAddress) modalAddress.onchange = async () => {
        const addressId = toNumOrNull(getVal("address"));
        await loadAddress1Select(addressId, "address1", { placeholder: "시도군을 선택해 주세요", placeholderValue: "-" });
    };
}

// 행정구역 조회
async function loadAddressSelect(selectId = "search-target-depth1", options = {}) {
    const resp = await fetchJson("/api/address");
    const items = normalizeList(resp, "address").map(x => ({
        id: x.id,
        name: x.name // label: 지역명
    }));
    fillSelect(selectId, items, { placeholder: "행정구역을 선택해 주세요", placeholderValue: "-", ...options });
}

// 시도군 조회
async function loadAddress1Select(addressId, selectId = "search-target-depth2", options = {}) {
    if (!addressId) {
        fillSelect(selectId, [], { placeholder: "전체", placeholderValue: "-", ...options });
        return;
    }
    const resp = await fetchJson(`/api/address/${addressId}/`);
    const items = normalizeList(resp, "address").map(x => ({
        id: x.id,
        name: x.name // label: 지역명
    }));
    fillSelect(selectId, items, { placeholder: "시군구를 선택해 주세요", placeholderValue: "-", ...options });
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

        const apartId = modalEl.dataset.apartId;
        const ResignDate = $('input[type="hidden"][name="assign-date"]').val()?.trim() ?? "";
        await resignApart(apartId, ResignDate);

        alert(" 삭제 처리가 완료되었습니다.");

        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();

        reloadApartfTable("apartDataTable");

    } catch (err) {
        console.error(err);
        alert(err.message || "삭제 처리 중 오류가 발생했습니다.");
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
        btn.dataset.submitting = "false";
    }
}

