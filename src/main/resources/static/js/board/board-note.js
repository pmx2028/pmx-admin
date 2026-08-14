import {formatDateCol, loadDataTable} from "../common/datatable-handler.js";
import {
    downloadFileFromLink,
    getCsrfHeaders,
    setupCreateButton,
    setupEditButtons,
    setupSubmitButton
} from "../management/management-utils.js";


let currentBoardId = "";

document.addEventListener("DOMContentLoaded", async () => {
    const boardId = document.querySelector('meta[name="board_id"]')?.content;
    currentBoardId = boardId

    const tableId = "dataTable";
    reloadNoteTable(tableId, boardId);

    const container = document.querySelector("#"+tableId);
    if (!container) return;


    // ----------- 검색 초기화 ----------
    const searchBtn = $id("btn-search");
    const resetBtn = $id("btn-reset");
    const inputEl = $id("search-target-text");

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            reloadNoteTable(tableId, boardId, { resetToFirstPage: true });
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            inputEl.value = "";
            reloadNoteTable(tableId, boardId, { resetToFirstPage: true });
        });
    }
    // Enter 키로 검색 실행
    if (inputEl) {
        inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                reloadNoteTable(tableId, boardId, { resetToFirstPage: true });
            }
        });
    }

    // ----------- view 모달 관련 ----------
    const viewModalEl = document.getElementById("note-view-modal");
    const viewModal = new bootstrap.Modal(viewModalEl,{
        backdrop: 'static', // 배경 클릭해도 닫지 않음
        keyboard: false     // ESC 눌러도 닫지 않음
    });
    setupCommentButtons(viewModalEl);

    container.addEventListener("click", async (e) => {
        const link = e.target.closest(".view-board");

        if (!link) return;
        e.preventDefault();

        const id = link.dataset.id;
        if (!id) return;

        await openViewModal(viewModalEl, id);
        viewModal.show();
    });

    downloadFileFromLink() // 파일 다운로드 기능


    // ----------- 작성, 수정 모달 관련 ----------
    const modalId = "note-editor-modal";
    const modalEl = document.getElementById(modalId);
    const bsModal = new bootstrap.Modal(modalEl, {
        backdrop: 'static', // 배경 클릭해도 닫지 않음
        keyboard: false     // ESC 눌러도 닫지 않음
    });

    // CKEditor 모달창 포커스 문제 해결
    document.addEventListener('focusin', (e) => {
        // 클릭한 요소가 CKEditor 관련 요소라면 부트스트랩 포커스 이벤트를 무시함
        if (e.target.closest('.ck-editor__editable, .ck-source-editing-area, .ck')) {
            e.stopImmediatePropagation();
        }
    });

    setupCreateButton(modalEl, bsModal, openCreateModal, "createBtn");
    setupEditButtons(container, modalEl, bsModal, openEditModal);
    setupDeleteButton(tableId, container);
    setupSubmitButton(
        modalEl,
        bsModal,
        createPost,
        updatePost,
        async () => {
            await reloadNoteTable(tableId, boardId);
        }
    );

    initNoteClipFileUpload();

    // 데이터테이블 리스트 첨부파일 이름 툴팁
    new bootstrap.Tooltip(document.body, {
        selector: '[data-bs-toggle="tooltip"]',
        trigger: 'hover',
        delay: { show: 100, hide: 0 }  // 마우스를 떼자마자 바로 사라지게
    });
});


