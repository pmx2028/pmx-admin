/*
 송차장님이 수정하셨던 datatable-handler 버전
 현재 쓰이진 않으나 일단 기록용으로 남겨둠
 */

// // 모바일 여부 판단
// const isMobile = (breakpoint = 710) => window.innerWidth <= breakpoint;
//
// // 날짜 포맷팅 (createdAt, updatedAt 등)
// export function formatDateCol(data) {
//     if (!data) return "";
//     const d = new Date(data);
//     if (isNaN(d.getTime())) return ""; // 유효하지 않은 날짜 체크 강화
//
//     const pad = (n) => String(n).padStart(2, "0");
//     const yy = String(d.getFullYear()).slice(2);
//     const mm = pad(d.getMonth() + 1);
//     const dd = pad(d.getDate());
//     const hh = pad(d.getHours());
//     const min = pad(d.getMinutes());
//     const ss = pad(d.getSeconds());
//
//     return `<span>${yy}.${mm}.${dd}</span> ${hh}:${min}:${ss}`;
// }
//
// //UI Features: Drag Scroll
// function attachDragScroll(element) {
//     if (!element) return;
//
//     // 타겟 요소 결정 (SimpleBar 지원)
//     let targetElement = element;
//     if (element.hasAttribute("data-simplebar") || element.classList.contains("simplebar-init")) {
//         targetElement = element.querySelector(".simplebar-content-wrapper") || element;
//     } else {
//         const childWrapper = element.querySelector(".simplebar-content-wrapper");
//         if (childWrapper) targetElement = childWrapper;
//     }
//
//     // 중복 바인딩 방지
//     if (targetElement.dataset.dragEnabled === "true") return;
//     targetElement.dataset.dragEnabled = "true";
//
//     let isDown = false;
//     let startX;
//     let startScrollLeft;
//     let velX = 0; // 관성 효과를 위한 변수 (선택 사항)
//     let rAF;
//
//     // 스타일 적용
//     targetElement.style.cursor = 'grab';
//     targetElement.style.userSelect = 'none';
//     targetElement.style.webkitUserSelect = 'none';
//
//     const onMouseDown = (e) => {
//         if (e.button !== 0) return; // 좌클릭만 허용
//         isDown = true;
//         targetElement.classList.add('active');
//         targetElement.style.cursor = 'grabbing';
//
//         startX = e.pageX;
//         startScrollLeft = targetElement.scrollLeft;
//
//         // 텍스트나 이미지 드래그 방지
//         e.preventDefault();
//         document.addEventListener('mousemove', onMouseMove);
//         document.addEventListener('mouseup', onMouseUp);
//     };
//
//     const onMouseUp = () => {
//         isDown = false;
//         targetElement.classList.remove('active');
//         targetElement.style.cursor = 'grab';
//
//         if (rAF) cancelAnimationFrame(rAF);
//
//         document.removeEventListener('mousemove', onMouseMove);
//         document.removeEventListener('mouseup', onMouseUp);
//     };
//
//     const onMouseMove = (e) => {
//         if (!isDown) return;
//         e.preventDefault();
//
//         if (rAF) cancelAnimationFrame(rAF); // requestAnimationFrame을 사용하여 부드러운 스크롤 처리
//         rAF = requestAnimationFrame(() => {
//             const x = e.pageX;
//             const walk = (x - startX) * 2; // 스크롤 속도
//             targetElement.scrollLeft = startScrollLeft - walk;
//         });
//     };
//
//     targetElement.addEventListener('mousedown', onMouseDown);
// }
//
// //UI Features: Card View Converter
// function convertTableToCards(tableId, titleColumnName = "제목") {
//     const table = document.getElementById(tableId);
//     if (!table) return;
//
//     // 헤더 정보를 미리 캐싱 (반복문 밖에서 1회만 실행)
//     const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim());
//     const rows = Array.from(table.querySelectorAll("tbody tr"));
//
//     // DOM Fragment 생성 (리플로우 최소화)
//     rows.forEach((row) => {
//         // 이미 변환되었거나, 확장 행(child)인 경우 스킵
//         if (row.classList.contains("card-view") || row.classList.contains("child") || row.classList.contains("dtr-expanded")) return;
//         row.classList.add("card-view");
//
//         const cells = Array.from(row.children);
//         let titleHtml = "";
//         let bodyHtml = "";
//
//         cells.forEach((cell, index) => {
//             if (cell.classList.contains("dtr-hidden")) return;
//
//             const headerText = headers[index] || "";
//             const content = cell.innerHTML; // DOM 읽기
//
//             // 날짜 컬럼 등 특정 클래스 유지
//             const itemClass = cell.classList.contains("date") ? "card-item date" : "card-item";
//
//             if (headerText === titleColumnName) {
//                 titleHtml = `<div class="card-title">${content}</div>`;
//             } else if (headerText) {
//                 // 템플릿 리터럴로 문자열 조합 (배열 push보다 빠름)
//                 bodyHtml += `
//                     <div class="${itemClass}">
//                         <p class="card-tit">${headerText} :</p>
//                         <p class="card-cont">${content}</p>
//                     </div>`;
//             }
//         });
//
//         // DOM 쓰기 (1회 수행)
//         row.innerHTML = `
//             <div class="card">
//                 <div class="card-body">
//                     ${titleHtml}
//                     ${bodyHtml}
//                 </div>
//             </div>
//         `;
//     });
// }
//
// //서버사이드 ajax 설정 헬퍼
// function buildServerSideAjax(ajaxUrl, getExtraDataFn) {
//     return {
//         url: ajaxUrl,
//         type: "GET",
//         data(d) {
//             const extra = typeof getExtraDataFn === "function" ? getExtraDataFn() : {};
//             console.log("🔎 DataTables search params:", extra);
//             return { ...d, ...extra };
//         },
//         dataSrc(json) {
//             if (!json.success) {
//                 alert(`서버 오류: ${json.message || '데이터를 불러올 수 없습니다.'}`);
//                 return [];
//             }
//             return json.data || [];
//         },
//     };
// }
//
// // sessionStorage 상태 복원
// function restoreTableState(api, storageKey) {
//     const raw = sessionStorage.getItem(storageKey);
//     if (!raw) return false;
//
//     try {
//         const state = JSON.parse(raw);
//         if (state.search) api.search(state.search);
//         if (state.order) api.order(state.order);
//         if (state.page !== undefined) api.page(state.page);
//     } catch (e) {
//         console.error("❌ restoreTableState error:", e);
//     } finally {
//         sessionStorage.removeItem(storageKey);
//     }
//     return true;
// }
//
// export function loadDataTable({
//                                   tableId,
//                                   ajaxUrl,
//                                   columns,
//                                   defaultOrderIndex = 0,
//                                   defaultOrderDir = "desc",
//                                   getExtraDataFn,
//                                   onDrawCallbackList = [],
//                                   enableOrdering = true,
//                                   mobileBreakpoint = 710,
//                                   enableCardView = true,
//                                   enableResponsive = false,
//                                   titleColumnName = "제목",
//                                   stateStorageKey = "articleListState",
//                                   extraOptions = {},
//                               }) {
//     const $table = $(`#${tableId}`);
//     let tableInstance = null;
//     let resizeTimer = null;
//     let currentIsMobile = isMobile(mobileBreakpoint);
//     let restoredOnce = false;
//
//     // 초기화 및 재초기화 로직
//     const initTable = ({ forceReinit = false } = {}) => {
//         if (!$table.length) return;
//
//         const exists = $.fn.DataTable.isDataTable($table);
//
//         // 단순 데이터 리로드 (이미 존재하고, 리사이즈에 의한 강제 재초기화가 아닐 때)
//         if (exists && !forceReinit) {
//             const dt = $table.DataTable();
//             dt.ajax.url(ajaxUrl);
//             dt.ajax.reload(null, false);
//             return dt;
//         }
//
//         // 완전 재초기화 (모바일 ↔ PC 전환 등 구조적 변경 시)
//         if (exists) {
//             const dt = $table.DataTable();
//             dt.destroy();
//
//             // 테이블 구조 복구 (디자인 깨짐 방지)
//             $table.find('tbody').empty();
//             $table.find('thead').show().removeAttr('style');
//             $table.find('thead th').removeAttr('style class');
//             $table.css('width', '100%'); // 너비 강제
//         }
//
//         currentIsMobile = isMobile(mobileBreakpoint);
//         restoredOnce = false;
//
//         // 모바일/PC에 따른 반응형 설정
//         const responsiveOptions = enableResponsive ? {
//             responsive: true,
//             autoWidth: true,
//             scrollX: false,
//             scrollCollapse: false,
//         } : {
//             responsive: false,
//             scrollX: false, // SimpleBar 등을 사용하므로 내부 스크롤 OFF
//             scrollCollapse: false,
//             autoWidth: false,
//         };
//
//         const dtOptions = {
//             serverSide: true,
//             processing: true,
//             paging: true,
//             info: false,
//             searching: false,
//             lengthChange: false,
//             ordering: enableOrdering && !currentIsMobile,
//             pageLength: 20,
//             order: enableOrdering ? [[defaultOrderIndex, defaultOrderDir]] : [],
//             ...responsiveOptions,
//
//             language: {
//                 processing: "<div class='mt-3'><div class='spinner-border spinner-border-sm me-1'></div> 로딩중...</div>",
//                 emptyTable: "데이터가 없습니다.",
//                 zeroRecords: "데이터가 없습니다.",
//                 paginate: {
//                     previous: "<i class='ri-arrow-left-s-line'></i>",
//                     next: "<i class='ri-arrow-right-s-line'></i>",
//                 },
//             },
//
//             ajax: buildServerSideAjax(ajaxUrl, getExtraDataFn),
//             columns,
//
//             drawCallback(settings) {
//                 const api = this.api();
//                 const $header = $(api.table().header());
//
//                 // 스타일링 보정
//                 $(".dataTables_paginate > .pagination").addClass("pagination-rounded");
//
//                 if (enableCardView && currentIsMobile) {
//                     // [Mobile] 카드뷰
//                     $header.hide();
//                     convertTableToCards(tableId, titleColumnName);
//                 } else {
//                     // [PC] 테이블뷰
//                     $header.show();
//
//                     // [PC] 컬럼 깨짐 방지를 위한 재계산
//                     api.columns.adjust();
//
//                     // [PC] 드래그 스크롤 바인딩
//                     const simplebar = $table.closest('[data-simplebar]')[0];
//                     if (simplebar) {
//                         attachDragScroll(simplebar);
//                     } else {
//                         // fallback: overflow auto인 부모 찾기
//                         const parent = $table.parent()[0];
//                         if(parent) attachDragScroll(parent);
//                     }
//                 }
//
//                 // 상태 복원 (최초 1회)
//                 if (!restoredOnce) {
//                     const restored = restoreTableState(api, stateStorageKey);
//                     restoredOnce = true;
//                     if (restored) {
//                         // draw(false)를 호출하면 drawCallback이 다시 실행되므로 return
//                         api.draw(false);
//                         return;
//                     }
//                 }
//
//                 // 사용자 정의 콜백 실행
//                 if (Array.isArray(onDrawCallbackList)) {
//                     onDrawCallbackList.forEach((fn) => {
//                         if (typeof fn === "function") fn(api);
//                     });
//                 }
//             },
//             ...extraOptions,
//         };
//
//         tableInstance = $table.DataTable(dtOptions);
//         return tableInstance;
//     };
//
//     // 최초 초기화
//     initTable();
//
//     // 리사이즈 이벤트 핸들러 (디바운싱 적용)
//     const resizeNamespace = `resize.dataTable_${tableId}`;
//     $(window).off(resizeNamespace).on(resizeNamespace, () => {
//         clearTimeout(resizeTimer);
//         resizeTimer = setTimeout(() => {
//             const newIsMobile = isMobile(mobileBreakpoint);
//             // 모바일 <-> PC 상태가 변했을 때만 재초기화 수행 (불필요한 리로드 방지)
//             if (newIsMobile !== currentIsMobile) {
//                 initTable({ forceReinit: true });
//             }
//         }, 200); // 250ms -> 200ms 반응성 약간 향상
//     });
//
//     return tableInstance;
// }