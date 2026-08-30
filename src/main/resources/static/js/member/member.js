import { loadDataTable } from "../common/datatable-handler.js";
import { fillSelect, loadApartSelect, initSearchAddressCascader } from "../common/search-filters.js";

const MemberModalState = {
    mode: "create",
    memberId: null,
};

let isSubmitting = false;

document.addEventListener("DOMContentLoaded", async () => {
    await initSearchAddressCascader();

    reloadMemberTable("memberDataTable");

    document.querySelector('button.management-btn[data-bs-target="#user-modal"]')
        ?.addEventListener("click", () => {
            void openCreateModal();
        });

    document.addEventListener("click", async (e) => {
        const editBtn = e.target.closest('[data-action="edit-member"]');
        if (editBtn) {
            const memberId = editBtn.getAttribute("data-member-id");
            if (!memberId) return;

            const modal = bootstrap.Modal.getOrCreateInstance($id("user-modal"));
            await openEditModal(memberId);
            modal.show();
            return;
        }

        const confirmBtn = e.target.closest('[data-action="confirm-member"]');
        if (confirmBtn) {
            const memberId = confirmBtn.getAttribute("data-member-id");
            if (memberId) await confirmMemberWithButton(memberId, confirmBtn);
            return;
        }

        const resignBtn = e.target.closest('[data-action="resign-member"]');
        if (resignBtn) {
            const memberId = resignBtn.getAttribute("data-member-id");
            if (memberId) openResignModal(memberId);
        }
    });

    bindSearchHandlers();
    bindResignConfirmHandler();

    $id("user-modal")?.addEventListener("hidden.bs.modal", () => {
        resetMemberModal();
        MemberModalState.mode = "create";
        MemberModalState.memberId = null;
    });

    $id("resign-modal")?.addEventListener("hidden.bs.modal", () => {
        const modalEl = $id("resign-modal");
        if (modalEl) delete modalEl.dataset.memberId;
        setResignSubmitting(false);
    });
});

function bindSearchHandlers() {
    const runSearch = () => {
        const $table = $("#memberDataTable");
        if ($.fn.DataTable.isDataTable($table)) {
            $table.DataTable().ajax.reload(null, true);
            return;
        }
        reloadMemberTable("memberDataTable");
    };

    $id("btn-search")?.addEventListener("click", runSearch);
    $id("btn-reset")?.addEventListener("click", async () => {
        setVal("search-target-depth1", "-");
        setVal("search-target-apart", "-");
        fillSelect("search-target-depth2", [], { placeholder: "전체", placeholderValue: "-" });
        setVal("target-text", "");
        await initSearchAddressCascader();
        runSearch();
    });

    $id("target-text")?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            runSearch();
        }
    });
}

function reloadMemberTable(tableId) {
    loadDataTable({
        tableId,
        ajaxUrl: "/api/member",
        columns: getMemberTableColumns(),
        defaultOrderIndex: null,
        minTableWidth: 1100,
        getExtraDataFn: () => {
            const params = {};
            const keyword = getVal("target-text").trim();
            const apartId = getVal("search-target-apart");

            if (keyword) params.search_NAME_LIKE = keyword;
            if (apartId && apartId !== "-") params.search_APART_ID_IS = Number(apartId);

            return params;
        },
        enableOrdering: false,
        mobileBreakpoint: 640,
        enableCardView: true,
        enableResponsive: false,
        titleColumnName: "이름",
        extraOptions: {
            dom: "rtip",
        },
    });
}