async function openViewModal(modalEl, id) {
    modalEl.dataset.noteId = id;

    const res = await fetch(`/api/boards/${currentBoardId}/notes/${id}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });

    if (!res.ok) {
        alert("게시글 정보를 불러오지 못했습니다.");
        return;
    }
    const result = await res.json();
    const item = result.data;

    modalEl.querySelector("#view-title").textContent = item.title ?? "";
    modalEl.querySelector("#view-created-at").textContent = formatDateTime(item.createdAt);
    modalEl.querySelector("#view-username").textContent = item.userName ?? "";
    modalEl.querySelector("#view-content").innerHTML = item.content ?? "";

    const fileViewTitleContainer = modalEl.querySelector('#file-view-title');
    const fileViewResultContainer = modalEl.querySelector('#file-view-result');
    const fileViewHr = modalEl.querySelector("#file-view-hr");
    const fileListContainer = modalEl.querySelector('#file-view-list');
    const commentSection = modalEl.querySelector('#comment-view-section');
    const commentListContainer = modalEl.querySelector('#comment-view-list');
    const commentEmptyContainer = modalEl.querySelector('#comment-view-empty');
    const commentContent = modalEl.querySelector('#comment-content');
    const clipInfoList = Array.isArray(item.clipInfoList) ? item.clipInfoList : [];
    const commentInfoList = Array.isArray(item.commentInfoList) ? item.commentInfoList : [];

    fileListContainer.innerHTML = "";
    if (clipInfoList.length > 0) {
        fileViewTitleContainer.classList.remove("d-none");
        fileViewResultContainer.classList.remove("d-none");
        fileViewHr?.classList.remove("d-none");

        clipInfoList.forEach(clip => {
            const cardEl = createFileCardElement(clip, "view");
            fileListContainer.appendChild(cardEl);
        });
    } else {
        fileViewTitleContainer.classList.add("d-none");
        fileViewResultContainer.classList.add("d-none");
        fileViewHr?.classList.add("d-none");
    }

    if (Number(item.commented) === 1 && commentSection && commentListContainer && commentEmptyContainer) {
        commentSection.classList.remove("d-none");
        if (commentContent) commentContent.value = "";
        renderCommentInfoList(commentInfoList, commentListContainer, commentEmptyContainer);
    } else if (commentSection && commentListContainer && commentEmptyContainer) {
        commentSection.classList.add("d-none");
        commentListContainer.innerHTML = "";
        commentEmptyContainer.classList.add("d-none");
    }
}

async function openCreateModal(modalEl) {
    modalEl.dataset.mode = "create";
    modalEl.dataset.editId = "";

    const modalTitle = modalEl.querySelector(".modal-title");
    modalTitle.innerHTML = `<i class="ri-edit-fill"></i> 글 작성`;

    modalEl.querySelector("#title").value = "";
    modalEl.querySelector('#file-upload-list').innerHTML = "";

    await window.editorReady;

    if (window.mainEditor?.setData) {
        window.mainEditor.setData("");
    } else {
        console.warn('CKEditor 인스턴스가 존재하지 않거나 초기화되지 않았습니다.');
    }
}

async function openEditModal(modalEl, id) {
    modalEl.dataset.mode = "edit";
    modalEl.dataset.editId = id;

    const modalTitle = modalEl.querySelector(".modal-title");
    modalTitle.innerHTML = `<i class="ri-edit-fill"></i> 글 수정`;

    const res = await fetch(`/api/boards/${currentBoardId}/notes/${id}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });

    if (!res.ok) {
        alert("게시글 정보를 불러오지 못했습니다.");
        return;
    }
    const result = await res.json();
    const item = result.data;

    modalEl.querySelector("#title").value = item.title ?? "";

    await window.editorReady;

    if (window.mainEditor?.setData) {
        window.mainEditor.setData(item.content || '');
    } else {
        console.warn('CKEditor 인스턴스가 존재하지 않거나 초기화되지 않았습니다.');
    }

    const fileListContainer = modalEl.querySelector('#file-upload-list');
    fileListContainer.innerHTML = "";

    item.clipInfoList.forEach(clip => {
        const cardEl = createFileCardElement(clip);
        fileListContainer.appendChild(cardEl);
    });
}

function buildDtoAndValid(modalEl) {
    const title = modalEl.querySelector("#title").value.trim();
    const content = window.mainEditor?.getData() || '';

    // 파일 clipIds 모두 수집
    const clipIds = Array.from(
        modalEl.querySelectorAll('input[name="clipIds"]')
    ).map(input => input.value);

    // --------------------------
    // Validation: 하나라도 실패하면 바로 return false
    // --------------------------
    if (!title) {
        alert("제목을 입력해주세요.");
        return false;
    }

    // --------------------------
    // 유효성 통과 시에만 DTO 반환
    // --------------------------
    return {
        title,
        content,
        clipIds
    };
}

