import { loadDataTable } from "../common/datatable-handler.js";
import { loadApartSelect, initSearchAddressCascader } from "../common/search-filters.js";

const OrderModalState = {
    mode: "create",
    orderId: null,
    memberChecked: false,
};

const PaymentModalState = {
    orderId: null,
    orderNo: null,
    orderName: null,
    paymentAmount: 0,
    activePaymentId: null,
    payments: [],
};

let isOrderSubmitting = false;
let isPaymentActionSubmitting = false;

const STATUS_LABELS = {
    READY: { text: "준비", cls: "bg-secondary" },
    PAYMENT_PENDING: { text: "결제대기", cls: "bg-warning" },
    PAID: { text: "결제완료", cls: "bg-success" },
    CANCELLED: { text: "취소", cls: "bg-dark" },
    REFUNDED: { text: "환불", cls: "bg-danger" },
    REQUESTED: { text: "요청", cls: "bg-warning" },
    APPROVED: { text: "승인", cls: "bg-success" },
    FAILED: { text: "실패", cls: "bg-danger" },
    PARTIAL_CANCELLED: { text: "부분취소", cls: "bg-danger" },
};

document.addEventListener("DOMContentLoaded", async () => {
    await initSearchAddressCascader();
    await loadApartSelect({ selectId: "order-apartId", useAddressFilters: false, placeholder: "아파트를 선택해 주세요" });

    reloadOrderTable("orderDataTable");

    document.querySelector('button.management-btn[data-bs-target="#order-modal"]')
        ?.addEventListener("click", () => {
            void openCreateOrderModal();
        });

    document.addEventListener("click", async (e) => {
        const editBtn = e.target.closest('[data-action="edit-order"]');
        if (editBtn) {
            const orderId = editBtn.getAttribute("data-order-id");
            if (!orderId) return;
            const modal = bootstrap.Modal.getOrCreateInstance($id("order-modal"));
            await openEditOrderModal(orderId);
            modal.show();
            return;
        }

        const cancelBtn = e.target.closest('[data-action="cancel-order"]');
        if (cancelBtn) {
            const orderId = cancelBtn.getAttribute("data-order-id");
            if (orderId) openCancelOrderModal(orderId);
            return;
        }

        const paymentsBtn = e.target.closest('[data-action="view-payments"]');
        if (paymentsBtn) {
            const orderId = paymentsBtn.getAttribute("data-order-id");
            if (!orderId) return;
            const modal = bootstrap.Modal.getOrCreateInstance($id("payment-modal"));
            await openPaymentModal(
                orderId,
                paymentsBtn.getAttribute("data-order-no") || "",
                paymentsBtn.getAttribute("data-order-name") || "",
                Number(paymentsBtn.getAttribute("data-payment-amount") || 0),
            );
            modal.show();
        }
    });

    bindSearchHandlers();
    bindOrderModalHandlers();
    bindOrderCancelHandlers();
    bindPaymentModalHandlers();

    $id("order-modal")?.addEventListener("hidden.bs.modal", () => {
        resetOrderModal();
        OrderModalState.mode = "create";
        OrderModalState.orderId = null;
        OrderModalState.memberChecked = false;
    });

    $id("order-cancel-modal")?.addEventListener("hidden.bs.modal", () => {
        delete $id("order-cancel-modal").dataset.orderId;
    });

    $id("payment-modal")?.addEventListener("hidden.bs.modal", () => {
        resetPaymentPanels();
        PaymentModalState.orderId = null;
        PaymentModalState.payments = [];
    });
});

/* ------------------------- 검색 / 목록 ------------------------- */

