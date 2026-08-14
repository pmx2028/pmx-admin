/**
 * 전역 권한 목록 (서버에서 미리 주입하거나 /api/user/info로 세팅)
 * ex) window.USER_AUTHORITIES = ["ARTICLE_READ", "DESK_PAGE_VIEW", ...];
 */
let USER_AUTHORITIES = window.USER_AUTHORITIES || [];

document.addEventListener('DOMContentLoaded', function() {
    // .navbar_logout 요소를 찾아 클릭 리스너 등록
    document.querySelectorAll('.navbar_logout').forEach(function(el) {
        el.addEventListener('click', function(evt) {
            evt.preventDefault();                                   // a 태그 기본 동작 막기
            const logoutForm = document.querySelector('form[name="logoutForm"]');
            if (logoutForm) {
                logoutForm.submit();                                  // 폼 제출
            } else {
                console.error('logoutForm 폼을 찾을 수 없습니다.');
            }
        });
    });

    if (!USER_AUTHORITIES || USER_AUTHORITIES.length === 0) {
        alert("현재 로그인한 사용자 계정에 직군/직책이 설정되어있지 않아 화면 접근 권한이 없습니다. 관리자에게 문의해주세요.");
    }


    // console.log(USER_AUTHORITIES);
});

/* =========================================================
 * 권한 유틸 (for CMS)
 * ========================================================= */

/**
 * 특정 권한을 가지고 있는지 여부 확인
 * @param {string} code - PermissionCode 예: "DESK_PAGE_VIEW"
 * @returns {boolean}
 */
function hasAuthority(code) {
    if (!code) return false;
    return Array.isArray(window.USER_AUTHORITIES) && window.USER_AUTHORITIES.includes(code);
}

/**
 * 여러 권한 중 하나라도 있으면 true
 * @param {string[]} codes
 * @returns {boolean}
 */
function hasAnyAuthority(codes = []) {
    if (!Array.isArray(codes)) return false;
    return codes.some((code) => hasAuthority(code));
}

/**
 * 기사 데스킹 관련 권한 여부 확인
 * - ARTICLE_DESK (기사 데스킹 기능)
 * - DESK_PAGE_VIEW (데스크 페이지 접근)
 */
function hasDeskingAuthority() {
    return hasAnyAuthority(["ARTICLE_DESK", "DESK_PAGE_VIEW"]);
}

/**
 * 수습기자, 인턴기자인 경우
 */
function hasInternRole() {
    return hasAnyAuthority(["ROLE_EDITORIAL_INTERN"]);
}


function initDateRangePicker(options = {}) {
    moment.locale('ko');

    const {
        target = 'input[name="datetimes"]',
        startInput = 'input[name="start_date"]',
        endInput = 'input[name="end_date"]',

        enableTime = false,
        showDropdowns = true,
        time24Hour = true,
        timeStep = 30,

        dateFormat = 'YYYY-MM-DD',
        timeFormat = 'HH:mm',
        valueSeparator = ' ~ ',

        mode = 'create',           // 'create' | 'edit'
        initialStart = null,
        initialEnd = null,

        mobileBreakPoint = 768,
        drops = 'down',
        parentEl = 'body',

        extraOptions = {},
    } = options;

    const $dateInput = $(target);
    if (!$dateInput.length) return;

    const $startInput = $(startInput);
    const $endInput = $(endInput);

    const displayFormat = enableTime
        ? `${dateFormat} ${timeFormat}`
        : dateFormat;

    if ($dateInput.data('daterangepicker')) {
        $dateInput.data('daterangepicker').remove();
        $dateInput.off('.dsDaterangepicker');
    }

    const isMobile = window.innerWidth < mobileBreakPoint;
    const hasCustomParentEl = Boolean(parentEl && parentEl !== 'body');

    $dateInput.daterangepicker({
        opens: isMobile ? 'center' : 'right',
        autoUpdateInput: false,
        linkedCalendars: false,

        drops: isMobile ? 'auto' : drops,
        // Keep modal-scoped picker on mobile when caller explicitly passes parentEl.
        parentEl: isMobile && !hasCustomParentEl ? 'body' : parentEl,

        timePicker: enableTime,
        timePicker24Hour: time24Hour,
        timePickerIncrement: timeStep,
        showDropdowns,

        locale: {
            format: displayFormat,
            daysOfWeek: ['일','월','화','수','목','금','토'],
            monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
            applyLabel: '적용',
            cancelLabel: '취소',
            fromLabel: '시작',
            toLabel: '종료',
            customRangeLabel: '사용자 정의 범위',
        },

        ...extraOptions,
    });

    // 🔐 수정 모드 원본 값 저장
    if (mode === 'edit' && initialStart && initialEnd) {
        $dateInput.data('original-range', {
            start: moment(initialStart),
            end: moment(initialEnd),
        });
    }

    $dateInput.on('apply.daterangepicker.dsDaterangepicker', function (ev, picker) {
        const start = picker.startDate.format(displayFormat);
        const end = picker.endDate.format(displayFormat);

        $(this).val(`${start}${valueSeparator}${end}`);
        $startInput.val(start);
        $endInput.val(end);
    });

    $dateInput.on('cancel.daterangepicker.dsDaterangepicker', function () {
        const $el = $(this);
        const original = $el.data('original-range');

        if (mode === 'edit' && original) {
            const start = original.start.format(displayFormat);
            const end = original.end.format(displayFormat);

            $el.val(`${start}${valueSeparator}${end}`);
            $startInput.val(start);
            $endInput.val(end);

            const picker = $el.data('daterangepicker');
            picker?.setStartDate(original.start);
            picker?.setEndDate(original.end);
            picker?.updateCalendars();
            return;
        }

        $el.val('');
        $startInput.val('');
        $endInput.val('');
    });

    // 모바일 대응: 열릴 때 중앙 정렬
    $dateInput.on('show.daterangepicker', function (ev, picker) {
        if (isMobile) {
            $('.daterangepicker').addClass('mobile-picker').css({
                'top': '',
                'left': '',
            });
        }
    });
}

