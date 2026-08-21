import { loadDataTable } from "../common/datatable-handler.js";

const RefundModalState = {
    paymentChecked: false,
    checkedPaymentId: null,
};

let isRefundSubmitting = false;

const REFUND_STATUS_LABELS = {
    REQUESTED: { text: "요청", cls: "bg-warning" },
    PROCESSING: { text: "처리중", cls: "bg-info" },
    COMPLETED: { text: "완료", cls: "bg-success" },
    FAILED: { text: "실패", cls: "bg-danger" },
};

document.addEventListener("DOMContentLoaded", () => {
    reloadRefundTable("refundDataTable");

    document.addEventListener("click", (e) => {
        const processBtn = e.target.closest('[data-action="process-refund"]');
        if (processBtn) {
            const refundId = processBtn.getAttribute("data-refund-id");
            if (refundId) openProcessModal(refundId);
            return;
        }

        const completeBtn = e.target.closest('[data-action="complete-refund"]');
        if (completeBtn) {
            const refundId = completeBtn.getAttribute("data-refund-id");
            if (refundId) openCompleteModal(refundId);
            return;
        }

        const failBtn = e.target.closest('[data-action="fail-refund"]');
        if (failBtn) {
            const refundId = failBtn.getAttribute("data-refund-id");
            if (refundId) openFailModal(refundId);
        }
    });

    bindSearchHandlers();
    bindRefundModalHandlers();
    bindProcessHandlers();
    bindCompleteHandlers();
    bindFailHandlers();

    $id("refund-modal")?.addEventListener("hidden.bs.modal", resetRefundModal);
    $id("refund-process-modal")?.addEventListener("hidden.bs.modal", () => {
        delete $id("refund-process-modal").dataset.refundId;
    });
    $id("refund-complete-modal")?.addEventListener("hidden.bs.modal", () => {
        delete $id("refund-complete-modal").dataset.refundId;
    });
    $id("refund-fail-modal")?.addEventListener("hidden.bs.modal", () => {
        delete $id("refund-fail-modal").dataset.refundId;
    });
});

/* ------------------------- 검색 / 목록 ------------------------- */

function bindSearchHandlers() {
    const runSearch = () => {
        const $table = $("#refundDataTable");
        if ($.fn.DataTable.isDataTable($table)) {
            $table.DataTable().ajax.reload(null, true);
            return;
        }
        reloadRefundTable("refundDataTable");
    };

    $id("btn-search")?.addEventListener("click", runSearch);
    $id("btn-reset")?.addEventListener("click", () => {
        setVal("search-status", "-");
        setVal("search-order-id", "");
        setVal("target-text", "");
        runSearch();
    });

    $id("target-text")?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            runSearch();
        }
    });

    $id("search-status")?.addEventListener("change", runSearch);
}

function reloadRefundTable(tableId) {
    loadDataTable({
        tableId,
        ajaxUrl: "/api/refunds",
        columns: getRefundTableColumns(),
        defaultOrderIndex: null,
        minTableWidth: 1300,
        getExtraDataFn: () => {
            const params = {};
            const refundNo = getVal("target-text").trim();
            const status = getVal("search-status");
            const orderId = getVal("search-order-id");

            if (refundNo) params.search_REFUND_NO_LIKE = refundNo;
            if (status && status !== "-") params.search_REFUND_STATUS_IS = status;
            if (orderId) params.search_ORDER_ID_IS = Number(orderId);

            return params;
        },
        enableOrdering: false,
        mobileBreakpoint: 640,
        enableCardView: true,
        enableResponsive: false,
        titleColumnName: "환불번호",
        extraOptions: { dom: "rtip" },
    });
}

function getRefundTableColumns() {
    return [
        {
            data: null,
            title: "#",
            className: "data-txt",
            orderable: false,
            width: "3%",
            render: (data, type, row, meta) => (meta?.settings?._iDisplayStart ?? 0) + meta.row + 1,
        },
        { data: "refundNo", title: "환불번호", className: "data-txt", orderable: false, width: "10%", render: (v) => escapeHtml(v ?? "-") },
        { data: "orderNo", title: "주문번호", className: "data-txt", orderable: false, width: "10%", render: (v) => escapeHtml(v ?? "-") },
        { data: "memberName", title: "회원", className: "data-txt", orderable: false, width: "8%", render: (v) => escapeHtml(v ?? "-") },
        { data: "refundAmount", title: "환불금액", className: "data-txt", orderable: false, width: "9%", render: (v) => formatAmount(v) },
        { data: "refundReason", title: "사유", className: "data-txt", orderable: false, width: "16%", render: (v) => escapeHtml(v ?? "-") },
        {
            data: "refundStatus",
            title: "상태",
            className: "data-txt",
            orderable: false,
            width: "8%",
            render: (v) => renderStatusBadge(v),
        },
        { data: "requestedAt", title: "요청일시", className: "data-txt", orderable: false, width: "10%", render: (v) => escapeHtml(v ?? "-") },
        { data: "completedAt", title: "완료일시", className: "data-txt", orderable: false, width: "10%", render: (v) => escapeHtml(v ?? "-") },
        {
            data: "btnActions",
            title: "작업",
            className: "bt-box",
            orderable: false,
            width: "16%",
            render: (data, type, row) => {
                if (!Array.isArray(row.btnActions) || row.btnActions.length === 0) return "-";

                const buttons = [];
                if (row.btnActions.includes("PROCESS")) {
                    buttons.push(`<button type="button" class="btn btn-warning" data-action="process-refund" data-refund-id="${row.id}">처리시작</button>`);
                }
                if (row.btnActions.includes("COMPLETE")) {
                    buttons.push(`<button type="button" class="btn btn-success" data-action="complete-refund" data-refund-id="${row.id}">완료처리</button>`);
                }
                if (row.btnActions.includes("FAIL")) {
                    buttons.push(`<button type="button" class="btn btn-danger" data-action="fail-refund" data-refund-id="${row.id}">실패처리</button>`);
                }

                return buttons.join(" ") || "-";
            },
        },
    ];
}