function getMemberTableColumns() {
    return [
        {
            data: null,
            title: "#",
            className: "data-txt",
            orderable: false,
            width: "4%",
            render: (data, type, row, meta) => {
                const start = meta?.settings?._iDisplayStart ?? 0;
                return start + meta.row + 1;
            },
        },
        {
            data: "login",
            title: "ID",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (data) => escapeHtml(data ?? "-"),
        },
        {
            data: "name",
            title: "이름",
            className: "data-txt",
            orderable: false,
            width: "10%",
            render: (data) => escapeHtml(data ?? "-"),
        },
        {
            data: "apartName",
            title: "아파트",
            className: "data-txt",
            orderable: false,
            width: "15%",
            render: (data) => escapeHtml(data ?? "-"),
        },
        {
            data: "mobile",
            title: "휴대폰",
            className: "data-txt",
            orderable: false,
            width: "12%",
            render: (data) => escapeHtml(data ?? "-"),
        },
        {
            data: "email",
            title: "이메일",
            className: "data-txt",
            orderable: false,
            width: "18%",
            render: (data) => escapeHtml(data ?? "-"),
        },
        {
            data: null,
            title: "승인",
            className: "data-txt",
            orderable: false,
            width: "8%",
            render: (data, type, row) => renderBadge(row.confirmed, "승인", "대기"),
        },
        {
            data: null,
            title: "상태",
            className: "data-txt",
            orderable: false,
            width: "8%",
            render: (data, type, row) => renderBadge(row.activated, "활성", "해지"),
        },
        {
            data: "btnActions",
            title: "작업",
            className: "bt-box",
            orderable: false,
            width: "15%",
            render: (data, type, row) => {
                if (!Array.isArray(row.btnActions) || row.btnActions.length === 0) return "-";

                const buttons = [];
                if (row.btnActions.includes("EDIT")) {
                    buttons.push(`
                        <button type="button" class="btn btn-outline-secondary"
                            data-action="edit-member" data-member-id="${row.id}">
                            수정
                        </button>
                    `);
                }
                if (row.btnActions.includes("CONFIRMED")) {
                    buttons.push(`
                        <button type="button" class="btn btn-primary"
                            data-action="confirm-member" data-member-id="${row.id}">
                            승인
                        </button>
                    `);
                }
                if (row.btnActions.includes("RESIGN")) {
                    buttons.push(`
                        <button type="button" class="btn btn-danger"
                            data-action="resign-member" data-member-id="${row.id}">
                            해지
                        </button>
                    `);
                }

                return buttons.join(" ");
            },
        },
    ];
}

async function openCreateModal() {
    MemberModalState.mode = "create";
    MemberModalState.memberId = null;
    resetMemberModal();
    paintModalUiByMode();
    await loadApartSelect({
        selectId: "apartId",
        useAddressFilters: false,
        placeholder: "아파트를 선택해 주세요",
    });
    setConfirmHandler(handleCreateConfirm);
}

async function openEditModal(memberId) {
    MemberModalState.mode = "edit";
    MemberModalState.memberId = memberId;
    resetMemberModal();
    paintModalUiByMode();

    const detail = await fetchJson(`/api/member/${memberId}`);
    const member = detail?.data ?? {};
    await loadApartSelect({
        selectId: "apartId",
        useAddressFilters: false,
        placeholder: "아파트를 선택해 주세요",
    });

    setVal("login", member.login ?? "");
    setVal("name", member.name ?? "");
    setVal("email", member.email ?? "");
    setVal("mobile", member.mobile ?? "");
    setVal("apartId", member.apartId == null ? "-" : String(member.apartId));
    setVal("address", member.address ?? "");
    setVal("zipcode", member.zipcode ?? "");
    setVal("birthday", member.birthday ?? "");
    setSelectedSex(member.sex);
    setChecked("confirmed", Number(member.confirmed) === 1);
    setChecked("activated", Number(member.activated) !== 0);

    setConfirmHandler(handleEditConfirm);
}

function paintModalUiByMode() {
    const titleEl = $id("user-modal-title");
    const confirmBtn = $id("user-confirm");
    const loginInput = $id("login");
    const passwordInput = $id("password");
    const pwCheckInput = $id("pw-check");

    if (MemberModalState.mode === "create") {
        if (titleEl) titleEl.textContent = "회원 등록";
        if (confirmBtn) confirmBtn.textContent = "등록";
        if (loginInput) loginInput.readOnly = false;
        if (passwordInput) passwordInput.placeholder = "비밀번호를 입력해 주세요";
        if (pwCheckInput) pwCheckInput.placeholder = "비밀번호를 다시 입력해 주세요";
    } else {
        if (titleEl) titleEl.textContent = "회원 정보 수정";
        if (confirmBtn) confirmBtn.textContent = "저장";
        if (loginInput) loginInput.readOnly = true;
        if (passwordInput) passwordInput.placeholder = "변경할 때만 입력해 주세요";
        if (pwCheckInput) pwCheckInput.placeholder = "변경할 때만 다시 입력해 주세요";
    }
}