async function createPost(modalEl) {
    const payload = buildDtoAndValid(modalEl);
    if (!payload) return false; // 검증 실패 시 API 호출 X

    const res = await postWithCsrf(`/api/boards/${currentBoardId}/notes`, payload);

    if (!res.ok) {
        console.error("등록 실패", res);
        alert("등록에 실패했습니다.");
        return false;
    }

    return true;
}

async function updatePost(modalEl) {
    const id = modalEl.dataset.editId;
    if (!id) return false;

    const payload = buildDtoAndValid(modalEl);
    if (!payload) return false; // 검증 실패 시 API 호출 X

    const res = await putWithCsrf(`/api/boards/${currentBoardId}/notes/${id}`, payload);

    if (!res.ok) {
        console.error("수정 실패", res);
        alert("수정에 실패했습니다.");
        return false;
    }

    return true;
}

function setupDeleteButton(tableId, container) {
    container.addEventListener("click", async (e) => {
        const deleteBtn = e.target.closest(".btn-delete");
        if (!deleteBtn) return;   // 삭제 버튼이 아닐 때는 무시

        const id = deleteBtn.dataset.id;
        if (!id) return;

        if (!confirm("해당 게시글을 삭제하시겠습니까?")) return;

        try {
            const res = await deleteWithCsrf(`/api/boards/${currentBoardId}/notes/${id}`);

            if (!res.ok) {
                console.error("삭제 실패", res);
                alert("삭제에 실패했습니다.");
                return;
            }
            await reloadNoteTable(tableId, currentBoardId);

        } catch (err) {
            console.error("삭제 중 오류", err);
            alert("삭제 중 오류가 발생했습니다.");
        }
    });

}

/* =========================
 * DataTable 로드
 * ========================= */
