import { initCoverFileUpload } from "./management-utils.js";

let currentRootId = null;

// 모달 상태 관련 전역
const MODAL_MODE = {
    CREATE_ROOT: "CREATE_ROOT",
    CREATE_CHILD: "CREATE_CHILD", // 상위분류 아래 새 분류 추가
    EDIT: "EDIT",                 // 기존 분류 수정
};

let modalMode = MODAL_MODE.CREATE_CHILD;
let modalCategoryId = null;        // EDIT 모드일 때 수정 대상 카테고리 id
let modalParentCategoryId = null;  // CREATE_CHILD 모드일 때 상위 분류 id

let dragulaInstance = null;
let isReorderMode = false;
const MOBILE_BREAKPOINT = 768;

let selectedDetailCategoryId = null;
let selectedDetailCategoryName = "";
let hasDetail = false;

document.addEventListener("DOMContentLoaded", async () => {
    if (applyMobileUnsupportedGate()) {
        return;
    }

    //const rootId = localStorage.getItem("activeRootId");

    // 1회용 값이므로 제거
    //localStorage.removeItem("activeRootId");

    // currentRootId = getActiveRootId();
    // if (!currentRootId) {
    //     console.warn("No active root tab found.");
    //     return;
    // }

    await reloadCategoryTable();


    // 이미지 등록1
    initCoverFileUpload({
        modalId: ""
    });
    // 이미지 등록2
    initCoverFileUpload({
        modalId: "",
        fileInputId: "formFile1",
        fileNameDisplayId: "fileNameDisplay1",
        deleteFileBtnId: "deleteFileBtn1",
        previewImageId: "previewImage1",
        loadingId: "uploadLoading1",
        datasetKey: "coverId1"
    });

    bindTableActionButtons();
    bindCreateRootButton();
    bindModalSaveButton();

    bindReorderButtons();
    bindDetailButtons();
});