/* ------------------------- 환불 신청 모달 ------------------------- */

function bindRefundModalHandlers() {
    $id("refund-payment-check")?.addEventListener("click", handlePaymentCheck);
    $id("refund-confirm")?.addEventListener("click", handleRefundCreateConfirm);
}

async function handlePaymentCheck() {
    const paymentId = toNumOrNull(getVal("refund-paymentId"));
    const infoEl = $id("refund-payment-info");
    RefundModalState.paymentChecked = false;
    RefundModalState.checkedPaymentId = null;

    if (!paymentId) {
        if (infoEl) {
            infoEl.textContent = "결제 ID를 입력해 주세요.";
            infoEl.classList.remove("text-success");
            infoEl.classList.add("text-danger");
        }
        return;
    }

    try {
        const resp = await fetchJson(`/api/payments/${paymentId}`);
        const payment = resp?.data ?? {};

        if (payment.paymentStatus !== "APPROVED") {
            throw new Error("승인된 결제만 환불 신청이 가능합니다.");
        }

        if (infoEl) {
            infoEl.textContent = `주문번호: ${payment.orderNo ?? "-"} / 회원: ${payment.memberName ?? "-"} / 결제금액: ${formatAmount(payment.amount)}원 / 상태: 승인`;
            infoEl.classList.remove("text-danger");
            infoEl.classList.add("text-success");
        }

        if (!getVal("refund-amount")) {
            setVal("refund-amount", payment.amount ?? "");
        }

        RefundModalState.paymentChecked = true;
        RefundModalState.checkedPaymentId = paymentId;
    } catch (err) {
        console.error(err);
        if (infoEl) {
            infoEl.textContent = err.message || "해당 결제를 찾을 수 없습니다.";
            infoEl.classList.remove("text-success");
            infoEl.classList.add("text-danger");
        }
    }
}

async function handleRefundCreateConfirm(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isRefundSubmitting) return;

    setRefundSubmitting(true);
    try {
        const paymentId = toNumOrNull(getVal("refund-paymentId"));
        const refundAmount = toNumOrNull(getVal("refund-amount"));

        if (paymentId == null) throw new Error("결제 ID를 입력해 주세요.");
        if (!RefundModalState.paymentChecked || RefundModalState.checkedPaymentId !== paymentId) {
            throw new Error("확인 버튼으로 결제 정보를 먼저 확인해 주세요.");
        }
        if (refundAmount == null) throw new Error("환불금액을 입력해 주세요.");

        const payload = {
            paymentId,
            refundAmount,
            refundReasonCode: getVal("refund-reasonCode"),
            refundReason: getVal("refund-reason").trim(),
        };

        const res = await postWithCsrf("/api/refunds", payload);
        await parseMutationResponse(res, "환불 신청에 실패했습니다.");
        alert("환불이 신청되었습니다.");
        closeRefundModal();
        reloadRefundTable("refundDataTable");
    } catch (err) {
        console.error(err);
        setRefundFormMessage(err.message || "환불 신청 중 오류가 발생했습니다.", "invalid");
        alert(err.message || "환불 신청 중 오류가 발생했습니다.");
    } finally {
        setRefundSubmitting(false);
    }
}

function resetRefundModal() {
    setVal("refund-paymentId", "");
    setVal("refund-amount", "");
    setVal("refund-reasonCode", "CHANGE_OF_MIND");
    setVal("refund-reason", "");
    const infoEl = $id("refund-payment-info");
    if (infoEl) {
        infoEl.textContent = "";
        infoEl.classList.remove("text-danger", "text-success");
    }
    setRefundFormMessage();
    RefundModalState.paymentChecked = false;
    RefundModalState.checkedPaymentId = null;
}

function closeRefundModal() {
    const modalEl = $id("refund-modal");
    if (!modalEl) return;
    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
}

