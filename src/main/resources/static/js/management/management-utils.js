/**
 * 관리 관련 페이지에서 중복으로 사용되는 함수 모음
 * */


/**
 * 지역조회
 * 아파트 지역을 조회한다
 */
export function loadDivisionOptions() {
    return fetch('/api/companies')
        .then(response => response.json())
        .then(data => {
            const companySelect = document.getElementById('company');
            const companyList = data.data;

            companyList.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.compName;
                companySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('회사 목록 로딩 실패:', error);
        });
}





/* ================= ✅ 코드 입력 필터링 (영문/숫자/-/_만 허용) ================= */
export function bindCodeInputFilter(tbody) {
    tbody.addEventListener("input", (e) => {
        if (e.target.classList.contains("code-input")) {
            let cleaned = e.target.value.replace(/[^a-zA-Z0-9-_]/g, "");
            cleaned = cleaned.toUpperCase(); // 대문자 자동변환
            if (e.target.value !== cleaned) {
                e.target.value = cleaned;
            }
        }
    });
}

/* ================= ✅ 조직도 트리 로드 관련 함수 ================= */
export async function loadCompanies(tbody) {
    // 로딩 중 표시
    tbody.innerHTML = `
        <tr>
          <td class="text-muted" colspan="1">불러오는 중...</td>
        </tr>
      `;

    try {
        const response = await fetch("/api/companies", {
            method: "GET",
            headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        const companies = result.data ?? [];

        if (companies.length === 0) {
            tbody.innerHTML = `
                <tr>
                  <td class="text-muted" colspan="1">등록된 회사가 없습니다.</td>
                </tr>
              `;
            return;
        }

        // 테이블 내용 초기화
        tbody.innerHTML = "";

        // 회사 목록 렌더링
        companies.forEach((company) => {
            const tr = document.createElement("tr");
            tr.dataset.type = "company";
            tr.dataset.id = company.id ?? "";
            tr.dataset.code = company.compCode ?? "";
            tr.dataset.name = company.compName ?? "";

            const td = document.createElement("td");
            td.classList.add("data-txt");
            td.textContent = company.compName ?? "";

            tr.appendChild(td);
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("회사 목록 불러오기 실패:", error);
        tbody.innerHTML = `
              <tr>
                <td class="text-danger" colspan="1">회사 목록을 불러오지 못했습니다.</td>
              </tr>
        `;
    }
}

// API 연동: 회사 트리
export async function loadCompanyTree(companyId, anchorRow) {
    const tbody = anchorRow.closest("tbody");
    try {
        const res = await fetch(`/api/companies/${companyId}/tree`, {
            method: "GET",
            headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const result = await res.json();
        const treeData = Array.isArray(result.data) ? result.data : [];

        // 데이터 없을 때 안내멘트 표시
        if (treeData.length === 0) {
            clearChildRows(tbody);

            const emptyRow = document.createElement("tr");
            emptyRow.classList.add("child-row");
            emptyRow.innerHTML = `
                <td colspan="1" class="p-0">
                  <div class="child-row-content p-2 text-muted text-center">
                    등록된 부서가 없습니다.
                  </div>
                </td>
              `;
            anchorRow.after(emptyRow);
            return;
        }

        // 데이터 있는 경우 child-row 생성 & 1레벨(devision) 렌더
        insertTreeRowBelow(anchorRow, treeData);
        return treeData;
    } catch (err) {
        console.error("트리 데이터 로드 실패:", err);
        // 실패 시 열린 child-row 제거
        clearChildRows(tbody);
        // 에러 메시지 row
        const errRow = document.createElement("tr");
        errRow.classList.add("child-row");
        errRow.innerHTML = `
              <td colspan="1" class="p-0">
                <div class="child-row-content p-2">
                  <div class="text-danger">데이터를 불러오지 못했습니다.</div>
                </div>
              </td>
        `;
        anchorRow.after(errRow);
        return [];
    }
}

// 기존 child-row 제거
export function clearChildRows(tbody) {
    tbody.querySelectorAll("tr.child-row").forEach((r) => r.remove());
}

// 회사행 아래에 child-row 삽입
export function insertTreeRowBelow(anchorRow, nodes /* array */) {
    // 기존 child-row 있으면 제거
    const tbody = anchorRow.closest("tbody");
    const next = anchorRow.nextElementSibling;
    if (next && next.classList.contains("child-row")) next.remove();

    // 컨테이너 row
    const childRow = document.createElement("tr");
    childRow.classList.add("child-row");
    childRow.dataset.type = "dept";
    childRow.innerHTML = `
    <td colspan="1" class="p-0">
      <div class="child-row-content"></div>
    </td>
  `;

    // 최초 레벨(division) 목록 생성
    const content = childRow.querySelector(".child-row-content");
    const level1Ul = createLevelHtml(nodes, 1);
    content.appendChild(level1Ul);

    // 삽입
    anchorRow.after(childRow);
}

// 가상부서 flat 처리
export function flattenVirtual(nodes = []) {
    /**
     * 모든 레벨에서 virtual 노드를 제거하고 자식들을 같은 레벨로 승격
     * - 일반 노드는 보존하며 children만 재귀 처리
     * - virtual 노드는 자신을 버리고 children만 펼쳐서 반환
     */
    const out = [];
    for (const node of nodes) {
        const children = Array.isArray(node.children) ? flattenVirtual(node.children) : [];

        if (node.virtual === true) {
            // 가상 노드: 자신은 제거, 자식들을 동레벨로 승격
            if (children.length > 0) out.push(...children);
            // 자식이 없으면 아무것도 넣지 않음
        } else {
            // 일반 노드: children만 평탄화된 걸로 교체
            out.push({ ...node, children });
        }
    }
    return out;
}

// 노드 배열 → UL 생성 (레벨별 스타일 유지)
export function createLevelHtml(nodes, level = 1) {
    const flatNodes = flattenVirtual(nodes);

    const ul = document.createElement("ul");
    ul.className = ["level-list", "d-flex", "flex-column", "flex-fill", "p-0", level === 1 ? "root" : ""]
        .filter(Boolean)
        .join(" ");

    flatNodes.forEach((node) => {
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        const isUnit = node?.type === "unit";

        const li = document.createElement("li");
        li.className = [
            "d-flex",
            "flex-row",
            "flex-fill",
            "align-items-start",
            (level === 3 || isUnit) ? "level-team" : "",
        ]
            .filter(Boolean)
            .join(" ");

        // 데이터 속성 설정
        li.dataset.level = String(level);
        li.dataset.id = node.id ?? "";
        li.dataset.type = node.type ?? "";
        li.dataset.code = node.code ?? "";
        li._node = node; // 노드 전체 데이터 바인딩

        const targetWidth = (level === 1 || level === 2) ? "10rem" : "100%";
        const span = document.createElement("span");
        span.className = `dept-item d-flex align-items-center`;
        span.style.width = targetWidth;
        span.style.flexShrink = "0";

        // 토글/플레이스홀더 아이콘
        const icon = document.createElement("i");
        icon.style.marginRight = ".5rem";
        if (hasChildren) {
            icon.className = "icon-toggle ri-add-box-line";
        } else {
            icon.className = "icon-placeholder";
        }
        span.appendChild(icon);

        // 이름
        const name = document.createElement("span");
        name.className = "dept-name";
        name.textContent = node.name ?? "";
        span.appendChild(name);

        li.appendChild(span);

        // leaf 표시용
        if (!hasChildren && level < 3) {
            span.classList.add("no-child");
        }

        ul.appendChild(li);
    });

    return ul;
}

/* ================= ✅ 커버 이미지 업로드 + 미리보기 초기화 함수 ================= */
// CSRF Token
export const getCsrfHeaders = () => {
    const token = document.querySelector('meta[name="_csrf"]')?.content;
    const headerName = document.querySelector('meta[name="_csrf_header"]')?.content;
    return token && headerName ? { [headerName]: token } : {};
};

export function initCoverFileUpload({
                                        modalId,
                                        fileInputId = "formFile",
                                        fileNameDisplayId = "fileNameDisplay",
                                        deleteFileBtnId = "deleteFileBtn",
                                        previewImageId = "previewImage",
                                        uploadUrl = "/api/cover/upload",
                                        loadingId = "uploadLoading",
                                        datasetKey = "coverId",
                                    } = {}) {
    const fileInput = document.getElementById(fileInputId);
    const fileNameDisplay = document.getElementById(fileNameDisplayId);
    const deleteFileBtn = document.getElementById(deleteFileBtnId);
    const previewImage = document.getElementById(previewImageId);
    const modalEl = document.getElementById(modalId);
    const loadingEl = document.getElementById(loadingId);

    const showLoading = () => {
        if (loadingEl) loadingEl.classList.remove("d-none");
    };

    const hideLoading = () => {
        if (loadingEl) loadingEl.classList.add("d-none");
    };

    // 초기화 함수
    const resetFileFields = () => {
        if (fileInput) {
            fileInput.value = "";
            fileInput.dataset[datasetKey] = "";
            fileInput.dataset.coverHashkey = "";
        }

        if (fileNameDisplay) {
            fileNameDisplay.textContent = "";
            // fileNameDisplay.classList.add("opacity-0");
        }

        if (previewImage) {
            previewImage.src = "";
            previewImage.classList.add("d-none");
        }

        if (deleteFileBtn) {
            deleteFileBtn.style.display = "none";
        }
    };

    // 파일 업로드 & 미리보기
    const uploadAndPreview = async (file) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 업로드할 수 있습니다.");
            resetFileFields();
            return;
        }

        if (fileNameDisplay) {
            fileNameDisplay.textContent = file.name;
            // fileNameDisplay.classList.add("opacity-0");
        }

        const formData = new FormData();
        formData.append("upload", file);

        resetFileFields();

        // 업로드 중 표시
        showLoading();

        try {
            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    ...getCsrfHeaders()
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(`${result.message}`);
            }

            const coverDto = result.data || result;
            if (!coverDto.url) {
                throw new Error("응답에 이미지 URL이 없습니다.");
            }

            // 이미지 미리보기
            previewImage.src = coverDto.url;
            previewImage.classList.remove("d-none");

            // 삭제 버튼 보이기
            deleteFileBtn.style.display = "block";
            // 🚀 fileInput.dataset 로 정보 저장
            fileInput.dataset[datasetKey] = coverDto.id ?? "";
        } catch (err) {
            console.error(err);
            alert(err);
            resetFileFields();
        } finally {
            // 업로드 끝
            hideLoading();
        }
    };

    // 파일 선택 이벤트
    if (fileInput) {
        fileInput.addEventListener("change", (e) => {
            const file = e.target.files?.[0];
            if (!file) {
                resetFileFields();
                return;
            }
            void uploadAndPreview(file);
        });
    }

    // 삭제 버튼
    if (deleteFileBtn) {
        deleteFileBtn.addEventListener("click", () => {
            resetFileFields();
        });
    }

    // 모달 닫힐 때 초기화
    if (modalEl) {
        modalEl.addEventListener("hidden.bs.modal", resetFileFields);
    }

    // 최초 초기화
    resetFileFields();
}

/* ================= ✅ 생성, 수정 모달 열기 동작 관련 유틸 함수  ================= */
// 생성 버튼 클릭
export function setupCreateButton(modalEl, bsModal, openCreateModal, createBtnId="btn-create") {
    const createBtn = document.getElementById(createBtnId);
    if (!createBtn) return;

    createBtn.addEventListener("click", () => {
        if (typeof openCreateModal === "function") {
            openCreateModal(modalEl);
        }
        bsModal.show();
    });
}

// 수정버튼 클릭
export function setupEditButtons(container, modalEl, bsModal, openEditModal, editBtnClass = "btn-edit") {
    container.addEventListener("click", async (e) => {
        const editBtn = e.target.closest(`.${editBtnClass}`);
        if (!editBtn) return;

        const id = editBtn.dataset.id;
        if (!id) return;

        if (typeof openEditModal === "function") {
            const shouldOpen = await openEditModal(modalEl, id);
            if (shouldOpen === false) return;
        }
        bsModal.show();
    });
}

// 등록, 수정 버튼 클릭
export function setupSubmitButton(modalEl, bsModal, onCreate, onUpdate, onAfterSubmit) {
    const saveBtn = modalEl.querySelector(".btn-save");
    if (!saveBtn) return;

    saveBtn.addEventListener("click", async () => {
        const mode = modalEl.dataset.mode ?? "create";

        const ok = mode === "edit"
            ? await onUpdate(modalEl)   // edit → updateFn
            : await onCreate(modalEl);  // create → createFn

        if (!ok) return;

        bsModal.hide();

        if (onAfterSubmit) {
            await onAfterSubmit(modalEl, mode);
        }
    });
}

const IMAGE_PREVIEW_MODAL_ID = "image-preview-modal";
const IMAGE_PREVIEW_TITLE_ID = "imagePreviewModalTitle";
const IMAGE_PREVIEW_IMAGE_ID = "photoPreviewImage";
const imagePreviewBindingMap = new WeakMap();

function ensureImagePreviewModal({
    modalId = IMAGE_PREVIEW_MODAL_ID,
} = {}) {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) {
        console.warn(`#${modalId} modal not found. Include partials/modal-image-preview in the page template.`);
    }
    return modalEl;
}

function bindImagePreviewModalReset(modalEl, {
    titleId = IMAGE_PREVIEW_TITLE_ID,
    imageId = IMAGE_PREVIEW_IMAGE_ID,
} = {}) {
    if (!modalEl || modalEl.dataset.previewResetBound === "1") {
        return;
    }

    modalEl.dataset.previewResetBound = "1";
    modalEl.addEventListener("hidden.bs.modal", () => {
        const titleEl = modalEl.querySelector(`#${titleId}`);
        const imageEl = modalEl.querySelector(`#${imageId}`);

        if (titleEl) {
            titleEl.textContent = "이미지 미리보기";
        }

        if (imageEl) {
            imageEl.removeAttribute("src");
            imageEl.alt = "";
        }
    });
}

function getDefaultPreviewImageUrl(triggerEl) {
    return (
        triggerEl?.dataset?.imageUrl
        || triggerEl?.getAttribute("href")
        || triggerEl?.querySelector("img")?.currentSrc
        || triggerEl?.querySelector("img")?.src
        || triggerEl?.currentSrc
        || triggerEl?.src
        || ""
    );
}

function getDefaultPreviewFileName(triggerEl) {
    return (
        triggerEl?.dataset?.fileName
        || triggerEl?.getAttribute("title")
        || triggerEl?.querySelector("img")?.getAttribute("alt")
        || triggerEl?.getAttribute("alt")
        || "이미지"
    );
}

export function openImagePreviewModal({
    imageUrl,
    fileName = "이미지",
    modalId = IMAGE_PREVIEW_MODAL_ID,
    titleId = IMAGE_PREVIEW_TITLE_ID,
    imageId = IMAGE_PREVIEW_IMAGE_ID,
} = {}) {
    if (!imageUrl) {
        return;
    }

    const modalEl = ensureImagePreviewModal({ modalId, titleId, imageId });
    if (!modalEl) {
        return;
    }
    bindImagePreviewModalReset(modalEl, { titleId, imageId });

    const titleEl = modalEl.querySelector(`#${titleId}`);
    const imageEl = modalEl.querySelector(`#${imageId}`);

    if (titleEl) {
        titleEl.textContent = fileName || "이미지";
    }

    if (imageEl) {
        imageEl.src = imageUrl;
        imageEl.alt = fileName || "이미지";
    }

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

export function bindImagePreviewModal({
    container,
    triggerSelector,
    getImageUrl,
    getFileName,
    modalId = IMAGE_PREVIEW_MODAL_ID,
    titleId = IMAGE_PREVIEW_TITLE_ID,
    imageId = IMAGE_PREVIEW_IMAGE_ID,
} = {}) {
    if (!container || !triggerSelector) {
        return;
    }

    const bindingKey = `${triggerSelector}:${modalId}`;
    const boundKeys = imagePreviewBindingMap.get(container) ?? new Set();
    if (boundKeys.has(bindingKey)) {
        return;
    }

    container.addEventListener("click", (e) => {
        const triggerEl = e.target.closest(triggerSelector);
        if (!triggerEl || !container.contains(triggerEl)) {
            return;
        }

        const imageUrl = typeof getImageUrl === "function"
            ? getImageUrl(triggerEl, e)
            : getDefaultPreviewImageUrl(triggerEl);

        if (!imageUrl) {
            return;
        }

        e.preventDefault();

        const fileName = typeof getFileName === "function"
            ? getFileName(triggerEl, e)
            : getDefaultPreviewFileName(triggerEl);

        openImagePreviewModal({
            imageUrl,
            fileName,
            modalId,
            titleId,
            imageId,
        });
    });

    boundKeys.add(bindingKey);
    imagePreviewBindingMap.set(container, boundKeys);
}

// 파일 다운로드
export function downloadFileFromLink() {
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-download");
        if (!btn) return;

        const url = btn.dataset.url;
        if (!url) {
            alert("다운로드 URL이 없습니다.");
            return;
        }

        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();
    });
}


export async function downloadFileFromBytes({
                                          button,
                                          url,
                                          loadingText = "다운로드 중...",
                                          defaultFileName = "download.xlsx"
                                      }) {
    if (!button) return;

    button.classList.add("disabled");
    const originalHtml = button.innerHTML || button.textContent;

    if (button.innerHTML !== undefined) {
        button.innerHTML = loadingText;
    } else {
        button.textContent = loadingText;
    }

    try {
        const headers = {};
        const csrfHeader = document.querySelector("meta[name='_csrf_header']")?.content;
        const csrfToken = document.querySelector("meta[name='_csrf']")?.content;
        if (csrfHeader && csrfToken) {
            headers[csrfHeader] = csrfToken;
        }

        const res = await fetch(url, {
            method: "GET",
            headers
        });

        if (!res.ok) {
            const ct = res.headers.get("content-type") || "";
            const msg = ct.includes("application/json")
                ? (await res.json())?.message
                : await res.text();
            throw new Error(msg || `다운로드 실패 (HTTP ${res.status})`);
        }

        const disposition = res.headers.get("content-disposition") || "";
        const fileName =
            extractFilenameFromDisposition(disposition)
            || defaultFileName;

        const blob = await res.blob();
        downloadBlob(blob, fileName);

    } catch (err) {
        console.error(err);
        alert(err?.message || "파일 다운로드 중 오류가 발생했습니다.");
    } finally {
        button.classList.remove("disabled");
        if (button.innerHTML !== undefined) {
            button.innerHTML = originalHtml;
        } else {
            button.textContent = originalHtml;
        }
    }
}


function extractFilenameFromDisposition(disposition) {
    // 예: attachment; filename="xxx.xlsx"
    // 또는 filename*=UTF-8''xxx.xlsx 형태도 대응
    const utf8Match = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1].replace(/"/g, "").trim());
    }

    const normalMatch = disposition.match(/filename\s*=\s*("?)([^"]+)\1/i);
    if (normalMatch?.[2]) {
        // 서버에서 이미 URL-encode 해서 내려주는 케이스면 decode 시도
        const raw = normalMatch[2].trim();
        try { return decodeURIComponent(raw); } catch { return raw; }
    }

    return null;
}

function downloadBlob(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}
