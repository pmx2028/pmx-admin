// 모바일 여부 판단
function isMobile(breakpoint = 640) {
    return window.innerWidth <= breakpoint;
}

// 서버사이드 ajax 설정 헬퍼
function buildServerSideAjax(ajaxUrl, getExtraDataFn) {
    return {
        url: ajaxUrl,
        type: "GET",
        data(d) {
            const extra = typeof getExtraDataFn === "function" ? getExtraDataFn() : {};
            console.log("🔎 DataTables search params:", extra);
            return { ...d, ...extra };
        },
        dataSrc(json) {
            if (!json.success) {
                alert(`서버에서 오류가 발생했습니다.\nError message: ${json.message}`);
                return [];
            }
            return json.data || [];
        },
    };
}

// sessionStorage 상태 복원
function restoreTableState(table, storageKey) {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return false;

    try {
        const state = JSON.parse(raw);
        if (state.search) table.search(state.search);
        if (state.order) table.order(state.order);
        if (state.page !== undefined) table.page(state.page);
    } catch (e) {
        console.error("❌ restoreTableState error:", e);
    } finally {
        sessionStorage.removeItem(storageKey);
    }

    return true;
}

function getPageFromUrl(pageParamKey = 'page') {
    const params = new URLSearchParams(window.location.search);
    const rawPage = params.get(pageParamKey);
    if (!rawPage) return null;

    const parsed = Number.parseInt(rawPage, 10);
    if (Number.isNaN(parsed) || parsed < 1) return null;
    return parsed - 1; // DataTables page is 0-based
}

function updatePageInUrl(pageIndex, pageParamKey = 'page') {
    const url = new URL(window.location.href);
    const page = Number(pageIndex) + 1; // URL page is 1-based

    if (page > 1) {
        url.searchParams.set(pageParamKey, String(page));
    } else {
        url.searchParams.delete(pageParamKey);
    }

    const query = url.searchParams.toString();
    const nextUrl = `${url.pathname}${query ? `?${query}` : ''}${url.hash}`;
    window.history.replaceState(null, '', nextUrl);
}

function cacheOriginalTableBodyMarkup(table) {
    if (!table) return;

    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    // Card view rewrites td nodes into div nodes, so keep the last table-shaped
    // tbody markup available before DataTables destroy() runs.
    if (!tbody.querySelector("tr.card-view")) {
        table._dtOriginalTbodyHtml = tbody.innerHTML;
    }
}

function restoreOriginalTableBodyMarkup(table, dataTableApi = null) {
    if (!table) return;

    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    const api = dataTableApi && typeof dataTableApi.settings === "function"
        ? dataTableApi
        : null;
    let restoredFromApi = false;

    if (api) {
        const settings = api.settings()[0];
        const rowDataList = settings?.aoData || [];

        rowDataList.forEach((rowData) => {
            const row = rowData?.nTr;
            const cells = rowData?.anCells;
            if (!row || !cells?.length) return;

            while (row.firstChild) {
                row.removeChild(row.firstChild);
            }

            cells.forEach((cell) => {
                if (cell) {
                    row.appendChild(cell);
                }
            });

            row.classList.remove("card-view");
            restoredFromApi = true;
        });
    }

    if (!restoredFromApi && typeof table._dtOriginalTbodyHtml === "string") {
        tbody.innerHTML = table._dtOriginalTbodyHtml;
    }

    delete table._dtOriginalTbodyHtml;
}