function bindSearchHandlers() {
    const runSearch = () => {
        const $table = $("#orderDataTable");
        if ($.fn.DataTable.isDataTable($table)) {
            $table.DataTable().ajax.reload(null, true);
            return;
        }
        reloadOrderTable("orderDataTable");
    };

    $id("btn-search")?.addEventListener("click", runSearch);
    $id("btn-reset")?.addEventListener("click", async () => {
        setVal("search-target-depth1", "-");
        setVal("search-target-apart", "-");
        fillSelect("search-target-depth2", [], { placeholder: "전체", placeholderValue: "-" });
        setVal("search-status", "-");
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

    $id("search-status")?.addEventListener("change", runSearch);
    $id("search-target-apart")?.addEventListener("change", runSearch);
}

function reloadOrderTable(tableId) {
    loadDataTable({
        tableId,
        ajaxUrl: "/api/orders",
        columns: getOrderTableColumns(),
        defaultOrderIndex: null,
        minTableWidth: 1200,
        getExtraDataFn: () => {
            const params = {};
            const orderNo = getVal("target-text").trim();
            const apartId = getVal("search-target-apart");
            const status = getVal("search-status");

            if (orderNo) params.search_ORDER_NO_LIKE = orderNo;
            if (apartId && apartId !== "-") params.search_APART_ID_IS = Number(apartId);
            if (status && status !== "-") params.search_ORDER_STATUS_IS = status;

            return params;
        },
        enableOrdering: false,
        mobileBreakpoint: 640,
        enableCardView: true,
        enableResponsive: false,
        titleColumnName: "주문명",
        extraOptions: { dom: "rtip" },
    });
}

function getOrderTableColumns() {
    return [
        {
            data: null,
            title: "#",
            className: "data-txt",
            orderable: false,
            width: "3%",
            render: (data, type, row, meta) => (meta?.settings?._iDisplayStart ?? 0) + meta.row + 1,
        },
        { data: "orderNo", title: "주문번호", className: "data-txt", orderable: false, width: "10%", render: (v) => escapeHtml(v ?? "-") },
        { data: "memberName", title: "회원", className: "data-txt", orderable: false, width: "8%", render: (v) => escapeHtml(v ?? "-") },
        { data: "apartName", title: "아파트", className: "data-txt", orderable: false, width: "12%", render: (v) => escapeHtml(v ?? "-") },
        { data: "orderName", title: "주문명", className: "data-txt", orderable: false, width: "16%", render: (v) => escapeHtml(v ?? "-") },
        { data: "orderAmount", title: "주문금액", className: "data-txt", orderable: false, width: "8%", render: (v) => formatAmount(v) },
        { data: "discountAmount", title: "할인금액", className: "data-txt", orderable: false, width: "8%", render: (v) => formatAmount(v) },
        { data: "paymentAmount", title: "결제금액", className: "data-txt", orderable: false, width: "8%", render: (v) => formatAmount(v) },
        {
            data: "orderStatus",
            title: "상태",
            className: "data-txt",
            orderable: false,
            width: "8%",
            render: (v) => renderStatusBadge(v),
        },
        { data: "orderedAt", title: "주문일시", className: "data-txt", orderable: false, width: "10%", render: (v) => escapeHtml(v ?? "-") },
        {
            data: "btnActions",
            title: "작업",
            className: "bt-box",
            orderable: false,
            width: "13%",
            render: (data, type, row) => {
                const buttons = [
                    `<button type="button" class="btn btn-outline-primary" data-action="view-payments"
                        data-order-id="${row.id}" data-order-no="${escapeAttr(row.orderNo)}"
                        data-order-name="${escapeAttr(row.orderName)}" data-payment-amount="${row.paymentAmount ?? 0}">
                        결제내역
                    </button>`,
                ];

                if (Array.isArray(row.btnActions) && row.btnActions.includes("EDIT")) {
                    buttons.push(`
                        <button type="button" class="btn btn-outline-secondary" data-action="edit-order" data-order-id="${row.id}">
                            수정
                        </button>
                    `);
                }
                if (Array.isArray(row.btnActions) && row.btnActions.includes("CANCEL")) {
                    buttons.push(`
                        <button type="button" class="btn btn-danger" data-action="cancel-order" data-order-id="${row.id}">
                            취소
                        </button>
                    `);
                }

                return buttons.join(" ");
            },
        },
    ];
}

/* ------------------------- 주소/아파트 선택 ------------------------- */

/* ------------------------- 주문 등록/수정 모달 ------------------------- */

function bindOrderModalHandlers() {
    $id("order-orderAmount")?.addEventListener("input", recalcOrderPaymentAmount);
    $id("order-discountAmount")?.addEventListener("input", recalcOrderPaymentAmount);
    $id("order-member-check")?.addEventListener("click", handleMemberCheck);
}

function recalcOrderPaymentAmount() {
    const orderAmount = Number(getVal("order-orderAmount")) || 0;
    const discountAmount = Number(getVal("order-discountAmount")) || 0;
    const paymentAmount = Math.max(orderAmount - discountAmount, 0);
    setVal("order-paymentAmount", formatAmount(paymentAmount));
}

async function handleMemberCheck() {
    const memberId = toNumOrNull(getVal("order-memberId"));
    const infoEl = $id("order-member-info");
    if (!memberId) {
        if (infoEl) {
            infoEl.textContent = "회원 ID를 입력해 주세요.";
            infoEl.classList.add("text-danger");
        }
        OrderModalState.memberChecked = false;
        return;
    }

    try {
        const resp = await fetchJson(`/api/member/${memberId}`);
        const member = resp?.data ?? {};
        if (infoEl) {
            infoEl.textContent = `회원명: ${member.name ?? "-"} (${member.login ?? "-"})`;
            infoEl.classList.remove("text-danger");
            infoEl.classList.add("text-success");
        }
        OrderModalState.memberChecked = true;
    } catch (err) {
        console.error(err);
        if (infoEl) {
            infoEl.textContent = "해당 회원을 찾을 수 없습니다.";
            infoEl.classList.remove("text-success");
            infoEl.classList.add("text-danger");
        }
        OrderModalState.memberChecked = false;
    }
}

async function openCreateOrderModal() {
    OrderModalState.mode = "create";
    OrderModalState.orderId = null;
    OrderModalState.memberChecked = false;
    resetOrderModal();
    paintOrderModalUiByMode();
    await loadApartSelect({ selectId: "order-apartId", useAddressFilters: false, placeholder: "아파트를 선택해 주세요" });
    setConfirmHandler(handleOrderCreateConfirm);
}

async function openEditOrderModal(orderId) {
    OrderModalState.mode = "edit";
    OrderModalState.orderId = orderId;
    OrderModalState.memberChecked = true;
    resetOrderModal();
    paintOrderModalUiByMode();
    await loadApartSelect({ selectId: "order-apartId", useAddressFilters: false, placeholder: "아파트를 선택해 주세요" });

    const resp = await fetchJson(`/api/orders/${orderId}`);
    const order = resp?.data ?? {};

    setVal("order-orderNo", order.orderNo ?? "");
    setVal("order-memberId", order.memberId ?? "");
    const infoEl = $id("order-member-info");
    if (infoEl) {
        infoEl.textContent = `회원명: ${order.memberName ?? "-"}`;
        infoEl.classList.remove("text-danger");
        infoEl.classList.add("text-success");
    }
    setVal("order-apartId", order.apartId == null ? "-" : String(order.apartId));
    setVal("order-lessonId", order.lessonId ?? "");
    setVal("order-orderName", order.orderName ?? "");
    setVal("order-orderAmount", order.orderAmount ?? "");
    setVal("order-discountAmount", order.discountAmount ?? 0);
    recalcOrderPaymentAmount();

    setConfirmHandler(handleOrderEditConfirm);
}

function paintOrderModalUiByMode() {
    const titleEl = $id("order-modal-title");
    const confirmBtn = $id("order-confirm");
    const memberIdInput = $id("order-memberId");
    const memberCheckBtn = $id("order-member-check");
    const statusRow = $id("order-status-row");

    if (OrderModalState.mode === "create") {
        if (titleEl) titleEl.textContent = "주문 등록";
        if (confirmBtn) confirmBtn.textContent = "등록";
        if (memberIdInput) memberIdInput.readOnly = false;
        if (memberCheckBtn) memberCheckBtn.disabled = false;
        if (statusRow) statusRow.classList.remove("d-none");
    } else {
        if (titleEl) titleEl.textContent = "주문 정보 수정";
        if (confirmBtn) confirmBtn.textContent = "저장";
        if (memberIdInput) memberIdInput.readOnly = true;
        if (memberCheckBtn) memberCheckBtn.disabled = true;
        if (statusRow) statusRow.classList.add("d-none");
    }
}

function setConfirmHandler(fn) {
    const btn = $id("order-confirm");
    if (!btn) return;
    btn.replaceWith(btn.cloneNode(true));
    $id("order-confirm")?.addEventListener("click", fn);
}

async function handleOrderCreateConfirm(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isOrderSubmitting) return;

    setOrderSubmitting(true);
    try {
        const payload = buildOrderPayload({ forCreate: true });
        const res = await postWithCsrf("/api/orders", payload);
        await parseMutationResponse(res, "주문 등록에 실패했습니다.");
        alert("주문이 등록되었습니다.");
        closeOrderModal();
        reloadOrderTable("orderDataTable");
    } catch (err) {
        console.error(err);
        setOrderFormMessage(err.message || "등록 중 오류가 발생했습니다.", "invalid");
        alert(err.message || "등록 중 오류가 발생했습니다.");
    } finally {
        setOrderSubmitting(false);
    }
}

async function handleOrderEditConfirm(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isOrderSubmitting) return;

    setOrderSubmitting(true);
    try {
        const payload = buildOrderPayload({ forCreate: false });
        const res = await putWithCsrf(`/api/orders/${OrderModalState.orderId}`, payload);
        await parseMutationResponse(res, "주문 수정에 실패했습니다.");
        alert("변경사항이 저장되었습니다.");
        closeOrderModal();
        reloadOrderTable("orderDataTable");
    } catch (err) {
        console.error(err);
        setOrderFormMessage(err.message || "수정 중 오류가 발생했습니다.", "invalid");
        alert(err.message || "수정 중 오류가 발생했습니다.");
    } finally {
        setOrderSubmitting(false);
    }
}