function isMobileViewport() {
    // app.js LayoutAdjuster._adjustLayout()의 모바일 기준(<= 768px)과 동일하게 맞춤
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

function applyMobileUnsupportedGate() {
    const content = document.getElementById("manage-own-categories-content");
    const notice = document.getElementById("manage-own-categories-mobile-notice");
    if (!content || !notice) return false;

    const isMobile = isMobileViewport();
    content.classList.toggle("d-none", isMobile);
    notice.classList.toggle("d-none", !isMobile);
    return isMobile;
}

/**
 * 현재 활성화된 탭의 rootId 가져오기
 */
function getActiveRootId() {
    const activeTab = document.querySelector("#categoryTopTabs .nav-link.active");
    if (!activeTab) return null;
    return activeTab.dataset.rootId;
}

/**
 * depth 에 따른 tr 클래스 지정
 */
function depthToRowClass(depth) {
    if (depth === null || depth === 1) return "first-depth";
    if (depth === 2) return "second-depth";
    if (depth === 3) return "third-depth";
    if (depth === 4) return "fourth-depth";
    return "";
}

/**
 * 카테고리 트리 API 호출 후 테이블 렌더링
 */
async function reloadCategoryTable() {
    const ajaxUrl = `/api/categories/tree`;

    try {
        const res = await fetch(ajaxUrl, {
            headers: { Accept: "application/json" },
        });

        if (!res.ok) {
            console.error("카테고리 트리 API 실패:", res.status, await res.text());
            return;
        }

        const json = await res.json();

        const rows = Array.isArray(json) ? json : json.data ?? [];
        if (!Array.isArray(rows)) {
            return;
        }

        renderCategoryTable(rows);
    } catch (e) {
        console.error("카테고리 트리 로드 중 오류:", e);
    }
}

/**
 * 카테고리 테이블 렌더링
 */
function renderCategoryTable(rows) {
    const tbody = document.querySelector("#categoryTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    rows.forEach((row) => {
        const tr = document.createElement("tr");

        const depthClass = depthToRowClass(row.depth);
        if (depthClass) tr.classList.add(depthClass);

        tr.dataset.categoryId = row.id;
        tr.dataset.categoryName = row.name ?? "";
        tr.dataset.depth = row.depth == null ? "" : String(row.depth);
        if (row.parentId != null) {
            tr.dataset.parentId = String(row.parentId);
        } else {
            tr.dataset.parentId = ""; // 최상위는 빈 문자열
        }

        // # (id)
        const tdId = document.createElement("td");
        tdId.className = "badge-box text-center";
        tdId.style.width = "10%";
        tdId.textContent = row.id ?? "-";

        // 분류명
        const tdName = document.createElement("td");
        tdName.className = row.depth ? "data-txt text-start depth-shape" : "data-txt text-start";
        tdName.textContent = row.name ?? "-";

        // 사용여부
        const tdActive = document.createElement("td");
        tdActive.className = "data-txt";
        tdActive.style.width = "20%";
        const isActivated = row.activated === 1 || row.activated === true;
        tdActive.textContent = isActivated ? "사용" : "미사용";

        // 작업
        // const tdActions = document.createElement("td");
        // tdActions.className = "bt-box";
        // tdActions.style.width = "25%";

        // 버튼에 필요한 데이터는 dataset 으로 싹 넣어둔다
        // const addChildBtn = `
        //     <button type="button"
        //             class="btn btn-outline-secondary btn-add-child"
        //             data-bs-toggle="modal"
        //             data-bs-target="#category-modal"
        //             data-parent-category-id="${row.id}"
        //             data-parent-category-name="${row.name ?? ""}">
        //       하위분류추가
        //     </button>
        // `;
        // const editBtn = `
        //     <button type="button"
        //             class="btn btn-outline-secondary btn-edit"
        //             data-bs-toggle="modal"
        //             data-bs-target="#category-modal"
        //             data-category-id="${row.id}"
        //             data-category-name="${row.name ?? ""}"
        //             data-parent-category-name="${row.parentName ?? ""}"
        //             data-activated="${isActivated ? "1" : "0"}">
        //       수정
        //     </button>
        // `;

        // if (row.depth===3) {
        //     // depth가 3인 카테고리는 하위항목을 만들지 못하도록 제한
        //     tdActions.innerHTML = `${editBtn}`;
        // } else {
        //     tdActions.innerHTML = `${addChildBtn}${editBtn}`;
        // }

        tr.appendChild(tdId);
        tr.appendChild(tdName);
        tr.appendChild(tdActive);
        //tr.appendChild(tdActions);

        tbody.appendChild(tr);
    });
}


/**
 * 상단 "분류추가" 버튼 클릭 시 모달 오픈 (현재 탭의 rootId 아래에 새 분류 추가)
 */
function bindCreateRootButton() {
    const createBtn = document.getElementById("CreateBtn");
    if (!createBtn) return;

    createBtn.addEventListener("click", () => {
        const activeTab = document.querySelector("#categoryTopTabs .nav-link.active");
        const parentId = activeTab?.dataset.rootId ?? null;
        const parentName =
            activeTab?.querySelector("span")?.textContent?.trim() ??
            activeTab?.textContent?.trim() ??
            "";

        openCategoryModal({
            mode: MODAL_MODE.CREATE_ROOT,
            categoryId: null,
            parentId: parentId ? Number(parentId) : null,
            parentName,
            name: "",
            activated: true,
        });
    });
}

/**
 * 테이블 내 "하위분류추가" / "수정" 버튼 이벤트 위임
 */