function teardownSimpleBar(sbElement) {
    if (!sbElement || !window.SimpleBar) return;

    const instance = SimpleBar.instances.get(sbElement);
    if (instance) {
        instance.unMount();
    }

    const content = sbElement.querySelector(".simplebar-content");
    if (content) {
        while (content.firstChild) {
            sbElement.appendChild(content.firstChild);
        }
    }

    const simplebarNodes = sbElement.querySelectorAll(
        ".simplebar-wrapper, .simplebar-height-auto-observer-wrapper, " +
        ".simplebar-height-auto-observer, .simplebar-mask, .simplebar-offset, " +
        ".simplebar-content-wrapper, .simplebar-content, .simplebar-placeholder, " +
        ".simplebar-track, .simplebar-scrollbar"
    );

    simplebarNodes.forEach((el) => el.remove());

    sbElement.className = sbElement.className
        .replace(/\bsimplebar[\w-]*\b/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
    sbElement.removeAttribute("data-simplebar");
    sbElement.classList.remove("force-hide-scroll");
    delete sbElement._dataTableSimpleBarManaged;
}

function applyDesktopTableWidth(sbElement, minTableWidth) {
    if (!sbElement) return;

    const inner = sbElement.querySelector(".table-inner-wrapper");
    const table = sbElement.querySelector("table");
    const widthValue = Number.isFinite(minTableWidth) ? `${minTableWidth}px` : null;

    sbElement.style.removeProperty("overflow-x");
    sbElement.style.removeProperty("overflow-y");
    sbElement.style.removeProperty("height");
    sbElement.style.removeProperty("max-height");

    if (inner) {
        if (widthValue) {
            inner.style.minWidth = widthValue;
        } else {
            inner.style.removeProperty("min-width");
        }
        inner.style.removeProperty("width");
        inner.style.removeProperty("max-width");
        inner.style.removeProperty("height");
    }

    if (table) {
        table.style.width = "100%";
        if (widthValue) {
            table.style.minWidth = widthValue;
        } else {
            table.style.removeProperty("min-width");
        }
        table.style.removeProperty("height");
    }
}

// Convert table rows into card view for mobile layouts.
export function convertTableToCards(tableId, titleColumnName = "\uC81C\uBAA9") {
    const table = document.getElementById(tableId);
    if (!table) return;

    cacheOriginalTableBodyMarkup(table);

    const headCells = Array.from(table.querySelectorAll("thead th"));
    const rows = Array.from(table.querySelectorAll("tbody tr"));

    rows.forEach((row) => {
        // DataTables child row 등은 스킵
        if (row.classList.contains("child") || row.classList.contains("dtr-expanded")) return;
        if (row.classList.contains("card-view")) return;

        const cells = Array.from(row.children);

        // 데이터 없음(Empty) 처리
        const isEmpty = row.classList.contains('odd') &&
            cells.length === 1 &&
            (cells[0].classList.contains('dataTables_empty') || cells[0].textContent.trim() === "데이터가 없습니다.");

        if (isEmpty) {
            row.classList.add("card-view");
            row.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <div class="card-item empty-item">
                            <p class="card-cont">${cells[0].innerHTML}</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        row.classList.add("card-view");

        // 데이터 있음 : 카드뷰
        let titleItem = "";
        const otherItems = [];

        cells.forEach((cell, index) => {
            if (cell.classList.contains("dtr-hidden")) return;

            const headerText = headCells[index]?.textContent.trim() ?? "";
            const content = cell.innerHTML;
            const itemClass = cell.classList.contains("date") ? "card-item date" : "card-item";

            if (headerText === titleColumnName) {
                titleItem = `<div class="card-title">${content}</div>`;
            } else if (headerText) {
                otherItems.push(
                    `<div class="${itemClass}">
                        <p class="card-tit">${headerText} :</p>
                        <p class="card-cont">${content}</p>
                    </div>`,
                );
            }
        });

        row.innerHTML = `
            <div class="card">
                <div class="card-body">
                    ${titleItem}
                    ${otherItems.join("")}
                </div>
            </div>
        `;
    });
}

// DataTables pagination을 footer 영역으로 분리
function bindPaginationToFooter(api, tableId) {
    const $footer = $(`.dt-footer[data-table="${tableId}"]`);
    if (!$footer.length) return;

    const $wrapper = $(api.table().container());
    const $paginate = $wrapper.find('.dataTables_paginate');

    if (!$paginate.length) return;

    // footer에 있지 않다면 이동
    if ($paginate.parent()[0] !== $footer[0]) {
        $footer.empty().append($paginate);
    }

    // 스타일 즉시 적용 함수
    const applyStyles = () => {
        $paginate.addClass('is-footer-pagination');
        const $ul = $paginate.find('ul');
        if ($ul.length) {
            // 부트스트랩 필수 클래스와 커스텀 클래스 강제 주입
            $ul.addClass('pagination pagination-rounded');
            $ul.find('li').addClass('page-item');
            $ul.find('a').addClass('page-link');
        }
    };

    // 페이지네이션 내부 HTML이 바뀌면 자동으로 applyStyles 실행
    if (!$paginate[0]._styleObserver) {
        const observer = new MutationObserver(() => applyStyles());
        observer.observe($paginate[0], { childList: true, subtree: true });
        $paginate[0]._styleObserver = observer; // 중복 방지를 위해 저장
    }

    // 초기 실행
    applyStyles();

    window.dispatchEvent(new Event('resize'));
}

// DataTables + SimpleBar 통합 모듈
// (모바일에서 SimpleBar 완전 제거 + placeholder 높이 폭증 버그 + 중복 생성 + instance undefined 문제까지 전부 해결 버전)
export function syncTableScrollAndPagination(api, options = {}) {
    const {
        scrollSelector = '.scrollable-container',
        autoHide = false,
        recalcDelay = 200,
        enableDragScroll = true,
        dragSpeed = 1.2,
        mobileBreakpoint = 768,
        minTableWidth = null,
    } = options;

    // api 없으면 중단 (안전장치)
    if (!api) return;

    // 기존 DataTables wrapper
    const dtContainer = api.table().container();

    // 실제 테이블 기준으로 부모 탐색 (가장 안전)
    let $scrollContainer = $(api.table().node()).closest(scrollSelector);

    // fallback: wrapper 기준 탐색 (예외 대응)
    if (!$scrollContainer.length) {
        $scrollContainer = $(dtContainer).parent().find(scrollSelector);
    }

    //  그래도 없으면 강제 탐색 (최후 안정장치)
    if (!$scrollContainer.length) {
        $scrollContainer = $('.scrollable-container').has(api.table().node());
    }

    if (!$scrollContainer.length) return;

    const sbElement = $scrollContainer[0];
    if (!sbElement) return;

    // SimpleBar 라이브러리 없으면 중단
    if (!window.SimpleBar) return;

    // 현재 뷰가 모바일인지 판단
    const isMobileView = window.innerWidth <= mobileBreakpoint;

    // 카드뷰 여부
    const hasCardViewRow = sbElement.querySelector('tr.card-view') !== null;
    const isCardMode = hasCardViewRow;

    // =========================================================
// 📱 카드뷰 모드: 스크롤 제거 (모바일/PC 상관없이)
// =========================================================
    if (isCardMode) {
        teardownSimpleBar(sbElement);
        const inner = sbElement.querySelector('.table-inner-wrapper');
        if (inner) {
            inner.style.minWidth = "100%";
            inner.style.width = "100%";
        }

        // 테이블도 강제 100%
        const table = sbElement.querySelector('table');
        if (table) {
            table.style.width = "100%";
        }

        // 카드뷰는 스크롤 필요 없음 (세로 자연 흐름)
        sbElement.style.overflowX = "hidden";
        sbElement.style.overflowY = "visible";
        sbElement.style.height = "auto";
        sbElement.style.maxHeight = "none";

        return; // 카드뷰면 여기서 끝
    }

    // =========================================================
    // 📱 모바일 구간 (<= mobileBreakpoint)
    //  SimpleBar 완전 제거 + 네이티브 스크롤만 사용
    // =========================================================
    if (isMobileView) {
        teardownSimpleBar(sbElement);
        sbElement.style.overflowX = "auto";   // ← 가로스크롤 복구
        sbElement.style.overflowY = "visible"; // ← 카드뷰 잘림 방지 핵심
        sbElement.style.height = "auto";
        sbElement.style.maxHeight = "none";

        // 내부 table wrapper도 강제 해제 (DataTables + 카드뷰 대응)
        const inner = sbElement.querySelector('.table-inner-wrapper');
        if (inner) {
            inner.style.minWidth = "100%";
            inner.style.height = "auto";
        }

        return; // 🔥 반드시 여기서 종료 (중요)
    }

    // =========================================================
    // 🖥 PC / 태블릿 구간
    // SimpleBar 1회만 생성 (중복 생성 방지)
    // =========================================================
// 🔥 1. 인스턴스 없으면 강제 생성 (핵심)
    applyDesktopTableWidth(sbElement, minTableWidth);
    let instance = SimpleBar.instances.get(sbElement);
    if (instance && !sbElement._dataTableSimpleBarManaged) {
        teardownSimpleBar(sbElement);
        applyDesktopTableWidth(sbElement, minTableWidth);
        instance = null;
    }
    if (!instance) {
        instance = new SimpleBar(sbElement, {
            autoHide: autoHide,
            forceVisible: "x", // 가로 스크롤 항상 감지 (테이블 필수)
        });
    }

// 2. scrollElement 정확히 가져오기 (드래그 핵심)
    sbElement._dataTableSimpleBarManaged = true;
    const scrollEl = instance.getScrollElement();
    if (!scrollEl) return;

// 3. 초기 재계산
    instance.recalculate();

// X축 스크롤 표시 제어
    const toggleHorizontalScrollbar = () => {
        const contentWrapper = sbElement.querySelector('.table-inner-wrapper');
        if (!contentWrapper) return;

        const containerWidth = sbElement.clientWidth;
        const contentWidth = contentWrapper.scrollWidth;

        const shouldShowScroll = contentWidth > containerWidth;

        if (shouldShowScroll) {
            sbElement.classList.remove("force-hide-scroll");
        } else {
            sbElement.classList.add("force-hide-scroll");
        }
    };

    // =========================================================
    // 🖱 콘텐츠 드래그 스크롤 (테이블 잡고 좌우 드래그)
    // =========================================================
    if (enableDragScroll && !scrollEl.__contentDragBound) {
        scrollEl.__contentDragBound = true;

        let isDown = false;
        let startX = 0;
        let startScroll = 0;

        scrollEl.addEventListener("mousedown", (e) => {
            // 버튼, 링크, 입력 요소 클릭 시 드래그 비활성 (UX 보호)
            if (e.target.closest("button, a, input, select, .btn")) return;

            isDown = true;
            scrollEl.classList.add("is-dragging");
            startX = e.pageX;
            startScroll = scrollEl.scrollLeft;
        });

        // 스크롤 영역 밖에서도 드래그 해제되도록 window에 바인딩
        window.addEventListener("mouseup", () => {
            isDown = false;
            scrollEl.classList.remove("is-dragging");
        });

        scrollEl.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();

            const walk = (e.pageX - startX) * dragSpeed;
            scrollEl.scrollLeft = startScroll - walk;
        });
    }

    // =========================================================
    // 🎯 draw 직후 안정화 (placeholder 높이 튐 방지 핵심)
    // =========================================================
    requestAnimationFrame(() => {
        // SimpleBar 내부 크기 재계산
        instance.recalculate();
        toggleHorizontalScrollbar();
    }, 50);

    // =========================================================
    // 🧩 탭 전환 / 숨김 영역 렌더 대응 재계산
    // =========================================================
    setTimeout(() => {
        const inst = SimpleBar.instances.get(sbElement);
        if (inst) {
            inst.recalculate();
            toggleHorizontalScrollbar();
        }
    }, recalcDelay);

    // =========================================================
    // 📐 resize 대응 (중복 바인딩 방지 포함)
    // =========================================================
    if (!sbElement._resizeHandlerBound) {
        sbElement._resizeHandlerBound = true;

        const handleViewportResize = () => {
            const isNowMobile = window.innerWidth <= mobileBreakpoint;

            // 모바일로 전환되면 즉시 제거
            if (isNowMobile) {
                teardownSimpleBar(sbElement);
                return;
            }

            // PC 상태면 재계산만 수행
            const inst = SimpleBar.instances.get(sbElement);
            if (inst) {
                setTimeout(() => {
                    inst.recalculate();
                    toggleHorizontalScrollbar();
                }, 150);
                return;
            }

            setTimeout(() => {
                syncTableScrollAndPagination(api, {
                    scrollSelector,
                    autoHide,
                    recalcDelay,
                    enableDragScroll,
                    dragSpeed,
                    mobileBreakpoint,
                    minTableWidth,
                });
            }, 150);
        };

        window.addEventListener("resize", handleViewportResize);
        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", handleViewportResize);
        }
    }
}

