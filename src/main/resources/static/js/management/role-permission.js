document.addEventListener("DOMContentLoaded", () => {
    const roleListContainer = document.querySelector(".role-list");
    const roleNameTarget = document.getElementById("selected-role-name");
    const actionPermissionList = document.querySelector(".action-permission-list");
    const pagePermissionList = document.querySelector(".page-permission-list");
    const saveButton = document.querySelector(".data-save");
    const resetButton = document.querySelector(".data-reset");

    let allPermissions = [];
    let selectedRoleId = null;
    let currentRoleFetchAborter = null;
    let originalGrantedIds = []; // 서버에서 받은 초기 권한 상태

    // Reset 버튼 초기 비활성화
    resetButton.disabled = true;

    // === 초기 로드 ===
    loadAllPermissions();
    fetch("/api/roles")
        .then((res) => res.json())
        .then((payload) => renderRoleList(payload.data || []))
        .catch(console.error);

    // =========================
    // 전체 권한 목록 불러오기
    // =========================
    async function loadAllPermissions() {
        const res = await fetch("/api/permissions");
        const payload = await res.json();
        allPermissions = payload.data || [];
        renderPermissionLists(allPermissions, []); // 초기에는 비어 있음
    }

    // =========================
    // 권한 리스트 렌더링
    // =========================
    function renderPermissionLists(permissions, grantedIds) {
        const grantedSet = new Set(grantedIds);
        const articlePermissions = permissions.filter((p) => p.type === "ACTION");
        const pagePermissions = permissions.filter((p) => p.type === "PAGE");

        const renderList = (list, container) => {
            container.innerHTML = list.length
                ? list
                    .map(
                        (p) => `
                              <label class="list-group-item justify-content-between align-items-center">
                                <input class="form-check-input me-1" type="checkbox"
                                       data-permission-id="${p.id}" ${grantedSet.has(p.id) ? "checked" : ""}>
                                <span>${p.name}</span>
                              </label>`
                    )
                    .join("")
                : `<div class="text-muted p-2">등록된 권한이 없습니다.</div>`;
        };

        renderList(articlePermissions, actionPermissionList);
        renderList(pagePermissions, pagePermissionList);

        // ✅ 체크박스 변경 이벤트 감지 → Reset 버튼 활성화
        document.querySelectorAll(".permission-grid input[type='checkbox']").forEach((chk) => {
            chk.addEventListener("change", handleCheckboxChange);
        });
    }

    // =========================
    // 체크박스 상태 변경 감지
    // =========================
    function handleCheckboxChange() {
        if (!originalGrantedIds || originalGrantedIds.length === 0) {
            resetButton.disabled = false;
            return;
        }

        const currentCheckedIds = Array.from(
            document.querySelectorAll(".permission-grid input[type='checkbox']:checked")
        ).map((el) => Number(el.dataset.permissionId));

        // 변경사항이 있으면 resetButton 활성화, 없으면 비활성화
        const isDifferent =
            currentCheckedIds.length !== originalGrantedIds.length ||
            currentCheckedIds.some((id) => !originalGrantedIds.includes(id));

        resetButton.disabled = !isDifferent;
    }

    // =========================
    // 역할 목록 렌더링 + 클릭 이벤트
    // =========================
    function renderRoleList(roles) {
        roleListContainer.innerHTML = roles
            .map(
                (r) => `
                    <button type="button"
                            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            data-role-id="${r.id}" data-role-name="${r.name}">
                      <div>
                        <strong>${r.name}</strong><br>
                        <small>${r.description || "설명 없음"}</small>
                      </div>
                      <i class="ri-arrow-right-s-line"></i>
                    </button>`
            )
            .join("");

        roleListContainer.querySelectorAll(".list-group-item").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const roleId = btn.dataset.roleId;
                selectedRoleId = roleId;

                // UI 업데이트
                roleNameTarget.textContent = btn.dataset.roleName;
                roleListContainer.querySelectorAll(".list-group-item").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                document.querySelector(".permission-grid")?.classList.remove("d-none");
                document.querySelector(".btn-grid")?.classList.remove("d-none");

                // 이전 요청 취소
                if (currentRoleFetchAborter) currentRoleFetchAborter.abort();
                currentRoleFetchAborter = new AbortController();

                try {
                    const res = await fetch(`/api/roles/${roleId}/permissions`, { signal: currentRoleFetchAborter.signal });
                    const payload = await res.json();
                    const grantedIds = payload.data || [];
                    originalGrantedIds = grantedIds; // ✅ 초기 상태 저장
                    resetButton.disabled = true; // ✅ 처음엔 비활성화
                    renderPermissionLists(allPermissions, grantedIds);
                } catch (e) {
                    if (e.name === "AbortError") return;
                    console.error(e);
                }
            });
        });
    }

    // =========================
    // 저장 버튼 클릭
    // =========================
    saveButton?.addEventListener("click", async () => {
        if (!selectedRoleId) {
            alert("먼저 역할을 선택하세요.");
            return;
        }

        const checkedIds = Array.from(document.querySelectorAll(".permission-grid input[type='checkbox']:checked"))
            .map((el) => Number(el.dataset.permissionId));

        try {

            const res = await putWithCsrf(`/api/roles/${selectedRoleId}/permissions`, checkedIds);
            const result = await res.json();

            if (result.success) {
                alert("권한이 저장되었습니다.");
                originalGrantedIds = checkedIds; // ✅ 저장 성공 시 상태 갱신
                resetButton.disabled = true; // ✅ 다시 비활성화
            } else {
                alert("저장 실패: " + (result.message || "서버 오류"));
                await loadRolePermissions(selectedRoleId);
            }
        } catch (err) {
            console.error(err);
            alert("저장 중 오류가 발생했습니다.");
        }
    });

    // =========================
    // 되돌리기 버튼 클릭
    // =========================
    resetButton?.addEventListener("click", async () => {
        if (!selectedRoleId) return;
        await loadRolePermissions(selectedRoleId);
        resetButton.disabled = true; // ✅ 되돌린 후 다시 비활성화
    });

    async function loadRolePermissions(roleId) {
        const res = await fetch(`/api/roles/${roleId}/permissions`);
        const payload = await res.json();
        const grantedIds = payload.data || [];
        originalGrantedIds = grantedIds;
        renderPermissionLists(allPermissions, grantedIds);
    }
});