function setRefundSubmitting(on) {
    isRefundSubmitting = on;
    const btn = $id("refund-confirm");
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

function setRefundFormMessage(message = "", type = "") {
    const el = $id("refund-form-message");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("text-danger", type === "invalid");
}

/* ------------------------- 처리시작 ------------------------- */

function bindProcessHandlers() {
    $id("refund-process-confirm")?.addEventListener("click", handleProcessConfirm);
}

function openProcessModal(refundId) {
    const modalEl = $id("refund-process-modal");
    if (!modalEl) return;
    modalEl.dataset.refundId = refundId;
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

async function handleProcessConfirm(e) {
    e.preventDefault();
    e.stopPropagation();

    const modalEl = $id("refund-process-modal");
    const refundId = modalEl?.dataset.refundId;
    if (!refundId) return;

    const btn = $id("refund-process-confirm");
    const originalText = btn?.textContent;
    if (btn) {
        btn.disabled = true;
        btn.textContent = "처리 중...";
    }

    try {
        const res = await putWithCsrf(`/api/refunds/${refundId}/process`);
        await parseMutationResponse(res, "환불 처리 시작에 실패했습니다.");
        alert("처리중 상태로 변경되었습니다.");
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        reloadRefundTable("refundDataTable");
    } catch (err) {
        console.error(err);
        alert(err.message || "환불 처리 시작 중 오류가 발생했습니다.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
}

/* ------------------------- 완료 처리 ------------------------- */

function bindCompleteHandlers() {
    $id("refund-complete-confirm")?.addEventListener("click", handleCompleteConfirm);
}

function openCompleteModal(refundId) {
    const modalEl = $id("refund-complete-modal");
    if (!modalEl) return;
    modalEl.dataset.refundId = refundId;
    setVal("refund-complete-pgCancelId", "");
    setVal("refund-complete-resultCode", "");
    setVal("refund-complete-resultMessage", "");
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

async function handleCompleteConfirm(e) {
    e.preventDefault();
    e.stopPropagation();

    const modalEl = $id("refund-complete-modal");
    const refundId = modalEl?.dataset.refundId;
    if (!refundId) return;

    const btn = $id("refund-complete-confirm");
    const originalText = btn?.textContent;
    if (btn) {
        btn.disabled = true;
        btn.textContent = "처리 중...";
    }

    try {
        const payload = {
            pgCancelId: getVal("refund-complete-pgCancelId").trim(),
            resultCode: getVal("refund-complete-resultCode").trim(),
            resultMessage: getVal("refund-complete-resultMessage").trim(),
        };
        const res = await putWithCsrf(`/api/refunds/${refundId}/complete`, payload);
        await parseMutationResponse(res, "환불 완료 처리에 실패했습니다.");
        alert("환불이 완료 처리되었습니다.");
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        reloadRefundTable("refundDataTable");
    } catch (err) {
        console.error(err);
        alert(err.message || "환불 완료 처리 중 오류가 발생했습니다.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
}

/* ------------------------- 실패 처리 ------------------------- */

function bindFailHandlers() {
    $id("refund-fail-confirm")?.addEventListener("click", handleFailConfirm);
}

function openFailModal(refundId) {
    const modalEl = $id("refund-fail-modal");
    if (!modalEl) return;
    modalEl.dataset.refundId = refundId;
    setVal("refund-fail-resultCode", "");
    setVal("refund-fail-resultMessage", "");
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

async function handleFailConfirm(e) {
    e.preventDefault();
    e.stopPropagation();

    const modalEl = $id("refund-fail-modal");
    const refundId = modalEl?.dataset.refundId;
    if (!refundId) return;

    const btn = $id("refund-fail-confirm");
    const originalText = btn?.textContent;
    if (btn) {
        btn.disabled = true;
        btn.textContent = "처리 중...";
    }

    try {
        const payload = {
            resultCode: getVal("refund-fail-resultCode").trim(),
            resultMessage: getVal("refund-fail-resultMessage").trim(),
        };
        const res = await putWithCsrf(`/api/refunds/${refundId}/fail`, payload);
        await parseMutationResponse(res, "환불 실패 처리에 실패했습니다.");
        alert("환불이 실패 처리되었습니다.");
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        reloadRefundTable("refundDataTable");
    } catch (err) {
        console.error(err);
        alert(err.message || "환불 실패 처리 중 오류가 발생했습니다.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
}

/* ------------------------- 공통 유틸 ------------------------- */

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

function renderStatusBadge(status) {
    const meta = REFUND_STATUS_LABELS[status] ?? { text: status ?? "-", cls: "bg-secondary" };
    return `<span class="badge ${meta.cls}">${escapeHtml(meta.text)}</span>`;
}

function formatAmount(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return "0";
    return num.toLocaleString("ko-KR");
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

function toNumOrNull(value) {
    return value === "" || value === "-" || value == null ? null : Number(value);
}
