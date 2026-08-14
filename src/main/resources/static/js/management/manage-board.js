import {formatDateCol, loadDataTable, syncTableScrollAndPagination} from "../common/datatable-handler.js";
import {setupCreateButton, setupEditButtons, setupSubmitButton} from "./management-utils.js";

const MOBILE_LAYOUT_BREAKPOINT = 786;

document.addEventListener("DOMContentLoaded", async () => {

    const tableId = "dataTable";
    let isMobileLayout = isMobileManageBoardLayout();
    toggleBoardCreateButton(isMobileLayout);
    await reloadBoardTable(tableId, { hideActionColumn: isMobileLayout });

    const container = document.querySelector("#"+tableId);
    if (!container) return;

    const modalId = "board-modal";
    const modalEl = document.getElementById(modalId);
    const bsModal = new bootstrap.Modal(modalEl);


    setupCreateButton(modalEl, bsModal, openCreateModal, "openBbsModalBtn");
    setupEditButtons(container, modalEl, bsModal, openEditModal);
    setupSubmitButton(
        modalEl,
        bsModal,
        createPost,
        updatePost,
        async () => {
            await reloadBoardTable(tableId, { hideActionColumn: isMobileLayout });
        }
    );

    let resizeTimer = null;
    window.addEventListener("resize", () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(async () => {
            const nextMobileLayout = isMobileManageBoardLayout();
            if (nextMobileLayout === isMobileLayout) return;

            isMobileLayout = nextMobileLayout;
            toggleBoardCreateButton(isMobileLayout);
            await reloadBoardTable(tableId, { hideActionColumn: isMobileLayout });
        }, 200);
    });

});


async function openCreateModal(modalEl) {
    modalEl.dataset.mode = "create";
    modalEl.dataset.editId = "";

    // 제목 색상, 제목명 변경
    const modalHeader = modalEl.querySelector(".modal-header");
    modalHeader.classList.remove("bg-success");

    const modalTitle = modalEl.querySelector(".modal-title");
    modalTitle.innerHTML = `<i class="ri-edit-fill"></i> 게시판 추가`;

    // 버튼 텍스트, 색상 변경
    const saveBtn = modalEl.querySelector("#btn-save");
    saveBtn.innerHTML = `<i class="ri-add-circle-line me-1"></i> 게시판추가`;
    saveBtn.classList.add("btn-primary");
    saveBtn.classList.remove("btn-success");

    // 값 초기화
    modalEl.querySelector("#name").value      = "";
    modalEl.querySelector("#code").value      = "";
    modalEl.querySelector("#kindof").value    = "-";
    modalEl.querySelector("#anon").value      = "-";
    modalEl.querySelector("#commented").value = "-";
    modalEl.querySelector("#activated").value = "-";

}