function clearDateRangeValueInModal(modalEl, opts = {}) {
    const {
        displaySelector = 'input[name="display-date-range"]',
        startSelector = 'input[name="start-date"]',
        endSelector = 'input[name="end-date"]',
        resetPickerToToday = true,
    } = opts;

    const displayEl = modalEl.querySelector(displaySelector);
    const startEl = modalEl.querySelector(startSelector);
    const endEl = modalEl.querySelector(endSelector);

    if (displayEl) displayEl.value = "";
    if (startEl) startEl.value = "";
    if (endEl) endEl.value = "";

    if (resetPickerToToday && displayEl) {
        const picker = $(displayEl).data("daterangepicker");
        if (picker) {
            const now = moment();
            picker.setStartDate(now.clone().startOf("day"));
            picker.setEndDate(now.clone().startOf("day"));
            picker.updateCalendars();
        }
    }
}

function setDateRangeValueInModal(modalEl, opts) {
    const {
        start,
        end,
        displaySelector = 'input[name="display-date-range"]',
        startSelector = 'input[name="start-date"]',
        endSelector = 'input[name="end-date"]',
        hiddenFormat = "YYYY-MM-DD HH:mm",
        displayFormat = "YYYY-MM-DD HH:mm",
        separator = " ~ ",
        syncCalendarView = true,
    } = opts || {};

    const displayEl = modalEl.querySelector(displaySelector);
    if (!displayEl) return;

    const startEl = modalEl.querySelector(startSelector);
    const endEl = modalEl.querySelector(endSelector);

    const startM = moment(start);
    const endM = moment(end);

    if (startEl) startEl.value = startM.format(hiddenFormat);
    if (endEl) endEl.value = endM.format(hiddenFormat);

    displayEl.value =
        `${startM.format(displayFormat)}${separator}${endM.format(displayFormat)}`;

    const picker = $(displayEl).data("daterangepicker");
    if (picker) {
        picker.setStartDate(startM);
        picker.setEndDate(endM);

        if (syncCalendarView) {
            picker.leftCalendar.month = startM.clone().startOf("month");
            picker.rightCalendar.month = endM.clone().startOf("month");
        }

        picker.updateCalendars();
    }
}


/**
 * ✅ 단일 날짜/시간 선택용 daterangepicker 초기화 (singleDatePicker)
 * - apply: display + hidden(또는 startInput) 동기화
 * - cancel:
 *   - edit 모드면 원본 값으로 복원
 *   - create 모드면 빈 값으로 초기화
 */