function setConfirmHandler(fn) {
    const btn = $id("user-confirm");
    if (!btn) return;
    btn.replaceWith(btn.cloneNode(true));
    $id("user-confirm")?.addEventListener("click", fn);
}

async function handleCreateConfirm(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isSubmitting) return;

    setSubmitting(true);
    try {
        const payload = buildCreatePayload();
        await postCreateMember(payload);
        alert("회원이 등록되었습니다.");
        closeMemberModal();
        reloadMemberTable("memberDataTable");
    } catch (err) {
        console.error(err);
        setFormMessage(err.message || "등록 중 오류가 발생했습니다.", "invalid");
        alert(err.message || "등록 중 오류가 발생했습니다.");
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
        const payload = buildUpdatePayload();
        await putUpdateMember(MemberModalState.memberId, payload);
        alert("변경사항이 저장되었습니다.");
        closeMemberModal();
        reloadMemberTable("memberDataTable");
    } catch (err) {
        console.error(err);
        setFormMessage(err.message || "수정 중 오류가 발생했습니다.", "invalid");
        alert(err.message || "수정 중 오류가 발생했습니다.");
    } finally {
        setSubmitting(false);
    }
}

function buildCreatePayload() {
    const payload = buildBasePayload();
    payload.login = getVal("login").trim();
    payload.password = getVal("password");

    const pwCheck = getVal("pw-check");
    if (!payload.login) throw new Error("아이디를 입력해 주세요.");
    if (!payload.password) throw new Error("비밀번호를 입력해 주세요.");
    if (!same(payload.password, pwCheck)) throw new Error("비밀번호가 일치하지 않습니다.");

    return payload;
}

function buildUpdatePayload() {
    if (!MemberModalState.memberId) throw new Error("수정 대상을 찾을 수 없습니다.");

    const payload = buildBasePayload();
    payload.login = getVal("login").trim();

    const password = getVal("password");
    const pwCheck = getVal("pw-check");
    if (password || pwCheck) {
        if (!password) throw new Error("새 비밀번호를 입력해 주세요.");
        if (!same(password, pwCheck)) throw new Error("비밀번호가 일치하지 않습니다.");
        payload.password = password;
    }

    return payload;
}

function buildBasePayload() {
    const name = getVal("name").trim();
    const apartId = toNumOrNull(getVal("apartId"));

    if (!name) throw new Error("이름을 입력해 주세요.");
    if (apartId == null) throw new Error("아파트를 선택해 주세요.");

    return {
        name,
        email: getVal("email").trim(),
        mobile: getVal("mobile").trim(),
        apartId,
        address: getVal("address").trim(),
        zipcode: getVal("zipcode").trim(),
        sex: getSelectedSex(),
        birthday: getVal("birthday").trim(),
        confirmed: isChecked("confirmed") ? 1 : 0,
        activated: isChecked("activated") ? 1 : 0,
    };
}