async function openEditModal(modalEl, id) {
    modalEl.dataset.mode = "edit";
    modalEl.dataset.editId = id;

    // 제목 색상, 제목명 변경
    const modalHeader = modalEl.querySelector(".modal-header");
    modalHeader.classList.add("bg-primary");

    const modalTitle = modalEl.querySelector(".modal-title");
    modalTitle.innerHTML = `<i class="ri-edit-fill"></i> 게시판 수정`;

    // 버튼 텍스트, 색상 변경
    const saveBtn = modalEl.querySelector("#btn-save");
    saveBtn.innerHTML = `<i class="ri-check-line me-1"></i> 수정`;
    saveBtn.classList.remove("btn-primary");
    saveBtn.classList.add("btn-primary");


    const res = await fetch(`/api/boards/${id}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });

    if (!res.ok) {
        alert("게시판 정보를 불러오지 못했습니다.");
        return;
    }
    const result = await res.json();
    const item = result.data;
    console.log(item);

    modalEl.querySelector("#name").value      = item.name;
    modalEl.querySelector("#code").value      = item.code;
    modalEl.querySelector("#kindof").value    = item.kindof;
    modalEl.querySelector("#anon").value      = item.anon;
    modalEl.querySelector("#commented").value = item.commented;
    modalEl.querySelector("#activated").value = item.activated;
}

function buildDtoAndValid(modalEl) {
    const name      = modalEl.querySelector("#name").value.trim();
    const code      = modalEl.querySelector("#code").value.trim();
    const kindof    = modalEl.querySelector("#kindof").value;
    const anon      = modalEl.querySelector("#anon").value;
    const commented = modalEl.querySelector("#commented").value;
    const activated = modalEl.querySelector("#activated").value;

    // --------------------------
    // 🔍 Validation (하나라도 실패하면 바로 return false)
    // --------------------------
    if (!name) {
        alert("게시판명을 입력해주세요.");
        return false;
    }

    if (!kindof || kindof==="-") {
        alert("게시판 종류를 선택해주세요");
        return false;
    }

    if (!anon || anon==="-") {
        alert("공개여부를 선택해주세요");
        return false;
    }

    if (!commented || commented==="-") {
        alert("댓글사용여부를 선택해주세요");
        return false;
    }

    if (!activated || activated==="-") {
        alert("사용여부를 선택해주세요");
        return false;
    }

    // --------------------------
    // ✅ 유효성 통과 시에만 DTO 리턴
    // --------------------------
    return {
        name,
        code,
        kindof,
        anon,
        commented,
        activated
    };
}

async function createPost(modalEl) {
    const payload = buildDtoAndValid(modalEl);
    if (!payload) return false; // 🔥 검증 실패 시 API 호출 X

    const res = await postWithCsrf("/api/boards", payload);

    if (!res.ok) {
        console.error("❌ 등록 실패", res);
        alert("등록에 실패했습니다.");
        return false;
    }

    return true;
}

async function updatePost(modalEl) {
    const id = modalEl.dataset.editId;
    if (!id) return false;

    const payload = buildDtoAndValid(modalEl);
    if (!payload) return false; // 🔥 검증 실패 시 API 호출 X

    const res = await putWithCsrf(`/api/boards/${id}`, payload);

    if (!res.ok) {
        console.error("❌ 수정 실패", res);
        alert("수정에 실패했습니다.");
        return false;
    }

    return true;
}


/* =========================
 * DataTable 재로드
 * ========================= */
function isMobileManageBoardLayout() {
    return window.innerWidth <= MOBILE_LAYOUT_BREAKPOINT;
}

function toggleBoardCreateButton(hide) {
    const createButtonRow = document.querySelector(".boards-btn");
    if (!createButtonRow) return;
    createButtonRow.classList.toggle("d-none", hide);
}

function reloadBoardTable(
    tableId = "dataTable",
    { hideActionColumn = isMobileManageBoardLayout() } = {}
) {
    const ajaxUrl = "/api/boards";

    const columns = getBoardTableColumns();

    loadDataTable({
        tableId,
        ajaxUrl,
        columns,
        enableOrdering: false,
        defaultOrderIndex: null,
        getExtraDataFn: () => {},
        titleColumnName: "게시판명",
        mobileBreakpoint: 640,
        enableCardView: true,
        enableResponsive : false,
        extraOptions:{
            responsive: false,
            autoWidth: false,
            dom: 'rtip',
        }
    });

    function getBoardTableColumns() {
        return [
            {
                data: null,
                title: "#",
                className: "data-txt",
                orderable: false,
                width: "5%",
                render: (data, type, row, meta) => {
                    const start = meta?.settings?._iDisplayStart ?? 0;
                    return start + meta.row + 1;
                }
            },
            {
                data: 'name',
                title: '게시판명',
                className: 'data-tit text-start',
                render: (data, type, row) => {
                    return `<a class="link-tite"><strong>${data || ''}</strong></a>`;
                }
            },
            {   data: 'code',
                title: '게시판코드',
                className: 'data-txt',
                render: (data) => data ?? "-"
            },
            {   data: 'kindofLabel',
                title: '게시판종류',
                className: 'data-txt',
                render: (data) => data ?? "-"
            },
            {   data: 'anonLabel',
                title: '작성자노출',  // anon
                className: 'data-txt',
                render: (data) => data ?? "-"
            },
            {   data: 'noteCount',
                title: '게시글 수',  // anon
                className: 'data-txt',
                render: (data) => data ?? "0"
            },
            {   data: 'commented',
                title: '댓글사용여부',  //
                className: 'data-txt',
                render: (data) => data ? "댓글사용" : "댓글미사용"
            },
            {   data: 'activated',
                title: '사용여부',  //
                className: 'data-txt',
                render: (data) => data ? "사용" : "미사용"
            },
            {
                data: 'createdAt',
                title: '생성일',
                className: 'data-txt',
                render: formatDateCol
            },
            {
                data: null,
                title: "작업",
                className: "bt-box",
                orderable: false,
                render: (data, type, row) => {
                    if (hideActionColumn || isMobileManageBoardLayout()) return "-";
                    return `
                    <button 
                        type="button" 
                        class="btn btn-outline-secondary btn-edit" 
                        data-bs-toggle="modal" 
                        data-bs-target="#board-modal" 
                        data-id="${row.id}"
                        data-mode="edit">
                        수정
                    </button>
                    <button 
                        type="button" 
                        class="btn btn-danger btn-delete"
                        data-id="${row.id}">
                        삭제
                    </button>
                `;
                }
            }
        ];
    }
}



