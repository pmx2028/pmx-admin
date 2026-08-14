import { initCoverFileUpload } from "../management/management-utils.js";

document.addEventListener('DOMContentLoaded', async function () {
    // 공통 로드
    const container = document.getElementById('profile');
    if (!container) return;
    // 프로필 클릭 이벤트
    container.addEventListener('click', () => {
        loadProfileStatesOnce();
    }, { once: false }); // 내부에 loaded 플래그로 중복 방지

    initPasswordChangeModal(); // 프로필 비번 변경 모달

    initProfileChangeModal();

});

async function loadProfileStatesOnce() {
    const container = document.getElementById('profile-state');
    if (!container || container.dataset.loaded === 'true' || container.dataset.loading === 'true') return;
    container.dataset.loading = 'true';

    try {
        const res = await fetch('/api/topbar/profile/today/stats', { credentials: 'same-origin' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const result = await res.json();
        const data = result?.data ?? {};

        container.querySelectorAll('[data-state]').forEach(tab => {
            const state = tab.getAttribute('data-state');
            const count = data[state] ?? 0;
            // 기존 텍스트에서 첫 번째 '-'만 숫자로 치환
            tab.innerHTML = tab.innerHTML.replace('-', String(count));
            // 접근성: title로도 숫자 힌트 제공(선택)
            if (!tab.getAttribute('title')) {
                tab.setAttribute('title', `${state} : ${count.toLocaleString()}`);
            }
        });

        container.dataset.loaded = 'true';
    } catch (err) {
        console.error('상태 카운트 로딩 실패:', err);
    } finally {
        delete container.dataset.loading;
    }
}

function initProfileChangeModal() {
    const modalEl = document.getElementById("profileChangeModal");
    if (!modalEl) return;

    const userId = document.getElementById("loginUserId")?.value;
    const submitBtn = modalEl.querySelector(".modal-footer .btn.btn-primary");
    const cancelBtn = modalEl.querySelector(".modal-footer .btn.btn-secondary");
    const titleEl = modalEl.querySelector(".modal-title");
    const closeBtn = modalEl.querySelector(".btn-close");
    const previewImage = modalEl.querySelector("#profilePreviewImage");
    const fileInput = modalEl.querySelector("#profileFormFile");
    const fileNameDisplay = modalEl.querySelector("#profileFileNameDisplay");
    const deleteBtn = modalEl.querySelector("#profileDeleteFileBtn");
    const avatarImages = Array.from(document.querySelectorAll("#topbarProfileImage"));

    const state = {
        detail: null,
        loading: false,
        submitting: false,
        currentAvatarSrc: avatarImages[0]?.getAttribute("src") || ""
    };

    if (titleEl) titleEl.textContent = "프로필 변경";
    if (closeBtn) closeBtn.setAttribute("aria-label", "닫기");
    if (submitBtn) {
        submitBtn.textContent = "변경";
        submitBtn.dataset.originalText = "변경";
    }
    if (cancelBtn) cancelBtn.textContent = "취소";

    initCoverFileUpload({
        modalId: "profileChangeModal",
        fileInputId: "profileFormFile",
        fileNameDisplayId: "profileFileNameDisplay",
        deleteFileBtnId: "profileDeleteFileBtn",
        previewImageId: "profilePreviewImage",
        loadingId: "profileUploadLoading"
    });

    const setButtonsDisabled = (disabled) => {
        if (submitBtn) submitBtn.disabled = disabled;
        if (cancelBtn) cancelBtn.disabled = disabled;
    };

    const setLoading = (loading) => {
        state.loading = loading;
        setButtonsDisabled(loading || state.submitting);
        if (!submitBtn) return;
        submitBtn.dataset.originalText ??= submitBtn.textContent;
        submitBtn.textContent = loading ? "불러오는 중..." : (submitBtn.dataset.originalText || submitBtn.textContent);
    };

    const setSubmitting = (submitting) => {
        state.submitting = submitting;
        setButtonsDisabled(submitting || state.loading);
        if (!submitBtn) return;
        submitBtn.dataset.originalText ??= submitBtn.textContent;
        submitBtn.textContent = submitting ? "변경 중..." : (submitBtn.dataset.originalText || submitBtn.textContent);
    };

    const setPreviewFromDetail = (detail) => {
        if (!fileInput || !previewImage || !fileNameDisplay) return;

        fileInput.value = "";
        fileInput.dataset.coverId = detail?.coverId != null ? String(detail.coverId) : "";

        if (detail?.coverImageUrl) {
            previewImage.src = detail.coverImageUrl;
            previewImage.classList.remove("d-none");
            fileNameDisplay.textContent = detail.coverImageTitle || "";
            if (deleteBtn) deleteBtn.style.display = "";
            return;
        }

        previewImage.src = "";
        previewImage.classList.add("d-none");
        fileNameDisplay.textContent = "";
        if (deleteBtn) deleteBtn.style.display = "none";
    };

    const updateAvatarImages = (src) => {
        if (!src) return;
        state.currentAvatarSrc = src;
        avatarImages.forEach((img) => {
            img.src = src;
        });
    };

    const parseJsonSafely = async (res) => {
        try {
            return await res.json();
        } catch (_) {
            return null;
        }
    };

    const loadProfileDetail = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "GET",
                credentials: "include",
                headers: { Accept: "application/json" }
            });
            const json = await parseJsonSafely(res);
            if (!res.ok) {
                throw new Error(json?.message || "프로필 정보를 불러오지 못했습니다.");
            }

            state.detail = json?.data ?? {};
            setPreviewFromDetail(state.detail);
        } catch (err) {
            console.error(err);
            alert(err?.message || "프로필 정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    modalEl.addEventListener("show.bs.modal", () => {
        setPreviewFromDetail(null);
        void loadProfileDetail();
    });

    modalEl.addEventListener("hidden.bs.modal", () => {
        state.detail = null;
        setLoading(false);
        setSubmitting(false);
    });

    submitBtn?.addEventListener("click", async (e) => {
        e.preventDefault();

        if (state.loading || state.submitting) return;
        if (!state.detail) {
            alert("프로필 정보를 불러오는 중입니다.");
            return;
        }

        const rawCoverId = fileInput?.dataset?.coverId ?? "";
        const coverId = rawCoverId === "" ? null : Number(rawCoverId);

        try {
            setSubmitting(true);

            const res = await putWithCsrf("/api/users/me/profile-image", { coverId });
            const json = await parseJsonSafely(res);
            if (!res.ok) {
                throw new Error(json?.message || "프로필 이미지 변경에 실패했습니다.");
            }

            const updatedProfileImg = json?.data?.profileImg || previewImage?.getAttribute("src") || state.currentAvatarSrc;
            updateAvatarImages(updatedProfileImg);

            state.detail = {
                ...state.detail,
                coverId,
                coverImageUrl: coverId == null ? "" : (previewImage?.getAttribute("src") || ""),
                coverImageTitle: coverId == null ? "" : (fileNameDisplay?.textContent?.trim() || state.detail.coverImageTitle || "")
            };

            alert(json?.message || "프로필 이미지가 변경되었습니다.");
            bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        } catch (err) {
            console.error(err);
            alert(err?.message || "프로필 이미지 변경에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    });
}

function initPasswordChangeModal() {
    const modalEl = document.getElementById("passwordChangeModal");
    if (!modalEl) return;

    const currentPw = modalEl.querySelector("#currentPassword");
    const newPw = modalEl.querySelector("#newPassword");
    const confirmPw = modalEl.querySelector("#confirmPassword");

    const submitBtn = modalEl.querySelector(".modal-footer .btn.btn-primary");
    const cancelBtn = modalEl.querySelector(".modal-footer .btn.btn-secondary");

    /* =========================
     * Eye toggle
     * ========================= */
    const setToggleIcon = (btn, visible) => {
        const icon = btn.querySelector("i");
        if (!icon) return;
        icon.classList.toggle("ri-eye-line", !visible);
        icon.classList.toggle("ri-eye-off-line", visible);
    };

    const togglePassword = (btn) => {
        const selector = btn.getAttribute("data-toggle-password");
        if (!selector) return;

        const input = modalEl.querySelector(selector);
        if (!input) return;

        const visible = input.type === "text";
        input.type = visible ? "password" : "text";
        setToggleIcon(btn, !visible);
        input.focus();
    };

    /* =========================
     * Validation (alert only)
     * ========================= */
    const validatePasswordMatch = () => {
        if (!newPw.value || !confirmPw.value) return true;

        if (newPw.value !== confirmPw.value) {
            alert("새 비밀번호가 일치하지 않습니다.");
            confirmPw.focus();
            return false;
        }
        return true;
    };

    /* =========================
     * UX helpers
     * ========================= */
    const setLoading = (loading) => {
        if (!submitBtn) return;
        submitBtn.disabled = loading;
        if (cancelBtn) cancelBtn.disabled = loading;
        submitBtn.textContent = loading ? "변경중..." : "변경";
    };

    const resetModal = () => {
        currentPw.value = "";
        newPw.value = "";
        confirmPw.value = "";

        [currentPw, newPw, confirmPw].forEach((el) => {
            el.type = "password";
        });

        modalEl
            .querySelectorAll("[data-toggle-password]")
            .forEach((btn) => setToggleIcon(btn, false));

        setLoading(false);
    };

    /* =========================
     * Logout (기존 topbar form 재사용)
     * ========================= */
    const doLogout = () => {
        const logoutForm = document.forms["logoutForm"];
        if (logoutForm) {
            logoutForm.submit();
            return;
        }
        window.location.href = "/logout";
    };

    /* =========================
     * API call
     * - 실패 시 throw(message)
     * - 성공 시 message 반환
     * ========================= */
    const changePassword = async () => {
        const res = await putWithCsrf("/api/users/password", {
            currentPassword: currentPw.value,
            password: newPw.value
        });

        let json = null;
        try {
            json = await res.json();
        } catch (_) {}

        const message =
            json?.message ||
            (res.ok ? "비밀번호 변경이 완료되었습니다." : "비밀번호 변경에 실패했습니다.");

        const success = res.ok && (json === true || json?.data === true);

        if (!success) {
            // ❌ 여기서 throw → 이후 로직 전부 중단
            throw new Error(message);
        }

        return message;
    };

    /* =========================
     * Events
     * ========================= */

    // eye toggle (event delegation)
    modalEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-toggle-password]");
        if (!btn) return;
        e.preventDefault();
        togglePassword(btn);
    });

    // submit
    submitBtn?.addEventListener("click", async (e) => {
        e.preventDefault();

        // 브라우저 기본 required 체크
        if (!currentPw.checkValidity() || !newPw.checkValidity() || !confirmPw.checkValidity()) {
            currentPw.reportValidity();
            newPw.reportValidity();
            confirmPw.reportValidity();
            return;
        }

        // 새 비밀번호 불일치
        if (!validatePasswordMatch()) return;

        try {
            setLoading(true);

            // 성공 시 message 반환 / 실패 시 throw
            const message = await changePassword();

            alert(message);   // ✅ 서버 메시지 그대로
            doLogout();

        } catch (err) {
            setLoading(false);
            alert(err?.message || "비밀번호 변경에 실패했습니다.");
        }
    });

    // modal close 시 초기화
    modalEl.addEventListener("hidden.bs.modal", resetModal);
}