function buildOrderPayload({ forCreate }) {
    const orderName = getVal("order-orderName").trim();
    const orderAmount = toNumOrNull(getVal("order-orderAmount"));
    const discountAmount = toNumOrNull(getVal("order-discountAmount")) ?? 0;
    const apartId = toNumOrNull(getVal("order-apartId"));
    const lessonId = toNumOrNull(getVal("order-lessonId"));

    if (!orderName) throw new Error("주문명을 입력해 주세요.");
    if (orderAmount == null) throw new Error("주문금액을 입력해 주세요.");

    const payload = {
        apartId,
        lessonId,
        orderName,
        orderAmount,
        discountAmount,
    };

    if (forCreate) {
        const memberId = toNumOrNull(getVal("order-memberId"));
        if (memberId == null) throw new Error("회원 ID를 입력해 주세요.");
        if (!OrderModalState.memberChecked) throw new Error("회원 확인 버튼으로 회원 정보를 확인해 주세요.");
        payload.memberId = memberId;
        payload.orderStatus = getVal("order-orderStatus") || "READY";
    }

    return payload;
}

function resetOrderModal() {
    ["order-orderNo", "order-memberId", "order-lessonId", "order-orderName", "order-orderAmount", "order-discountAmount", "order-paymentAmount"].forEach((id) => setVal(id, ""));
    setVal("order-apartId", "-");
    setVal("order-orderStatus", "READY");
    setVal("order-discountAmount", "0");
    setVal("order-paymentAmount", "0");
    const infoEl = $id("order-member-info");
    if (infoEl) {
        infoEl.textContent = "";
        infoEl.classList.remove("text-danger", "text-success");
    }
    setOrderFormMessage();
}