function initSingleDatePicker(options = {}) {
    moment.locale("ko");

    const {
        target = 'input[name="singleDatetime"]',
        valueInput = 'input[name="single_value"]', // hidden 값(서버로 보낼 값). 필요 없으면 null 가능

        enableTime = false,
        showDropdowns = true,
        time24Hour = true,
        timeStep = 30,

        dateFormat = "YYYY-MM-DD",
        timeFormat = "HH:mm",
        displayFormat = null, // null이면 dateFormat(+timeFormat) 사용
        hiddenFormat = null,  // null이면 displayFormat과 동일

        mode = "create", // 'create' | 'edit'
        initialValue = null,
        mobileBreakPoint = 768,
        drops = "down",
        parentEl = "body",

        extraOptions = {},
    } = options;

    const $input = $(target);
    if (!$input.length) return;

    const $valueInput = valueInput ? $(valueInput) : $();

    const finalDisplayFormat =
        displayFormat ?? (enableTime ? `${dateFormat} ${timeFormat}` : dateFormat);

    const finalHiddenFormat =
        hiddenFormat ?? finalDisplayFormat;
    const isMobile = window.innerWidth < mobileBreakPoint;
    const hasCustomParentEl = Boolean(parentEl && parentEl !== "body");

    // 기존 picker 제거
    if ($input.data("daterangepicker")) {
        $input.data("daterangepicker").remove();
        $input.off(".dsSingleDaterangepicker");
    }

    $input.daterangepicker({
        singleDatePicker: true, // ✅ 단일
        opens: isMobile ? "center" : "right",
        autoUpdateInput: false,
        linkedCalendars: false,
        drops: isMobile ? "auto" : drops,
        // Keep modal-scoped picker on mobile when caller explicitly passes parentEl.
        parentEl: isMobile && !hasCustomParentEl ? "body" : parentEl,

        timePicker: enableTime,
        timePicker24Hour: time24Hour,
        timePickerIncrement: timeStep,
        showDropdowns,

        locale: {
            format: finalDisplayFormat,
            daysOfWeek: ["일", "월", "화", "수", "목", "금", "토"],
            monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
            applyLabel: "적용",
            cancelLabel: "취소",
            customRangeLabel: "사용자 정의 범위",
        },

        ...extraOptions,
    });

    // 🔐 수정 모드 원본 값 저장
    if (mode === "edit" && initialValue) {
        $input.data("original-single", moment(initialValue));
    }

    // apply -> input + hidden 동기화
    $input.on("apply.daterangepicker.dsSingleDaterangepicker", function (_ev, picker) {
        const picked = picker.startDate.clone();
        const display = picked.format(finalDisplayFormat);
        const hidden = picked.format(finalHiddenFormat);

        $(this).val(display);
        if ($valueInput.length) $valueInput.val(hidden);
    });

    // cancel -> edit: 복원 / create: 초기화
    $input.on("cancel.daterangepicker.dsSingleDaterangepicker", function () {
        const $el = $(this);
        const original = $el.data("original-single");

        if (mode === "edit" && original) {
            const display = original.format(finalDisplayFormat);
            const hidden = original.format(finalHiddenFormat);

            $el.val(display);
            if ($valueInput.length) $valueInput.val(hidden);

            const picker = $el.data("daterangepicker");
            picker?.setStartDate(original);
            picker?.setEndDate(original);
            picker?.updateCalendars();
            return;
        }

        $el.val("");
        if ($valueInput.length) $valueInput.val("");
    });

    $input.on("show.daterangepicker.dsSingleDaterangepicker", function (_ev, picker) {
        if (!isMobile) return;

        const $container = picker?.container || $input.data("daterangepicker")?.container;
        if (!$container || !$container.length) return;

        $container.addClass("mobile-picker mobile-single-picker").css({
            top: "",
            left: "",
        });
        $container.find(".drp-selected").hide();
    });
}

/**
 * ✅ 단일 시간(HH:mm) 선택용 timepicker 초기화 (jQuery-timepicker wrapper)
 *
 * - create / edit 모드 지원
 * - edit 모드에서 cancel 시 원본 값 복원
 * - create 모드에서 cancel 시 빈 값
 * - 중복 초기화 방지
 * - 모달 appendTo 대응
 */
function initSingleTimePicker(options = {}) {
    const {
        target,                     // selector (필수)
        mode = "create",             // 'create' | 'edit'
        initialValue = null,         // "HH:mm"
        interval = 30,               // 분 단위
        appendTo = null,             // 모달 selector
        minTime = null,
        maxTime = null,
        onChange = null,
    } = options;

    if (!target) return;

    const $input = $(target);
    if (!$input.length) return;

    // 🔥 기존 timepicker 제거 (중복 방지)
    if ($input.data("timepicker")) {
        try {
            $input.timepicker("remove");
        } catch (e) {}
    }

    // 🔐 edit 모드 원본 값 저장
    if (mode === "edit" && initialValue) {
        $input.data("original-time", initialValue);
    } else {
        $input.data("original-time", "");
    }

    // 초기값 세팅
    if (initialValue) {
        $input.val(initialValue);
    } else if (mode === "create") {
        $input.val("");
    }

    // timepicker 초기화
    $input.timepicker({
        timeFormat: "HH:mm",
        interval,
        dropdown: true,
        scrollbar: true,
        dynamic: false,
        minTime,
        maxTime,
        appendTo,
        change(time) {
            const value = $input.val();
            if (typeof onChange === "function") {
                onChange(value);
            }
        },
    });

    /**
     * cancel 처리
     * - ESC 키 = cancel
     * - blur 시 값 없으면 정책 적용
     */
    $input.off(".singleTimePicker");

    $input.on("keydown.singleTimePicker", function (e) {
        if (e.key !== "Escape") return;

        if (mode === "edit") {
            $input.val($input.data("original-time") || "");
        } else {
            $input.val("");
        }
        $input.blur();
    });

    $input.on("blur.singleTimePicker", function () {
        const val = $input.val();
        if (val) return;

        if (mode === "edit") {
            $input.val($input.data("original-time") || "");
        }
    });
}