function bindTableActionButtons() {
    const tbody = document.querySelector("#categoryTableBody");
    if (!tbody) return;

    tbody.addEventListener("click", async (e) => {
        // 하위분류추가 버튼
        const addChildBtn = e.target.closest(".btn-add-child");
        if (addChildBtn) {
            const parentId = addChildBtn.dataset.parentCategoryId;
            const parentName = addChildBtn.dataset.parentCategoryName ?? "";

            openCategoryModal({
                mode: MODAL_MODE.CREATE_CHILD,
                categoryId: null,
                parentId: parentId ? Number(parentId) : null,
                parentName,
                name: "",
                activated: true,
            });
            return;
        }

        // 수정 버튼
        const editBtn = e.target.closest(".btn-edit");
        if (editBtn) {
            const categoryId = editBtn.dataset.categoryId;
            const name = editBtn.dataset.categoryName ?? "";
            const parentName = editBtn.dataset.parentCategoryName ?? "";
            const activated = editBtn.dataset.activated === "1";

            openCategoryModal({
                mode: MODAL_MODE.EDIT,
                categoryId: categoryId ? Number(categoryId) : null,
                parentId: null, // 수정에서는 부모 안 바꾸는 것으로 가정
                parentName,
                name,
                activated,
            });
            return;
        }

        const row = e.target.closest("tr[data-category-id]");
        if (!row || isReorderMode) {
            return;
        }
        if (row.dataset.depth === "2") {
            await selectDetailCategory(row);
        }
    });
}

async function selectDetailCategory(row) {
    selectedDetailCategoryId = Number(row.dataset.categoryId);
    selectedDetailCategoryName = row.dataset.categoryName ?? "";
    hasDetail = false;

    document.querySelectorAll("#categoryTableBody tr.table-active")
        .forEach((el) => el.classList.remove("table-active"));
    row.classList.add("table-active");

    setDetailPanelEnabled(true);
    resetDetailForm();
    await reloadCategoryDetails();
}

function setDetailPanelEnabled(enabled) {
    const title = document.getElementById("detailPanelTitle");
    const hint = document.getElementById("detailPanelHint");
    const empty = document.getElementById("categoryDetailEmpty");
    const editor = document.getElementById("categoryDetailEditor");

    if (title) {
        title.textContent = enabled ? selectedDetailCategoryName : "상세설명";
    }
    if (hint) {
        hint.textContent = enabled ? "상세설명 항목을 등록하거나 수정할 수 있습니다." : "좌측 2depth 카테고리를 선택해 주세요.";
    }
    empty?.classList.toggle("d-none", enabled);
    editor?.classList.toggle("d-none", !enabled);
}

function bindDetailButtons() {
    const saveBtn = document.getElementById("SaveDetailBtn");
    const cancelBtn = document.getElementById("CancelDetailEditBtn");

    saveBtn?.addEventListener("click", saveCategoryDetail);
    cancelBtn?.addEventListener("click", async () => {
        if (selectedDetailCategoryId) {
            await reloadCategoryDetails();
            return;
        }
        resetDetailForm();
    });

}

function resetDetailForm() {
    const priceInput = document.getElementById("detailPrice");
    const descriptionInput = document.getElementById("detailDescription");
    const usageInfoInput = document.getElementById("detailUsageInfo");

    if (priceInput) priceInput.value = "";
    if (descriptionInput) descriptionInput.value = "";
    if (usageInfoInput) usageInfoInput.value = "";

    resetDetailImageField({
        fileInputId: "formFile",
        fileNameDisplayId: "fileNameDisplay",
        deleteFileBtnId: "deleteFileBtn",
        previewImageId: "previewImage",
        loadingId: "uploadLoading",
        datasetKey: "coverId",
    });
    resetDetailImageField({
        fileInputId: "formFile1",
        fileNameDisplayId: "fileNameDisplay1",
        deleteFileBtnId: "deleteFileBtn1",
        previewImageId: "previewImage1",
        loadingId: "uploadLoading1",
        datasetKey: "coverId1",
    });

    document.getElementById("CancelDetailEditBtn")?.classList.add("d-none");
    document.getElementById("DeleteDetailBtn")?.classList.add("d-none");
    const saveBtn = document.getElementById("SaveDetailBtn");
    if (saveBtn) {
        saveBtn.innerHTML = `<i class="ri-check-line me-1"></i>저장`;
    }
}