export function loadDataTable({
                                  tableId,
                                  ajaxUrl,
                                  columns,
                                  defaultOrderIndex = 0,
                                  defaultOrderDir = "desc",
                                  minTableWidth = null,
                                  getExtraDataFn,
                                  onDrawCallbackList = [],
                                  enableOrdering = true,
                                  mobileBreakpoint = 768,
                                  enableCardView = true,
                                  enableResponsive = false,
                                  titleColumnName = "제목",
                                  stateStorageKey = "articleListState",
                                  enableUrlPageState = false,
                                  pageParamKey = "page",
                                  extraOptions = {},
                              }) {
    const $table = $(`#${tableId}`);
    let table;

    let currentIsMobile = isMobile(mobileBreakpoint);
    let restoredOnce = false;
    let resizeTimer;

    function initTable({ forceReinit = false } = {}) {
        if (!$table || !$table.length) return;

        const exists = $.fn.DataTable.isDataTable($table);

        // 이미 테이블이 있고, 강제 재초기화가 아니면 paging 유지 reload
        if (exists && !forceReinit) {
            const dt = $table.DataTable();
            dt.ajax.url(ajaxUrl);
            dt.ajax.reload(null, false);
            table = dt;
            return table;
        }

        // 진짜 재초기화 (모바일 ↔ PC 전환)
        if (exists) {
            const dt = $table.DataTable();
            restoreOriginalTableBodyMarkup($table[0], dt);
            dt.destroy();
            $table.empty();
        }

        currentIsMobile = isMobile(mobileBreakpoint);
        restoredOnce = false;

        const responsiveSet = enableResponsive
            ? {
                responsive: true,
                autoWidth: true,
                scrollX: false,
                scrollCollapse: false,
            }
            : {
                responsive: false,
                scrollX: false,
                scrollCollapse: false,
                autoWidth: false,
            };

        const options = {
            dom: "rt",
            serverSide: true,
            processing: true,
            paging: true,
            info: false,
            searching: false,
            lengthChange: false,
            ordering: enableOrdering && !currentIsMobile,
            ...responsiveSet,
            pageLength: 20,
            order: enableOrdering
                ? [[defaultOrderIndex, defaultOrderDir]]
                : [],
            language: {
                processing:
                    "<div class='mt-3'><div class='spinner-border spinner-border-sm me-1'></div> 로딩중...</div>",
                emptyTable: "데이터가 없습니다.",
                zeroRecords: "데이터가 없습니다.",
                paginate: {
                    previous: "<i class='ri-arrow-left-s-line'></i>",
                    next: "<i class='ri-arrow-right-s-line'></i>",
                },
            },
            ajax: buildServerSideAjax(ajaxUrl, getExtraDataFn),
            columns,
            columnDefs: [
                {
                    targets: "_all",
                    orderSequence: ["desc", "asc"],
                },
            ],

            // 내부 기본 drawCallback + 사용자 정의 drawCallback
            drawCallback(settings) {
                const api = this.api();

                // 모바일 카드뷰 변환
                if (enableCardView && currentIsMobile) {
                    convertTableToCards(tableId, titleColumnName);
                }

                // 외부 콜백 실행
                onDrawCallbackList.forEach((fn) => {
                    if (typeof fn === "function") fn(api);
                });

                // 상태 복원 1회
                if (!restoredOnce) {
                    let restored = false;

                    if (enableUrlPageState) {
                        const pageFromUrl = getPageFromUrl(pageParamKey);
                        if (pageFromUrl !== null) {
                            api.page(pageFromUrl);
                            restored = true;
                        }
                    }

                    if (!restored) {
                        restored = restoreTableState(api, stateStorageKey);
                    }

                    restoredOnce = true;
                    if (restored) {
                        api.draw(false);
                        return;
                    }
                }

                if (enableUrlPageState) {
                    updatePageInUrl(api.page(), pageParamKey);
                }

                // ❗ 핵심: draw마다 재초기화 금지 → 재계산만 수행
                syncTableScrollAndPagination(api, {
                    recalcDelay: 300,
                    enableDragScroll: true,
                    mobileBreakpoint,
                    minTableWidth,
                });

                // pagination footer 고정
                bindPaginationToFooter(api, tableId);
            },

            ...extraOptions,
        };

        table = $table.DataTable(options);

        // 🔥 draw 이벤트에서 recalculate만 (placeholder 높이 안정화 핵심)
        const $scrollContainer = $(table.table().container()).closest(
            ".scrollable-container"
        );
        const sbElement = $scrollContainer[0];

        $table
            .off(`draw.simplebar_${tableId}`)
            .on(`draw.simplebar_${tableId}`, function () {
                if (!window.SimpleBar || !sbElement) return;

                const hasCardViewRow = sbElement.querySelector('tr.card-view') !== null;
                if (!currentIsMobile && !hasCardViewRow) {
                    syncTableScrollAndPagination(table, {
                        recalcDelay: 300,
                        enableDragScroll: true,
                        mobileBreakpoint,
                        minTableWidth,
                    });
                    return;
                }

                const instance = SimpleBar.instances.get(sbElement);
                if (!instance) return;

                requestAnimationFrame(() => {
                    instance.recalculate();
                });
            });

        requestAnimationFrame(() => {
            if (!window.SimpleBar || !sbElement || currentIsMobile) return;

            const hasCardViewRow = sbElement.querySelector('tr.card-view') !== null;
            if (hasCardViewRow || SimpleBar.instances.get(sbElement)) return;

            syncTableScrollAndPagination(table, {
                recalcDelay: 300,
                enableDragScroll: true,
                mobileBreakpoint,
                minTableWidth,
            });
        });

        return table;
    }

    // 최초 초기화
    initTable();

    // 리사이즈 이벤트 (모바일 전환 대응)
    const resizeEventName = `resize.dataTable_${tableId}`;
    $(window)
        .off(resizeEventName)
        .on(resizeEventName, function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const newIsMobile = isMobile(mobileBreakpoint);
                if (newIsMobile !== currentIsMobile) {
                    initTable({ forceReinit: true });
                }
            }, 250);
        });

    return table;
}

// 날짜 컬럼 포맷 (YY.MM.DD HH:mm:SS)
export function formatDateCol(data) {
    if (!data) return "";
    const d = new Date(data);
    if (isNaN(d)) return "";

    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");

    return `<span>${yy}.${mm}.${dd}</span> ${hh}:${min}:${ss}`;
}

