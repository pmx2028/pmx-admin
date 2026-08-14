/**
 * =====================================================================
 * 📦 http-interceptor.js
 * ---------------------------------------------------------------------
 * 전역 AJAX / fetch 요청 인터셉터
 * ---------------------------------------------------------------------
 * ✅ 주요 역할
 * 1. 모든 jQuery / DataTables / fetch 요청에 공통 헤더 자동 부착
 *    - X-Requested-With: XMLHttpRequest
 *    - Accept: application/json
 * 2. 서버로부터 401(세션 만료) 또는 403(권한 없음) 응답 수신 시
 *    - 자동으로 로그인 페이지로 리다이렉트하거나 경고창 표시
 * 3. DataTables 기본 alert("Ajax error") 팝업 비활성화
 *
 * 💡 이 파일은 모든 페이지에서 공통으로 로드되어야 하며,
 *    각 페이지별 JS보다 먼저 포함되어야 합니다.
 *    (예: layout.html의 공통 script 영역에 포함)
 * =====================================================================
 */

// beforeunload 알림 없이 로그인 페이지로 리다이렉트
function removeEditorBeforeUnloadWarning() {
    if (window.__EDITOR_BEFORE_UNLOAD_HANDLER__) {
        window.removeEventListener('beforeunload', window.__EDITOR_BEFORE_UNLOAD_HANDLER__);
    }
}


function createPendingPromise() {
    return new Promise(() => {});
}

const SESSION_EXPIRED_MESSAGE = "세션이 만료되었거나 다른 기기에서 로그인되었습니다.\n" + "다시 로그인해 주세요.";

function redirectToLoginWithoutBeforeUnload() {
    if (window.__SESSION_EXPIRED_REDIRECTING__) {
        return;
    }
    window.__SESSION_EXPIRED_REDIRECTING__ = true;
    removeEditorBeforeUnloadWarning();

    alert(SESSION_EXPIRED_MESSAGE);
    window.location.replace('/login');
}

function isLoginRedirectUrl(url) {
    if (!url) return false;

    try {
        const parsed = new URL(url, window.location.origin);
        return parsed.pathname === '/login';
    } catch (e) {
        return false;
    }
}

function isHtmlResponse(jqXHR) {
    const contentType = jqXHR?.getResponseHeader?.('Content-Type') || '';
    return contentType.toLowerCase().includes('text/html');
}

function looksLikeLoginHtml(text) {
    if (typeof text !== 'string' || text.length === 0) return false;
    return text.includes('<form') && text.includes('/signin');
}

function shouldRedirectFromAjaxResponse(jqXHR) {
    if (!jqXHR) return false;

    if (jqXHR.status === 401 || jqXHR.status === 302) return true;
    if (isLoginRedirectUrl(jqXHR.responseURL)) return true;
    if (isHtmlResponse(jqXHR) && looksLikeLoginHtml(jqXHR.responseText)) return true;

    return false;
}

// 모든 jQuery AJAX 요청에 공통 헤더 부착
$.ajaxSetup({
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
    },
    statusCode: {
        401: function () { redirectToLoginWithoutBeforeUnload(); },
        403: function () { console.error("접근 권한이 없습니다.") }
    },
    complete: function (jqXHR) {
        if (shouldRedirectFromAjaxResponse(jqXHR)) {
            redirectToLoginWithoutBeforeUnload();
        }
    }
});

// DataTables 기본 에러 팝업 끄기
if ($.fn.dataTable) {
    $.fn.dataTable.ext.errMode = 'none';
    // 최종 방어선 (서버에서 HTML이 와도 잡아줌)
    $(document).on('error.dt', function (e, settings) {
        const xhr = settings?.jqXHR;
        if (shouldRedirectFromAjaxResponse(xhr)) redirectToLoginWithoutBeforeUnload();
    });
}

// fetch 전역 래핑 (jQuery를 안 쓰는 페이지도 커버)
(function () {
    if (!window.fetch) return;
    const _fetch = window.fetch;

    const patchedFetch = async (input, init = {}) => {
        const headers = new Headers(init.headers || {});
        if (!headers.has('X-Requested-With')) headers.set('X-Requested-With', 'XMLHttpRequest');
        if (!headers.has('Accept')) headers.set('Accept', 'application/json');
        init.headers = headers;
        init.redirect = 'manual'; // 302 자동추적 차단 → Mixed Content 에러 방지

        const res = await _fetch(input, init);

        // 401 또는 세션만료로 인한 302 리다이렉트(opaqueredirect) 감지
        if (
            res.status === 401 ||
            res.status === 302 ||
            res.redirected ||
            res.type === 'opaqueredirect' ||
            isLoginRedirectUrl(res.url)
        ) {
            redirectToLoginWithoutBeforeUnload();
            return createPendingPromise();
        }
        if (res.status === 403) {
            throw new Error('Access denied');
        }
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        if (contentType.includes('text/html')) {
            const cloned = res.clone();
            const text = await cloned.text();
            if (looksLikeLoginHtml(text)) {
                redirectToLoginWithoutBeforeUnload();
                return createPendingPromise();
            }
        }
        return res;
    };

    // window.fetch 교체
    window.fetch = patchedFetch;

    // ✅ type="module" 스크립트는 globalThis.fetch를 직접 참조하므로
    //    Object.defineProperty로 getter를 가로채서 모듈에서도 인터셉터가 적용되도록 처리
    Object.defineProperty(globalThis, 'fetch', {
        get: () => patchedFetch,
        configurable: true
    });
})();