function resetDetailImageField({
    fileInputId,
    fileNameDisplayId,
    deleteFileBtnId,
    previewImageId,
    loadingId,
    datasetKey,
}) {
    const fileInput = document.getElementById(fileInputId);
    const fileNameDisplay = document.getElementById(fileNameDisplayId);
    const deleteBtn = document.getElementById(deleteFileBtnId);
    const previewImg = document.getElementById(previewImageId);
    const loadingEl = document.getElementById(loadingId);

    if (fileInput) {
        fileInput.value = "";
        if (datasetKey) {
            fileInput.dataset[datasetKey] = "";
        }
        fileInput.dataset.coverHashkey = "";
    }
    if (fileNameDisplay) {
        fileNameDisplay.textContent = "";
        fileNameDisplay.classList.add("d-none");
    }
    if (deleteBtn) {
        deleteBtn.style.display = "none";
    }
    if (previewImg) {
        previewImg.src = "";
        previewImg.classList.add("d-none");
    }
    if (loadingEl) {
        loadingEl.classList.add("d-none");
    }
}

async function saveCategoryDetail() {
    if (!selectedDetailCategoryId) {
        alert("2depth 카테고리를 선택해 주세요.");
        return;
    }

    const priceValue = document.getElementById("detailPrice")?.value ?? "";
    const description = document.getElementById("detailDescription")?.value.trim() ?? "";
    const usageInfo = document.getElementById("detailUsageInfo")?.value.trim() ?? "";

    const fileInput = document.getElementById("formFile");
    const fileInput1 = document.getElementById("formFile1");
    const coverId = fileInput.dataset.coverId;
    const coverId1 = fileInput1.dataset.coverId1;

    if (!priceValue && !description && !usageInfo) {
        alert("상세설명 항목을 입력해 주세요.");
        return;
    }

    const payload = {
        categoryId: selectedDetailCategoryId,
        price: priceValue === "" ? null : Number(priceValue),
        description,
        usageInfo,
        coverId,
        coverId1,
        activated: 1,
    };

    await saveCategoryDetailRequest(selectedDetailCategoryId, payload);

    hasDetail = false;
    resetDetailForm();
    await reloadCategoryDetails();
}

async function reloadCategoryDetails() {
    if (!selectedDetailCategoryId) {
        return;
    }

    try {
        const res = await fetch(`/api/categories/${selectedDetailCategoryId}/details`, {
            headers: { Accept: "application/json" },
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`상세설명 조회 실패: ${res.status} ${text}`);
        }

        const json = await res.json();
        const detail = Array.isArray(json) ? json[0] : json.data ?? null;
        setDetailForm(detail);
    } catch (e) {
        console.error(e);
        alert("상세설명을 불러오지 못했습니다.");
    }
}

function setDetailForm(detail) {
    if (!detail) {
        hasDetail = false;
        resetDetailForm();
        return;
    }

    hasDetail = true;
    document.getElementById("detailPrice").value = detail.price ?? "";
    document.getElementById("detailDescription").value = detail.description ?? "";
    document.getElementById("detailUsageInfo").value = detail.usageInfo ?? "";


    // ========== 사진 (미리보기 / 삭제 버튼 / 파일 input) ==========
    const previewImg = document.getElementById("previewImage");
    const fileNameDisplay = document.getElementById("fileNameDisplay");
    const deleteBtn = document.getElementById("deleteFileBtn");
    const fileInput = document.getElementById("formFile");
    const loadingEl = document.getElementById("uploadLoading");

    const previewImg1 = document.getElementById("previewImage1");
    const fileNameDisplay1 = document.getElementById("fileNameDisplay1");
    const deleteBtn1 = document.getElementById("deleteFileBtn1");
    const fileInput1 = document.getElementById("formFile1");
    const loadingEl1 = document.getElementById("uploadLoading1");

    if (detail.coverImageUrl) {
        if (fileInput) fileInput.dataset.coverId = detail.coverId ?? "";
        previewImg.src = detail.coverImageUrl;
        previewImg.classList.remove("d-none");
        fileNameDisplay.textContent = detail.coverImageTitle;
        fileNameDisplay.classList.remove("d-none", "opacity-0");
        if (deleteBtn) deleteBtn.style.display = "";
    } else {
        if (fileInput) fileInput.dataset.coverId = "";
        previewImg.src = "";
        previewImg.classList.add("d-none");
        fileNameDisplay.textContent = "";
        fileNameDisplay.classList.add("d-none");
        if (deleteBtn) deleteBtn.style.display = "none";
    }

    if (detail.coverImageUrl1) {
        if (fileInput1) fileInput1.dataset.coverId1 = detail.coverId1 ?? "";
        previewImg1.src = detail.coverImageUrl1;
        previewImg1.classList.remove("d-none");
        fileNameDisplay1.textContent = detail.coverImageTitle1;
        fileNameDisplay1.classList.remove("d-none", "opacity-0");
        if (deleteBtn1) deleteBtn1.style.display = "";
    } else {
        if (fileInput1) fileInput1.dataset.coverId1 = "";
        previewImg1.src = "";
        previewImg1.classList.add("d-none");
        fileNameDisplay1.textContent = "";
        fileNameDisplay1.classList.add("d-none");
        if (deleteBtn1) deleteBtn1.style.display = "none";
    }

    if (fileInput) {
        fileInput.value = "";
    }
    if (fileInput1) {
        fileInput1.value = "";
    }

    document.getElementById("DeleteDetailBtn")?.classList.remove("d-none");
    document.getElementById("SaveDetailBtn").innerHTML = `<i class="ri-check-line me-1"></i>수정`;
}

