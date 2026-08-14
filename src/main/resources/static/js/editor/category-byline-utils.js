export function initCategoryOptions(container) {
    const depth1 = container.querySelector(".depth1");
    const depth2 = container.querySelector(".depth2");
    const depth3 = container.querySelector(".depth3");

    if (!depth1 || !depth2 || !depth3) {
        console.warn("setupCategoryTree: depth1/2/3 input is missing.", container);
        return;
    }

    const rootParentId = container.dataset.rootId;
    void loadCategories(rootParentId, depth1);
    categoryChangeAction(container);
}

export async function loadCategories(parentId, targetSelect, savedId = null) {
    const res = await fetch(`/api/editor/categories/${parentId}/children`);
    const list = await res.json();
    const data = list.data || [];

    let defaultText = "선택";
    if (targetSelect.classList.contains("depth1")) defaultText = "1ˢᵗ depth";
    else if (targetSelect.classList.contains("depth2")) defaultText = "2ⁿᵈ depth";
    else if (targetSelect.classList.contains("depth3")) defaultText = "3ʳᵈ depth";

    targetSelect.innerHTML = `<option selected value="default">${defaultText}</option>`;

    data.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.text = item.name;
        targetSelect.appendChild(opt);
    });

    if (savedId != null) {
        targetSelect.value = String(savedId);
    }

    return data.length;
}

export function categoryChangeAction(container) {
    const depth1 = container.querySelector(".depth1");
    const depth2 = container.querySelector(".depth2");
    const depth3 = container.querySelector(".depth3");

    depth1.addEventListener("change", () => {
        const selectedId = depth1.value;

        depth2.innerHTML = '<option selected="" value="default">2ⁿᵈ depth</option>';
        depth3.innerHTML = '<option selected="" value="default">3ʳᵈ depth</option>';

        if (selectedId && selectedId !== "default") {
            void loadCategories(selectedId, depth2);
        }
    });

    depth2.addEventListener("change", async () => {
        const selectedId = depth2.value;

        depth3.innerHTML = '<option selected="" value="default">3ʳᵈ depth</option>';

        if (selectedId && selectedId !== "default") {
            const count = await loadCategories(selectedId, depth3);
            if (count === 0) {
                depth3.innerHTML = '<option selected disabled value="-">-</option>';
            }
        }

        updateBylinePreview();
    });
}

export function updateBylinePreview() {
    const alertContainer = document.getElementById("liveAlertPlaceholder");
    const previewBylineInput = document.getElementById("byline-preview");

    if (!alertContainer || !previewBylineInput) {
        return;
    }

    const isCustomByline = document.getElementById("custom-byline-check").checked;
    const isNewsroomByline = document.getElementById("byline-newsroom").checked;
    const isAnonymousByline = document.getElementById("byline-anonymous").checked;
    if (isCustomByline || isNewsroomByline || isAnonymousByline) {
        return;
    }

    const alertBlocks = alertContainer.querySelectorAll(".alert");
    if (alertBlocks.length === 0) {
        const userId = document.getElementById("loginUserId").value;
        const userName = document.getElementById("loginUserName").textContent;
        const userByline = document.getElementById("loginUserByline").value;
        void addBylineUserBlock(userId, userName, alertContainer, userByline);
        return;
    }

    const reporters = Array.from(alertContainer.querySelectorAll(".alert"))
        .map(block => ({
            name: (block.querySelector(".remove-byline-btn")?.dataset.userName || "").trim().replace(/\s+/g, ""),
            byline: (block.querySelector('input[name="userByline"]')?.value || "").trim()
        }))
        .filter(reporter => reporter.name !== "");

    const loginCompName = document.getElementById("loginUserCompanyName").value;
    const siteCompanyName = loginCompName === "딜사이트경제TV" ? "딜사이트경제TV" : "딜사이트";

    if (reporters.length > 1) {
        reporters[0].name = `${siteCompanyName} ${reporters[0].name}`;
        previewBylineInput.value = `${reporters.map(reporter => reporter.name).join(", ")} 기자`;
        return;
    }

    if (reporters.length === 1) {
        previewBylineInput.value = buildOnePersonBylinePreviewVal(
            siteCompanyName,
            reporters[0].name,
            reporters[0].byline
        );
        return;
    }

    previewBylineInput.value = "";
}

function buildOnePersonBylinePreviewVal(siteCompanyName, name, userByline = "") {
    const isIntern = hasInternRole();
    const hasColumnCategory = hasColumnLabelInCategoryBox();

    if (hasColumnCategory || isIntern) {
        return `${siteCompanyName} ${removeTrainingRoleWords(userByline)}`;
    }

    return `${siteCompanyName} ${name} 기자`;
}

function removeTrainingRoleWords(byline = "") {
    return byline
        .replace(/(?:수습|인턴)\s*/g, "")
        .trim()
        .replace(/\s+/g, " ");
}

function hasColumnLabelInCategoryBox() {
    const selects = document.querySelectorAll(".category-selector-box select");

    return Array.from(selects).some(sel => {
        const text = sel.selectedOptions?.[0]?.textContent?.trim();
        return text === "칼럼";
    });
}

export async function addBylineUserBlock(userId, userName, alertContainer, userByline = "") {
    if (!userId) {
        alert("기자를 선택해 주세요.");
        return;
    }

    const exists = alertContainer.querySelector(`input[name="userId"][value="${userId}"]`);
    if (exists) {
        alert("이미 추가된 기자입니다.");
        return;
    }

    const loginUserId = document.getElementById("loginUserId").value;

    const resolvedUserByline = userByline;

    const userButton = loginUserId.toString() === userId.toString()
        ? `<button type="button" class="btn btn-soft-purple rounded-pill remove-byline-btn" aria-label="Close" data-user-name="${userName}">
                ${userName} <i class="ri-indeterminate-circle-fill"></i>
           </button>`
        : `<button type="button" class="btn btn-soft-pink rounded-pill remove-byline-btn" aria-label="Close" data-user-name="${userName}">
                ${userName} <i class="ri-indeterminate-circle-fill"></i>
           </button>`;

    const block = document.createElement("div");
    block.className = "alert text-dark fade show d-inline-block me-2";

    block.innerHTML = `
        <div class="input-group">
            ${userButton}
            <input type="hidden" name="userId" value="${userId}" />
            <input type="hidden" name="userByline" value="${resolvedUserByline}" />
        </div>
    `;

    block.addEventListener("closed.bs.alert", () => {
        updateBylinePreview();
    });

    alertContainer.appendChild(block);
    updateBylinePreview();
}