// 중복 요청 방지 함수
function debounce(func, delay) {
    let timeoutId;

    function debounced(...args) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    }

    debounced.cancel = () => {
        if (timeoutId) clearTimeout(timeoutId);
    };

    return debounced;
}

/**
 * 공통 POST 요청 함수 (CSRF 토큰 자동 포함)
 * @param {string} url - 요청 URL
 * @param {object} data - 요청 Body에 담길 JSON 객체
 * @returns {Promise<Response>} fetch Response
 */
async function postWithCsrf(url, data = null) {
    const token = document.querySelector("meta[name='_csrf']").getAttribute("content");
    const header = document.querySelector("meta[name='_csrf_header']").getAttribute("content");

    const fetchOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            [header]: token
        }
    };

    if (data !== null) {
        fetchOptions.body = JSON.stringify(data);
    }

    return await fetch(url, fetchOptions);
}

/**
 * 공통 PATCH 요청 함수 (CSRF 토큰 자동 포함)
 * @param {string} url - 요청 URL
 * @param {object} data - 요청 Body에 담길 JSON 객체
 * @returns {Promise<Response>} fetch Response
 */
async function patchWithCsrf(url, data = null) {
    const token = document.querySelector("meta[name='_csrf']").getAttribute("content");
    const header = document.querySelector("meta[name='_csrf_header']").getAttribute("content");

    const fetchOptions = {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            [header]: token
        }
    };

    if (data !== null) {
        fetchOptions.body = JSON.stringify(data);
    }

    return await fetch(url, fetchOptions);
}

/**
 * 공통 PATCH 요청 함수 (CSRF 토큰 자동 포함)
 * @param {string} url - 요청 URL
 * @param {object} data - 요청 Body에 담길 JSON 객체
 * @returns {Promise<Response>} fetch Response
 */
async function putWithCsrf(url, data = null) {
    const token = document.querySelector("meta[name='_csrf']").getAttribute("content");
    const header = document.querySelector("meta[name='_csrf_header']").getAttribute("content");

    const fetchOptions = {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            [header]: token
        }
    };

    if (data !== null) {
        fetchOptions.body = JSON.stringify(data);
    }

    return await fetch(url, fetchOptions);
}

/**
 * 공통 DELETE 요청 함수 (CSRF 토큰 자동 포함)
 * @param {string} url - 요청 URL
 * @param {object} data - 요청 Body에 담길 JSON 객체
 * @returns {Promise<Response>} fetch Response
 */
async function deleteWithCsrf(url, data = null) {
    const token = document.querySelector("meta[name='_csrf']").getAttribute("content");
    const header = document.querySelector("meta[name='_csrf_header']").getAttribute("content");

    const fetchOptions = {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            [header]: token
        }
    };

    if (data !== null) {
        fetchOptions.body = JSON.stringify(data);
    }

    return await fetch(url, fetchOptions);
}

/**
 * 공통 POST 요청 함수 (CSRF 토큰 자동 포함)
 * - data가 FormData이면 multipart/form-data 로 전송
 */
async function postFileWithCsrf(url, data = null) {
    const tokenMeta  = document.querySelector("meta[name='_csrf']");
    const headerMeta = document.querySelector("meta[name='_csrf_header']");

    const token  = tokenMeta  ? tokenMeta.getAttribute("content")  : null;
    const header = headerMeta ? headerMeta.getAttribute("content") : null;

    const isFormData = (data instanceof FormData);

    const headers = {};
    if (header && token) {
        headers[header] = token;       // CSRF 헤더 추가
    }
    // FormData가 아닐 때만 JSON 헤더 세팅
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const fetchOptions = {
        method: 'POST',
        credentials: 'include',
        headers
    };

    if (data !== null) {
        fetchOptions.body = isFormData ? data : JSON.stringify(data);
    }

    return await fetch(url, fetchOptions);
}

const $id = (id) => document.getElementById(id);
const getVal = (id) => $id(id)?.value?.trim() ?? "";

// ==============================
// 간단한 escape 함수
// ==============================
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function bindRedirectAction() {
    const elements = document.querySelectorAll('[data-action="redirect"]');
    if (!elements.length) return;

    elements.forEach((el) => {
        el.addEventListener("click", () => {
            const url = el.dataset.targetUrl;
            if (!url) return;
            window.location.href = url;
        });
    });
}

const getCsrfHeaders = () => {
    const token = document.querySelector('meta[name="_csrf"]')?.content;
    const headerName = document.querySelector('meta[name="_csrf_header"]')?.content;
    return token && headerName ? { [headerName]: token } : {};
};
