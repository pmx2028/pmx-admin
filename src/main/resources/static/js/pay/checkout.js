// 헥토파이낸셜(SettlePG) 결제창 호출.
// /pay/checkout/{paymentId} 페이지에서 로드되며, 서버가 만들어준 결제요청 정보를 그대로
// SETTLE_PG.pay(obj, callback)에 전달한다. obj의 필드명은 서버(HectoPayRequestDto)와
// SettlePG_v1.2.js가 읽는 파라미터명을 그대로 맞춘 것이므로 임의로 바꾸지 말 것.
document.addEventListener("DOMContentLoaded", async () => {
    const  paymentId = window.paymentId;
    await runHectoCheckout(paymentId);
});
export async function runHectoCheckout(paymentId) {
    if (!paymentId) {
        setStatus("결제 정보를 확인할 수 없습니다.", "잘못된 접근입니다.", true);
        return;
    }

    if (typeof window.SETTLE_PG === "undefined") {
        setStatus("결제 모듈을 불러오지 못했습니다.", "네트워크 상태를 확인 후 다시 시도해 주세요.", true);
        return;
    }

    try {
        const resp = await fetchJson(`/api/pay/hecto/${paymentId}`);
        const payRequest = resp?.data;
        if (!payRequest) {
            throw new Error("결제요청 정보를 가져오지 못했습니다.");
        }

        setStatus("결제창을 여는 중입니다...", "잠시만 기다려 주세요.", false);

        const payObj = {
            env: payRequest.env,
            ui: { type: payRequest.uiType || "iframe" },
            mchtId: payRequest.mchtId,
            method: payRequest.method,
            trdDt: payRequest.trdDt,
            trdTm: payRequest.trdTm,
            mchtTrdNo: payRequest.mchtTrdNo,
            mchtName: payRequest.mchtName,
            mchtEName: payRequest.mchtEName,
            pmtPrdtNm: payRequest.pmtPrdtNm,
            trdAmt: payRequest.trdAmt,
            mchtCustNm: payRequest.mchtCustNm,
            mchtCustId: payRequest.mchtCustId,
            notiUrl: payRequest.notiUrl,
            nextUrl: payRequest.nextUrl,
            cancUrl: payRequest.cancUrl,
            mchtParam: payRequest.mchtParam,
            pktHash: payRequest.pktHash,
        };

        window.SETTLE_PG.pay(payObj, (result) => handlePayResult(result));
    } catch (err) {
        console.error(err);
        setStatus("결제 요청 중 오류가 발생했습니다.", err.message || "잠시 후 다시 시도해 주세요.", true);
    }
}

function handlePayResult(result) {
    // ⚠ SETTLE_PG.pay() 콜백으로 전달되는 result의 정확한 필드/성공판정 기준은
    // 공식 매뉴얼로 재검증이 필요하다. 최종 결제상태는 이 콜백이 아니라
    // 서버가 notiUrl로 받은 통보를 기준으로 확정되므로, 여기서는 사용자 안내 용도로만 사용한다.
    console.log("[HECTO] pay result", result);

    const failed = result && (result.resultCode && result.resultCode !== "0000");
    if (failed) {
        setStatus("결제가 완료되지 않았습니다.", result.resultMsg || "결제가 취소되었거나 실패했습니다.", true);
        return;
    }

    setStatus("결제 요청이 접수되었습니다.", "최종 승인 결과는 결제내역 목록에서 확인해 주세요.", true);
}

function setStatus(title, message, showCloseButton) {
    const titleEl = document.getElementById("pay-status-title");
    const messageEl = document.getElementById("pay-status-message");
    const spinnerEl = document.getElementById("pay-spinner");
    const closeBtn = document.getElementById("btn-pay-close");

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    if (spinnerEl) spinnerEl.classList.toggle("d-none", showCloseButton);

    if (closeBtn) {
        closeBtn.classList.toggle("d-none", !showCloseButton);
        closeBtn.onclick = () => {
            if (window.opener || window.history.length <= 1) {
                window.close();
                return;
            }
            window.location.href = "/order/order";
        };
    }
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