/**
 * 모달 열 때 공통 처리
 * - 제목/버튼 텍스트 변경
 * - 입력값 세팅
 */
function openCategoryModal({ mode, categoryId, parentId, parentName, name, activated }) {
    const modalEl = document.getElementById("category-modal");
    if (!modalEl) return;

    modalMode = mode;
    modalCategoryId = categoryId ?? null;
    modalParentCategoryId = parentId ?? null;

    const titleEl = modalEl.querySelector(".modal-title");
    const confirmBtn = modalEl.querySelector("#confirmAddCategory");
    const parentCategoryRow = modalEl.querySelector("#parentCategoryRow");
    const parentInput = modalEl.querySelector("#modalParentCategory");
    const nameInput = modalEl.querySelector("#modalCategoryName");
    const usageSelect = modalEl.querySelector("#modalUsageSelect");

    parentCategoryRow.classList.remove("d-none");

    // 제목 / 버튼 텍스트
    if (mode === MODAL_MODE.EDIT) {
        if (parentName==="") {
            // 최상위 카테고리 수정인 경우
            parentCategoryRow.classList.add("d-none");
            titleEl.innerHTML = `<i class="ri-edit-line me-1"></i> 최상위 분류수정`;
        } else {
            titleEl.innerHTML = `<i class="ri-edit-line me-1"></i> [${parentName}] 분류수정`;
        }
        confirmBtn.innerHTML = `<i class="ri-check-line me-1"></i>수정완료`;
    } else if (mode === MODAL_MODE.CREATE_CHILD) {
        // CREATE_CHILD
        titleEl.innerHTML = `<i class="ri-file-add-line me-1"></i> [${parentName}] 하위분류 추가`;
        confirmBtn.innerHTML = `<i class="ri-check-line me-1"></i>분류추가`;
    } else {
        // CREATE_ROOT
        titleEl.innerHTML = `<i class="ri-file-add-line me-1"></i> 최상위 분류 추가`;
        confirmBtn.innerHTML = `<i class="ri-check-line me-1"></i>분류추가`;
        parentCategoryRow.classList.add("d-none");
    }

    // 상위분류명
    parentInput.value = parentName ?? "";

    // 분류명
    nameInput.value = name ?? "";

    // 사용여부
    usageSelect.value = activated ? "1" : "0";
}

/**
 * 모달 "저장" 버튼 클릭
 * - 모드에 따라 createCategory / updateCategory 호출
 */