async function confirmMemberWithButton(memberId, btn) {
    if (!confirm("해당 회원을 승인 처리하시겠습니까?")) return;

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "처리 중...";

    try {
        await putConfirmMember(memberId);
        alert("승인 처리되었습니다.");
        reloadMemberTable("memberDataTable");
    } catch (err) {
        console.error(err);
        alert(err.message || "승인 처리 중 오류가 발생했습니다.");
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

function openResignModal(memberId) {
    const modalEl = $id("resign-modal");
    if (!modalEl) return;

    modalEl.dataset.memberId = memberId;
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function bindResignConfirmHandler() {
    $id("resign-confirm")?.addEventListener("click", handleResignConfirm);
}

async function handleResignConfirm(e) {
    e.preventDefault();
    e.stopPropagation();

    const modalEl = $id("resign-modal");
    const memberId = modalEl?.dataset.memberId;
    if (!memberId) return;

    setResignSubmitting(true);
    try {
        await putResignMember(memberId);
        alert("해지 처리되었습니다.");
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        reloadMemberTable("memberDataTable");
    } catch (err) {
        console.error(err);
        alert(err.message || "해지 처리 중 오류가 발생했습니다.");
    } finally {
        setResignSubmitting(false);
    }
}

async function postCreateMember(payload) {
    return parseMutationResponse(await postWithCsrf("/api/member", payload), "회원 등록에 실패했습니다.");
}

async function putUpdateMember(memberId, payload) {
    return parseMutationResponse(await putWithCsrf(`/api/member/${memberId}`, payload), "회원 수정에 실패했습니다.");
}

async function putConfirmMember(memberId) {
    return parseMutationResponse(await putWithCsrf(`/api/member/${memberId}/confirmed`, ""), "승인 처리에 실패했습니다.");
}

async function putResignMember(memberId) {
    return parseMutationResponse(await putWithCsrf(`/api/member/${memberId}/resign`, ""), "해지 처리에 실패했습니다.");
}

async function parseMutationResponse(res, fallbackMessage) {
    const body = await res.json().catch(() => null);
    if (!res.ok || body?.success === false) {
        throw new Error(body?.message || body?.data?.message || fallbackMessage);
    }
    return body?.data;
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
    if (!res.ok || data?.success === false) {
        throw new Error(data?.message || `${res.status} ${res.statusText}`);
    }
    return data;
}

function getCsrf() {
    const token = document.querySelector('meta[name="_csrf"]')?.getAttribute("content");
    const header = document.querySelector('meta[name="_csrf_header"]')?.getAttribute("content") || "X-CSRF-TOKEN";
    return token ? { header, token } : null;
}

function resetMemberModal() {
    ["login", "password", "pw-check", "name", "email", "mobile", "address", "zipcode", "birthday"].forEach((id) => {
        setVal(id, "");
    });
    setVal("apartId", "-");
    setSelectedSex("");
    setChecked("confirmed", false);
    setChecked("activated", true);
    setFormMessage();

    const loginInput = $id("login");
    if (loginInput) loginInput.readOnly = false;
}

function closeMemberModal() {
    const modalEl = $id("user-modal");
    if (!modalEl) return;
    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
}

function setSubmitting(on) {
    isSubmitting = on;
    const btn = $id("user-confirm");
    if (!btn) return;

    if (on) {
        btn.disabled = true;
        btn.dataset.originalText = btn.textContent;
        btn.textContent = "처리 중...";
        return;
    }

    btn.disabled = false;
    if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
}

function setResignSubmitting(on) {
    const btn = $id("resign-confirm");
    if (!btn) return;

    if (on) {
        btn.disabled = true;
        btn.dataset.originalText = btn.textContent;
        btn.textContent = "처리 중...";
        return;
    }

    btn.disabled = false;
    if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
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

function setFormMessage(message = "", type = "") {
    const el = $id("user-form-message");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("text-danger", type === "invalid");
    el.classList.toggle("text-success", type === "valid");
}

function renderBadge(value, activeText, inactiveText) {
    const active = Number(value) === 1;
    const cls = active ? "bg-success" : "bg-secondary";
    const text = active ? activeText : inactiveText;
    return `<span class="badge ${cls}">${text}</span>`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function $id(id) {
    return document.getElementById(id);
}

function getVal(id) {
    return $id(id)?.value ?? "";
}

function setVal(id, value) {
    const el = $id(id);
    if (el) el.value = value;
}

function isChecked(id) {
    return Boolean($id(id)?.checked);
}

function setChecked(id, checked) {
    const el = $id(id);
    if (el) el.checked = checked;
}

function toNumOrNull(value) {
    return value === "" || value === "-" || value == null ? null : Number(value);
}

function same(a, b) {
    return String(a) === String(b);
}