function reloadNoteTable(tableId = "dataTable", boardId, { resetToFirstPage = false } = {}) {
    const ajaxUrl = `/api/boards/${boardId}/notes`;
    const columnsFn = getNoteTableColumns();

    if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
        const dt = $(`#${tableId}`).DataTable();
        dt.ajax.url(ajaxUrl);
        dt.ajax.reload(null, resetToFirstPage);
        return;
    }

    //const searchKeyword = $id("search-target-text")?.value?.trim() ?? "";
    //const searchTarget = $id("search-target")?.value;

    loadDataTable({
        tableId,
        ajaxUrl,
        columns: columnsFn,
        enableOrdering: true,
        defaultOrderIndex: 1,
        minTableWidth: 1100, // 스크롤 기준 너비 전달
        getExtraDataFn: () => {
// 함수가 실행되는 시점(서버 요청 직전)에 값을 새로 읽어옴
            const currentKeyword = $id("search-target-text")?.value?.trim() ?? "";
            const currentTarget = $id("search-target")?.value;

            return currentKeyword ? { [currentTarget]: currentKeyword } : {};
        },
        titleColumnName: "제목",
        mobileBreakpoint: 640,
        enableResponsive : false,
        extraOptions: {
            dom: 'rtip'
        }
    });

    function getNoteTableColumns() {
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
                }
            },
            {
                data: 'createdAt',
                title: '일시',
                orderable: true,
                width: '10%',
                className: 'data-txt',
                render: formatDateCol
            },
            {
                data: 'title',
                title: '제목',
                orderable: false,
                className: 'data-tit text-start',
                render: (data, type, row) => {
                    return `
                        <a href="#" data-id="${row.id}" class="link-tite view-board">
                            <strong>${row.title}</strong>
                        </a>
                    `;
                }
            },
            {   data: "clipInfoList",
                title: '파일',
                orderable: false,
                width: '12%',
                className: 'data-txt',
                render: renderClipInfoList
            },
            {   data: 'userName',
                title: '작성자',
                orderable: false,
                width: '10%',
                className: 'data-txt',
                render: (data) => data ?? "-"
            },
            {
                data: null,
                title: "작업",
                className: "bt-box",
                orderable: false,
                width: "10%",
                render: (data, type, row) => {
                    if (row.editable) {
                        return `
                            <button 
                                type="button" 
                                class="btn btn-outline-secondary btn-edit"
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
                    } else {
                        return "-";
                    }
                }
            }
        ];
    }
}


export function initNoteClipFileUpload({
                                       modalId,
                                       allowedExtensions = [], // [] 제한 없음
                                       uploadUrl = "/api/clip/upload",
                                       loadingId = "uploadLoading",    // 로딩

                                   } = {}) {
    const fileInput = document.getElementById("file-input");
    const fileListContainer = document.getElementById('file-upload-list');

    const modalEl = document.getElementById(modalId);
    const loadingEl = document.getElementById(loadingId);

    /* ---------------- Loading ---------------- */
    const showLoading = () => loadingEl?.classList.remove("d-none");
    const hideLoading = () => loadingEl?.classList.add("d-none");

    /* ---------------- 초기화 ---------------- */
    const resetFileFields = () => {
        if (fileInput) {
            fileInput.value = "";
        }
    };

    /* ---------------- 업로드 + 미리보기 ---------------- */
    const uploadClip = async (file) => {
        if (!file) return false;

        // 확장자 검사(allowedExtensions 있을 때만)
        if (allowedExtensions.length > 0) {
            const fileName = file.name.toLowerCase();
            const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));

            if (!isValid) {
                alert(`허용된 파일 형식이 아닙니다. (${allowedExtensions.join(", ")})`);
                return false;
            }
        }

        try {
            const formData = new FormData();
            formData.append("upload", file);

            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: { ...getCsrfHeaders() },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "파일 업로드 실패");
            }

            const clipDto = result.data || [];

            // dataset 저장
            const cardEl = createFileCardElement(clipDto);
            fileListContainer.appendChild(cardEl);
            return true;

        } catch (err) {
            console.error(err);
            alert("업로드 중 오류가 발생했습니다.");
            return false;
        }
    };

    const uploadClips = async (files) => {
        const selectedFiles = Array.from(files ?? []).filter(Boolean);
        if (selectedFiles.length === 0) return;

        showLoading();

        try {
            for (const file of selectedFiles) {
                await uploadClip(file);
            }
        } finally {
            hideLoading();
            resetFileFields();
        }
    };

    /* ---------------- File change ---------------- */
    if (fileInput) {
        fileInput.addEventListener("change", (e) => {
            const files = Array.from(e.target.files ?? []);
            if (!files || files.length === 0) {
                resetFileFields();
                return;
            }

            e.target.value = '';
            void uploadClips(files);
        });
    }

    /* ---------------- Modal Close Reset ---------------- */
    if (modalEl) {
        modalEl.addEventListener("hidden.bs.modal", () => {
            resetFileFields();
            fileListContainer.innerHTML = "";
        });
    }

    resetFileFields();
}

/**
 * 업로드된 파일 하나에 대한 카드 DOM 생성
 * clip: { id, originalUrl, thumbUrl, title, ... }
 */
function createFileCardElement(clip, type = "editor") {
    const col = document.createElement('div');
    col.className = 'col-12';
    col.dataset.clipId = clip.id;

    const fileName = stripFileName(clip.title || clip.name || "FILE");
    const safeFileName = escapeHtml(fileName);
    const ext = (fileName.split('.').pop() || '').toUpperCase();
    const fileSize = formatFileSize(clip.size);

    const imageUrl = clip.url;
    const isImage = checkIsImage(clip);

    let thumbnailHtml = '';

    if (isImage) {
        thumbnailHtml = `
            <img src="${imageUrl}" class="avatar-sm rounded" alt="file-image">
        `;
    } else {
        thumbnailHtml = `
            <div class="avatar-sm">
                <span class="avatar-title rounded">
                    ${ext || 'FILE'}
                </span>
            </div>
        `;
    }

    let button;
    if (type==="editor") {
        // 삭제 버튼
        button = `
            <a href="javascript:void(0);" class="btn btn-link btn-lg text-muted btn-remove-file">
                <i class="ri-close-circle-line"></i>
            </a>
        `;
    } else {
        // 다운로드 요청 URL 생성
        const downloadUrl = `/api/files/download?key=${encodeURIComponent(clip.fileKey)}&filename=${encodeURIComponent(fileName)}`;

        button = `
            <a href="javascript:void(0);" 
               data-url="${downloadUrl}"
               class="btn btn-link btn-lg text-muted btn-download">
                <i class="ri-download-2-line"></i>
            </a>
        `;
    }

    // 최종 카드 HTML
    col.innerHTML = `
        <div class="card mb-1 shadow-none border">
            <div class="p-2">
                <div class="row align-items-center">
                    <div class="col-auto">
                        ${thumbnailHtml}
                    </div>

                    <div class="col ps-0">
                        <span class="d-block text-muted fw-bold ps-2 text-break">${safeFileName}</span>
                        <p class="mb-0 ps-2">${fileSize}</p>
                    </div>

                    <div class="col-auto">
                        ${button}
                    </div>
                </div>
            </div>
            <input type="hidden" name="clipIds" value="${clip.id}">
        </div>
    `;

    // 삭제 버튼 이벤트
    const removeBtn = col.querySelector('.btn-remove-file');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => col.remove());
    }

    return col;
}

function renderCommentInfoList(commentList, listContainer, emptyContainer) {
    listContainer.innerHTML = "";

    if (!commentList || commentList.length === 0) {
        emptyContainer.classList.remove("d-none");
        return;
    }

    emptyContainer.classList.add("d-none");
    commentList.forEach(comment => {
        listContainer.appendChild(createCommentElement(comment));
    });
}

function createCommentElement(comment) {
    const commentEl = document.createElement("div");
    commentEl.className = "d-flex align-items-start comment-box py-2 border-bottom";
    commentEl.dataset.id = comment.id ?? "";

    const writer = escapeHtml(comment.userName || comment.writer || "-");
    const content = escapeHtml(comment.content || "");
    const createdAt = escapeHtml(formatDateTime(comment.createdAt));
    const actionHtml = comment.editable ? `
        <div class="mt-1">
            <button type="button" class="btn btn-link btn-sm p-0 me-2 btn-comment-edit">수정</button>
            <button type="button" class="btn btn-link btn-sm p-0 text-danger btn-comment-delete">삭제</button>
        </div>
    ` : "";

    commentEl.innerHTML = `
        <div class="w-100 fs-13">
            <h5 class="mt-0 fs-14">
                <span>${writer}</span>
                <small class="text-muted float-end">${createdAt}</small>
            </h5>
            <div class="comment-content text-break">${content}</div>
            <div class="comment-edit-area d-none">
                <textarea class="form-control form-control-sm comment-edit-content" rows="3">${content}</textarea>
                <div class="text-end mt-1">
                    <button type="button" class="btn btn-light btn-sm btn-comment-cancel">취소</button>
                    <button type="button" class="btn btn-primary btn-sm btn-comment-update">저장</button>
                </div>
            </div>
            ${actionHtml}
        </div>
    `;

    return commentEl;
}

function setupCommentButtons(modalEl) {
    if (!modalEl || modalEl.dataset.commentBound === "1") return;
    modalEl.dataset.commentBound = "1";

    const saveBtn = modalEl.querySelector("#btn-comment-save");
    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            const noteId = modalEl.dataset.noteId;
            const contentEl = modalEl.querySelector("#comment-content");
            const content = contentEl?.value?.trim() ?? "";

            if (!noteId) return;
            if (!content) {
                alert("댓글 내용을 입력해주세요.");
                return;
            }

            const res = await postWithCsrf(`/api/boards/${currentBoardId}/notes/${noteId}/comments`, { content });
            if (!res.ok) {
                alert("댓글 등록에 실패했습니다.");
                return;
            }

            contentEl.value = "";
            await openViewModal(modalEl, noteId);
        });
    }

    modalEl.addEventListener("click", async (e) => {
        const commentEl = e.target.closest(".comment-box");
        if (!commentEl) return;

        if (e.target.closest(".btn-comment-edit")) {
            commentEl.querySelector(".comment-content")?.classList.add("d-none");
            commentEl.querySelector(".comment-edit-area")?.classList.remove("d-none");
            return;
        }

        if (e.target.closest(".btn-comment-cancel")) {
            commentEl.querySelector(".comment-content")?.classList.remove("d-none");
            commentEl.querySelector(".comment-edit-area")?.classList.add("d-none");
            return;
        }

        if (e.target.closest(".btn-comment-update")) {
            const noteId = modalEl.dataset.noteId;
            const commentId = commentEl.dataset.id;
            const content = commentEl.querySelector(".comment-edit-content")?.value?.trim() ?? "";

            if (!noteId || !commentId) return;
            if (!content) {
                alert("댓글 내용을 입력해주세요.");
                return;
            }

            const res = await putWithCsrf(`/api/boards/${currentBoardId}/notes/${noteId}/comments/${commentId}`, { content });
            if (!res.ok) {
                alert("댓글 수정에 실패했습니다.");
                return;
            }

            await openViewModal(modalEl, noteId);
            return;
        }

        if (e.target.closest(".btn-comment-delete")) {
            const noteId = modalEl.dataset.noteId;
            const commentId = commentEl.dataset.id;

            if (!noteId || !commentId) return;
            if (!confirm("해당 댓글을 삭제하시겠습니까?")) return;

            const res = await deleteWithCsrf(`/api/boards/${currentBoardId}/notes/${noteId}/comments/${commentId}`);
            if (!res.ok) {
                alert("댓글 삭제에 실패했습니다.");
                return;
            }

            await openViewModal(modalEl, noteId);
        }
    });
}

function formatDateTime(value) {
    if (!value) return "";
    return String(value).replace("T", " ").slice(0, 16);
}

function checkIsImage(clip) {
    const name = clip.title || clip.name || '';
    const url = clip.originalUrl || clip.thumbUrl || clip.mediumUrl || clip.smallUrl || '';
    const target = (name || url).toLowerCase();
    return /\.(jpe?g|png|gif|webp|bmp)$/i.test(target);
}

function formatFileSize(size) {
    const numericSize = Number(size);
    if (!Number.isFinite(numericSize)) return '';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    let value = numericSize;

    while (value >= 1024 && i < units.length - 1) {
        value /= 1024;
        i++;
    }
    return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function stripFileName(value) {
    const rawValue = String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim();
    if (!rawValue) {
        return "FILE";
    }

    const baseName = rawValue.replace(/\\/g, "/").split("/").pop() || rawValue;
    const normalized = baseName.replace(/\s+/g, " ").trim();

    return normalized || "FILE";
}

function escapeHtml(str = "") {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function renderClipInfoList(clipList) {
    if (!clipList || clipList.length === 0) {
        return "-";
    }
    const getExt = (name) => (name.split('.').pop() || '').toLowerCase();

    const getIconByExt = (ext) => {
        if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext)) {
            return "ic-file-img";
        }
        if (["ppt", "pptx"].includes(ext)) {
            return "ic-file-ppt";
        }
        if (["doc", "docx"].includes(ext)) {
            return "ic-file-doc";
        }
        if (ext === "pdf") {
            return "ic-file-pdf";
        }
        if (["xls", "xlsx", "csv"].includes(ext)) {
            return "ic-file-xls";
        }
        if (ext === "hwp") {
            return "ic-file-hwp";
        }
        return "ic-file-basic";
    };

    let html = "";
    clipList.forEach((clip) => {
        const fileName = stripFileName(clip.title || clip.name || "FILE");
        const fileKey = clip.fileKey;
        const ext = getExt(fileName);

        const downloadUrl = `/api/files/download?key=${encodeURIComponent(fileKey)}&filename=${encodeURIComponent(fileName)}`;

        const iconClass = getIconByExt(ext);

        html += `
            <span class="clearfix d-inline-block me-1">
                <i class="${iconClass} btn-download"
                   data-url="${downloadUrl}"
                   data-bs-toggle="tooltip"
                   data-bs-placement="top"
                   title="${escapeHtml(fileName)}"
                   style="cursor:pointer">
                    <span class="path1"></span>
                    <span class="path2"></span>
                    <span class="path3"></span>
                    <span class="path4"></span>
                    <span class="path5"></span>
                    <span class="path6"></span>
                </i>
            </span>
        `;
    });

    return `<span class="d-flex align-items-center justify-content-center file-icons">${html}</span>`;
}