function bindModalSaveButton() {
    const confirmBtn = document.getElementById("confirmAddCategory");
    if (!confirmBtn) return;

    confirmBtn.addEventListener("click", async () => {
        const modalEl = document.getElementById("category-modal");
        if (!modalEl) return;

        const nameInput = modalEl.querySelector("#modalCategoryName");
        const usageSelect = modalEl.querySelector("#modalUsageSelect");

        const name = nameInput.value.trim();
        const activated = usageSelect.value;

        if (!name) {
            alert("분류명을 입력해 주세요.");
            nameInput.focus();
            return;
        }

        try {
            if (modalMode === MODAL_MODE.EDIT && modalCategoryId != null) {
                await updateCategory({
                    id: modalCategoryId,
                    name,
                    activated,
                });
            } else if (modalMode === MODAL_MODE.CREATE_CHILD){
                const created = await createCategory({
                    name,
                    parentId: modalParentCategoryId,
                    activated,
                });
            } else {
                const created = await createCategory({
                    name,
                    parentId: null,
                    activated,
                });
                console.log(created);

                activateRootTab(created.id); // 해당 탭 활성화
            }

            await reloadCategoryTable();

            const instance = window.bootstrap?.Modal.getInstance(modalEl);
            instance?.hide();

        } catch (e) {
            console.error("카테고리 저장 중 오류:", e);
            alert("카테고리 저장 중 오류가 발생했습니다.");
        }
    });
}

/**
 * 카테고리 생성 API
 * - 필요에 따라 payload, URL 수정해서 사용
 */
async function createCategory({ name, parentId, activated }) {
    const payload = {
        name,
        parentId,
        activated,
        rootId: currentRootId,
    };

    const res = await postWithCsrf("/api/categories", payload);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`카테고리 생성 실패: ${res.status} ${text}`);
    }

    const result = await res.json();
    const data = result.data;

    // 응답 바디가 필요 없으면 아래는 생략 가능
    try {
        return data;
    } catch {
        return null;
    }
}

/**
 * 카테고리 수정 API
 * - 필요에 따라 payload, URL 수정해서 사용
 */
async function updateCategory({ id, name, activated }) {
    const payload = {
        name,
        activated,
    };

    const res = await putWithCsrf(`/api/categories/${id}`, payload);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`카테고리 수정 실패: ${res.status} ${text}`);
    }

    try {
        return await res.json();
    } catch {
        return null;
    }
}

async function saveCategoryDetailRequest(categoryId, payload) {
    const res = await postWithCsrf(`/api/categories/${categoryId}/details`, payload);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`상세설명 저장 실패: ${res.status} ${text}`);
    }

    try {
        return await res.json();
    } catch {
        return null;
    }
}

async function deleteCategoryDetail(categoryId) {
    const res = await deleteWithCsrf(`/api/categories/${categoryId}/details`);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`상세설명 삭제 실패: ${res.status} ${text}`);
    }

    try {
        return await res.json();
    } catch {
        return null;
    }
}

function activateRootTab(rootId) {
    if (!rootId) return;

    // reload 전에 선택 값을 저장
    localStorage.setItem("activeRootId", rootId);

    location.reload();
}

// depth 구하는 헬퍼함수
function getDepthLevel(row) {
    if (!row) return null;
    if (row.classList.contains("first-depth")) return 0;
    if (row.classList.contains("second-depth")) return 1;
    if (row.classList.contains("third-depth")) return 2;
    if (row.classList.contains("fourth-depth")) return 3;
    return null;
}

// 서브트리(자식들) 모으는 함수
function collectSubtreeRows(startRow) {
    const baseDepth = getDepthLevel(startRow);
    if (baseDepth === null) return [];

    const result = [];
    let cursor = startRow.nextElementSibling;

    while (cursor) {
        const d = getDepthLevel(cursor);

        // depth가 없거나, 자기(depth)보다 작거나 같아지면 다른 블록이므로 종료
        if (d === null || d <= baseDepth) break;

        result.push(cursor);
        cursor = cursor.nextElementSibling;
    }

    return result;
}