function closeOrderModal() {
    const modalEl = $id("order-modal");
    if (!modalEl) return;
    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
}

function setOrderSubmitting(on) {
    isOrderSubmitting = on;
    const btn = $id("order-confirm");
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

function setOrderFormMessage(message = "", type = "") {
    const el = $id("order-form-message");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("text-danger", type === "invalid");
}

/* ------------------------- 주문 취소 ------------------------- */

function bindOrderCancelHandlers() {
    $id("order-cancel-confirm")?.addEventListener("click", handleOrderCancelConfirm);
}

function openCancelOrderModal(orderId) {
    const modalEl = $id("order-cancel-modal");
    if (!modalEl) return;
    modalEl.dataset.orderId = orderId;
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

async function handleOrderCancelConfirm(e) {
    e.preventDefault();
    e.stopPropagation();

    const modalEl = $id("order-cancel-modal");
    const orderId = modalEl?.dataset.orderId;
    if (!orderId) return;

    const btn = $id("order-cancel-confirm");
    const originalText = btn?.textContent;
    if (btn) {
        btn.disabled = true;
        btn.textContent = "처리 중...";
    }

    try {
        const res = await putWithCsrf(`/api/orders/${orderId}/cancel`);
        await parseMutationResponse(res, "주문 취소에 실패했습니다.");
        alert("주문이 취소되었습니다.");
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        reloadOrderTable("orderDataTable");
    } catch (err) {
        console.error(err);
        alert(err.message || "주문 취소 중 오류가 발생했습니다.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
}

/* ------------------------- 결제내역 관리 모달 ------------------------- */

function bindPaymentModalHandlers() {
    $id("btn-payment-create-toggle")?.addEventListener("click", () => {
        hideAllPaymentPanels();
        setVal("payment-create-amount", PaymentModalState.paymentAmount || 0);
        $id("payment-create-panel")?.classList.remove("d-none");
    });
    $id("btn-payment-create-cancel")?.addEventListener("click", () => {
        $id("payment-create-panel")?.classList.add("d-none");
    });
    $id("btn-payment-create-submit")?.addEventListener("click", handlePaymentCreateSubmit);

    $id("btn-payment-approve-cancel")?.addEventListener("click", hideAllPaymentPanels);
    $id("btn-payment-approve-submit")?.addEventListener("click", handlePaymentApproveSubmit);

    $id("btn-payment-fail-cancel")?.addEventListener("click", hideAllPaymentPanels);
    $id("btn-payment-fail-submit")?.addEventListener("click", handlePaymentFailSubmit);

    $id("payment-cancel-confirm")?.addEventListener("click", handlePaymentCancelConfirm);

    $id("payment-list-body")?.addEventListener("click", async (e) => {
        const checkoutBtn = e.target.closest('[data-action="open-hecto-checkout"]');
        if (checkoutBtn) {
            const paymentId = checkoutBtn.getAttribute("data-payment-id");
            if (paymentId) window.open(`/pay/checkout/${paymentId}`, "_blank");
            return;
        }

        const approveBtn = e.target.closest('[data-action="approve-payment"]');
        if (approveBtn) {
            hideAllPaymentPanels();
            PaymentModalState.activePaymentId = approveBtn.getAttribute("data-payment-id");
            setVal("payment-approve-transactionId", "");
            setVal("payment-approve-resultCode", "");
            setVal("payment-approve-resultMessage", "");
            $id("payment-approve-panel")?.classList.remove("d-none");
            return;
        }

        const failBtn = e.target.closest('[data-action="fail-payment"]');
        if (failBtn) {
            hideAllPaymentPanels();
            PaymentModalState.activePaymentId = failBtn.getAttribute("data-payment-id");
            setVal("payment-fail-resultCode", "");
            setVal("payment-fail-resultMessage", "");
            $id("payment-fail-panel")?.classList.remove("d-none");
            return;
        }

        const cancelBtn = e.target.closest('[data-action="cancel-payment"]');
        if (cancelBtn) {
            const paymentId = cancelBtn.getAttribute("data-payment-id");
            const modalEl = $id("payment-cancel-modal");
            if (modalEl && paymentId) {
                modalEl.dataset.paymentId = paymentId;
                bootstrap.Modal.getOrCreateInstance(modalEl).show();
            }
            return;
        }

    });
}

async function openPaymentModal(orderId, orderNo, orderName, paymentAmount) {
    PaymentModalState.orderId = orderId;
    PaymentModalState.orderNo = orderNo;
    PaymentModalState.paymentAmount = paymentAmount;

    const infoEl = $id("payment-modal-order-info");
    if (infoEl) infoEl.textContent = `주문번호: ${orderNo} / 주문명: ${orderName} / 결제금액: ${formatAmount(paymentAmount)}원`;

    resetPaymentPanels();
    await reloadPaymentList();
}

async function reloadPaymentList() {
    const orderId = PaymentModalState.orderId;
    if (!orderId) return;

    try {
        const resp = await fetchJson(`/api/payments/order/${orderId}`);
        const payments = Array.isArray(resp?.data) ? resp.data : [];
        PaymentModalState.payments = payments;
        renderPaymentList(payments);
    } catch (err) {
        console.error(err);
        renderPaymentList([]);
    }
}

function renderPaymentList(payments) {
    const body = $id("payment-list-body");
    if (!body) return;

    if (!payments || payments.length === 0) {
        body.innerHTML = `<tr><td colspan="8">결제내역이 없습니다.</td></tr>`;
        return;
    }

    body.innerHTML = payments.map((payment) => {
        const buttons = [];
        if (Array.isArray(payment.btnActions) && payment.btnActions.includes("APPROVE")) {
            buttons.push(`<button type="button" class="btn btn-sm btn-outline-primary" data-action="open-hecto-checkout" data-payment-id="${payment.id}">결제창</button>`);
            buttons.push(`<button type="button" class="btn btn-sm btn-primary" data-action="approve-payment" data-payment-id="${payment.id}">승인</button>`);
        }
        if (Array.isArray(payment.btnActions) && payment.btnActions.includes("FAIL")) {
            buttons.push(`<button type="button" class="btn btn-sm btn-outline-danger" data-action="fail-payment" data-payment-id="${payment.id}">실패</button>`);
        }
        if (Array.isArray(payment.btnActions) && payment.btnActions.includes("CANCEL")) {
            buttons.push(`<button type="button" class="btn btn-sm btn-danger" data-action="cancel-payment" data-payment-id="${payment.id}">취소</button>`);
        }

        return `
            <tr>
                <td>${escapeHtml(payment.pgCompany ?? "-")}</td>
                <td>${escapeHtml(payment.paymentMethod ?? "-")}</td>
                <td>${formatAmount(payment.amount)}</td>
                <td>${renderStatusBadge(payment.paymentStatus)}</td>
                <td>${escapeHtml(payment.trdNo ?? "-")}</td>
                <td>${escapeHtml(payment.approvedAt ?? "-")}</td>
                <td>${escapeHtml(payment.resultMessage ?? "-")}</td>
                <td>${buttons.join(" ") || "-"}</td>
            </tr>
        `;
    }).join("");
}

function hideAllPaymentPanels() {
    ["payment-create-panel", "payment-approve-panel", "payment-fail-panel"].forEach((id) => {
        $id(id)?.classList.add("d-none");
    });
}

function resetPaymentPanels() {
    hideAllPaymentPanels();
    PaymentModalState.activePaymentId = null;
}

async function handlePaymentCreateSubmit() {
    if (isPaymentActionSubmitting) return;
    const orderId = PaymentModalState.orderId;
    if (!orderId) return;

    const amount = toNumOrNull(getVal("payment-create-amount"));
    if (amount == null) {
        alert("결제금액을 입력해 주세요.");
        return;
    }

    const payload = {
        orderId: Number(orderId),
        pgCompany: getVal("payment-create-pgCompany"),
        paymentMethod: getVal("payment-create-method"),
        amount,
    };

    isPaymentActionSubmitting = true;
    try {
        const res = await postWithCsrf("/api/payments", payload);
        await parseMutationResponse(res, "결제 등록에 실패했습니다.");
        alert("결제가 등록되었습니다.");
        hideAllPaymentPanels();
        await reloadPaymentList();
        reloadOrderTable("orderDataTable");
    } catch (err) {
        console.error(err);
        alert(err.message || "결제 등록 중 오류가 발생했습니다.");
    } finally {
        isPaymentActionSubmitting = false;
    }
}

async function handlePaymentApproveSubmit() {
    if (isPaymentActionSubmitting) return;
    const paymentId = PaymentModalState.activePaymentId;
    if (!paymentId) return;

    const payload = {
        trdNo: getVal("payment-approve-transactionId").trim(),
        resultCode: getVal("payment-approve-resultCode").trim(),
        resultMessage: getVal("payment-approve-resultMessage").trim(),
    };

    isPaymentActionSubmitting = true;
    try {
        const res = await putWithCsrf(`/api/payments/${paymentId}/approve`, payload);
        await parseMutationResponse(res, "결제 승인 처리에 실패했습니다.");
        alert("결제가 승인 처리되었습니다.");
        hideAllPaymentPanels();
        await reloadPaymentList();
        reloadOrderTable("orderDataTable");
    } catch (err) {
        console.error(err);
        alert(err.message || "결제 승인 처리 중 오류가 발생했습니다.");
    } finally {
        isPaymentActionSubmitting = false;
    }
}

async function handlePaymentFailSubmit() {
    if (isPaymentActionSubmitting) return;
    const paymentId = PaymentModalState.activePaymentId;
    if (!paymentId) return;

    const payload = {
        resultCode: getVal("payment-fail-resultCode").trim(),
        resultMessage: getVal("payment-fail-resultMessage").trim(),
    };

    isPaymentActionSubmitting = true;
    try {
        const res = await putWithCsrf(`/api/payments/${paymentId}/fail`, payload);
        await parseMutationResponse(res, "결제 실패 처리에 실패했습니다.");
        alert("결제가 실패 처리되었습니다.");
        hideAllPaymentPanels();
        await reloadPaymentList();
    } catch (err) {
        console.error(err);
        alert(err.message || "결제 실패 처리 중 오류가 발생했습니다.");
    } finally {
        isPaymentActionSubmitting = false;
    }
}

async function handlePaymentCancelConfirm(e) {
    e.preventDefault();
    e.stopPropagation();

    const modalEl = $id("payment-cancel-modal");
    const paymentId = modalEl?.dataset.paymentId;
    if (!paymentId) return;

    const btn = $id("payment-cancel-confirm");
    const originalText = btn?.textContent;
    if (btn) {
        btn.disabled = true;
        btn.textContent = "처리 중...";
    }

    try {
        const res = await putWithCsrf(`/api/payments/${paymentId}/cancel`);
        await parseMutationResponse(res, "결제 취소에 실패했습니다.");
        alert("결제가 취소되었습니다.");
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        await reloadPaymentList();
        reloadOrderTable("orderDataTable");
    } catch (err) {
        console.error(err);
        alert(err.message || "결제 취소 중 오류가 발생했습니다.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
        delete modalEl.dataset.paymentId;
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

function renderStatusBadge(status) {
    const meta = STATUS_LABELS[status] ?? { text: status ?? "-", cls: "bg-secondary" };
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

function escapeAttr(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
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