function initCategoryDragula() {
    const tbody = document.querySelector("#categoryTableBody");
    if (!tbody) return;

    // 이미 인스턴스가 있으면 먼저 제거
    if (dragulaInstance) {
        dragulaInstance.destroy();
        dragulaInstance = null;
    }

    // drag 시 같이 움직일 자식들/원래 위치 기억
    let draggedSubtree = [];
    let originalParent = null;
    let originalNextSibling = null;

    dragulaInstance = dragula([tbody], {
        // 어떤 행이 "드래그 가능"한지 결정
        moves: (el, source, handle, sibling) => {
            const depth = getDepthLevel(el);
            if (depth === null) return false;

            // first-depth(= depth 0) 는 이동 금지
            if (depth === 0) return false;

            // 그 외(depth 1, 2, 3, ...)만 드래그 허용
            return true;
        },
        accepts: (el, target, source, sibling) => {
            const elDepth = getDepthLevel(el);
            if (elDepth === null) return false;

            // 혹시 모르니 여기서도 한 번 더 방어
            if (elDepth === 0) return false;

            const elParentId = el.dataset.parentId ?? "";

            let neighbor = sibling;

            // sibling 이 없으면, 컨테이너의 마지막 요소 기준으로 판단
            if (!neighbor) {
                neighbor = target.lastElementChild;
                if (!neighbor) {
                    // 행이 하나도 없으면(이론상 거의 없음) 그냥 허용
                    return true;
                }
            }

            const neighborDepth = getDepthLevel(neighbor);
            if (neighborDepth === null) return false;

            const neighborParentId = neighbor.dataset.parentId ?? "";

            // ✅ 같은 depth 이고, 같은 parentId 일 때만 drop 허용
            //    → 다른 부모의 하위로는 절대 못 들어감
            return elDepth === neighborDepth && elParentId === neighborParentId;
        },
    });

    // 드래그 시작 시: el 밑의 자식들을 모아서 DOM에서 잠시 빼둔다
    dragulaInstance.on("drag", (el, source) => {
        const depth = getDepthLevel(el);
        if (depth === null) return;

        // depth2(= second-depth) 이상에서만 서브트리 개념 적용하고 싶으면:
        // if (depth < 1) return;

        const subtree = collectSubtreeRows(el);
        draggedSubtree = subtree;
        originalParent = source;

        if (subtree.length > 0) {
            // 마지막 자식 기준으로 "원래 다음 형제" 기억
            const last = subtree[subtree.length - 1];
            originalNextSibling = last.nextElementSibling;

            // DOM에서 잠시 제거 (드래그 중에는 부모만 보이게)
            subtree.forEach((row) => {
                source.removeChild(row);
            });
        } else {
            originalNextSibling = el.nextElementSibling;
        }
    });

    // 정상 drop 시: el 의 새 위치 바로 뒤에 자식들 다시 붙이기
    dragulaInstance.on("drop", (el, target, source, sibling) => {
        if (!draggedSubtree || draggedSubtree.length === 0) {
            draggedSubtree = [];
            originalParent = null;
            originalNextSibling = null;
            return;
        }

        let insertRef = el.nextElementSibling;
        draggedSubtree.forEach((row) => {
            if (insertRef) {
                target.insertBefore(row, insertRef);
            } else {
                target.appendChild(row);
            }
            insertRef = row.nextElementSibling;
        });

        draggedSubtree = [];
        originalParent = null;
        originalNextSibling = null;
    });

    // 드롭이 취소된 경우(원래 자리로 복귀)
    dragulaInstance.on("cancel", (el, container, source) => {
        if (!draggedSubtree || draggedSubtree.length === 0 || !originalParent) {
            draggedSubtree = [];
            originalParent = null;
            originalNextSibling = null;
            return;
        }

        // 원래 자리로 돌려놓기
        if (originalNextSibling) {
            // 마지막 자식부터 거꾸로 insert 해야 순서 유지
            for (let i = draggedSubtree.length - 1; i >= 0; i--) {
                originalParent.insertBefore(draggedSubtree[i], originalNextSibling);
            }
        } else {
            // 맨 끝에 붙이는 경우
            draggedSubtree.forEach((row) => {
                originalParent.appendChild(row);
            });
        }

        draggedSubtree = [];
        originalParent = null;
        originalNextSibling = null;
    });

    tbody.classList.add("reorder-mode");
}


function bindReorderButtons() {
    const reorderBtn = document.getElementById("ReorderBtn");
    const saveBtn = document.getElementById("SaveOrderBtn");
    const cancelBtn = document.getElementById("CancelOrderBtn");

    if (!reorderBtn || !saveBtn || !cancelBtn) return;

    // 순서변경 클릭 → dragula 활성화 + 저장/취소 버튼 표시
    reorderBtn.addEventListener("click", () => {
        if (isReorderMode) return;

        isReorderMode = true;

        saveBtn.classList.remove("d-none");
        cancelBtn.classList.remove("d-none");
        reorderBtn.classList.add("d-none");

        // 분류추가/하위추가/수정 버튼 잠금
        document.getElementById("CreateBtn").setAttribute("disabled", true);
        document.querySelectorAll(".btn-add-child, .btn-edit")
            .forEach((btn) => btn.setAttribute("disabled", true));
        document.querySelectorAll("#SaveDetailBtn, #CancelDetailEditBtn, #DeleteDetailBtn")
            .forEach((btn) => btn.setAttribute("disabled", true));

        // 순서변경 드래그 활성화
        initCategoryDragula();
    });

    // 순서저장 → 기존 로직 유지
    saveBtn.addEventListener("click", async () => {
        if (!isReorderMode) return;

        try {
            await saveCategoryOrder();
            alert("순서 변경이 완료되었습니다.")

            await exitReorderMode();

        } catch (e) {
            console.error(e);
            alert("순서 저장 중 오류가 발생했습니다.");
        }
    });

    // 순서취소 버튼
    cancelBtn.addEventListener("click", async () => {
        if (!isReorderMode) return;

        await exitReorderMode(); // 상태 초기화 + UI 복원
    });
}

async function exitReorderMode() {
    isReorderMode = false;

    // 버튼 닫기
    const reorderBtn = document.getElementById("ReorderBtn");
    const saveBtn = document.getElementById("SaveOrderBtn");
    const cancelBtn = document.getElementById("CancelOrderBtn");

    saveBtn.classList.add("d-none");
    cancelBtn.classList.add("d-none");
    reorderBtn.classList.remove("d-none");

    // dragula 종료
    if (dragulaInstance) {
        dragulaInstance.destroy();
        dragulaInstance = null;
    }

    const tbody = document.querySelector("#categoryTableBody");
    if (tbody) {
        tbody.classList.remove("reorder-mode");
    }

    // 전체 버튼 재활성화
    document.getElementById("CreateBtn").removeAttribute("disabled");
    document.querySelectorAll(".btn-add-child, .btn-edit")
        .forEach((btn) => btn.removeAttribute("disabled"));
    document.querySelectorAll("#SaveDetailBtn, #CancelDetailEditBtn, #DeleteDetailBtn")
        .forEach((btn) => btn.removeAttribute("disabled"));

    // 원래 순서로 되돌리기 → 서버에서 다시 로드
    await reloadCategoryTable();
}


async function saveCategoryOrder() {
    const tbody = document.querySelector("#categoryTableBody");
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll("tr"));
    const orders = [];

    // 부모별 position 계산용
    const positionsByParent = new Map();

    const rootIdNum = currentRootId ? Number(currentRootId) : null;

    rows.forEach((tr) => {
        const idStr = tr.dataset.categoryId;
        if (!idStr) return;

        const id = Number(idStr);
        if (!Number.isFinite(id)) return;

        // 최상위 rootId 는 순서 저장에서 제외
        if (rootIdNum && id === rootIdNum) {
            return; // skip!
        }

        const parentIdStr = tr.dataset.parentId ?? "";
        const parentKey = parentIdStr === "" ? "ROOT" : parentIdStr;

        const currentPos = positionsByParent.get(parentKey) ?? 0;
        const nextPos = currentPos + 1;
        positionsByParent.set(parentKey, nextPos);

        orders.push({
            id,
            position: nextPos,
        });
    });

    const res = await putWithCsrf("/api/categories/reorder", orders);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`카테고리 순서 저장 실패: ${res.status} ${text}`);
    }

    // 응답 내용이 필요하면 여기서 사용
    try {
        return await res.json();
    } catch {
        return null;
    }
}
