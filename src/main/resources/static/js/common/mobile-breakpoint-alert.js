(function () {
    if (window.__mobileBreakpointAlertInitialized) {
        return;
    }

    window.__mobileBreakpointAlertInitialized = true;

    const MOBILE_BREAKPOINT_PX = 768;
    const MOBILE_BREAKPOINT_QUERY = `(max-width: ${MOBILE_BREAKPOINT_PX}px)`;
    const ALERT_ID = "mobile-breakpoint-alert";
    const ALERT_CONTAINER_ID = "mobile-breakpoint-alert-container";
    const ALERT_MESSAGE = "모바일 버전입니다.";
    const MOBILE_VIEWPORT_STATE_KEY = "mobile-breakpoint-viewport-state";
    const MOBILE_ALERT_INIT_KEY = "mobile-breakpoint-alert-initialized";
    let fallbackHideTimer = null;

    function isMobileBrowserContext() {
        if (window.navigator.userAgentData && typeof window.navigator.userAgentData.mobile === "boolean") {
            return window.navigator.userAgentData.mobile;
        }

        return /Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent);
    }

    function isStoredMobileViewport() {
        try {
            return window.sessionStorage.getItem(MOBILE_VIEWPORT_STATE_KEY) === "mobile";
        } catch (error) {
            return window.__mobileBreakpointViewportState === "mobile";
        }
    }

    function hasInitializedMobileAlert() {
        try {
            return window.sessionStorage.getItem(MOBILE_ALERT_INIT_KEY) === "true";
        } catch (error) {
            return window.__mobileBreakpointAlertInitializedForTab === true;
        }
    }

    function setStoredMobileViewport(isMobile) {
        try {
            window.sessionStorage.setItem(
                MOBILE_VIEWPORT_STATE_KEY,
                isMobile ? "mobile" : "desktop"
            );
            return;
        } catch (error) {
            window.__mobileBreakpointViewportState = isMobile ? "mobile" : "desktop";
        }
    }

    function setMobileAlertInitialized() {
        try {
            window.sessionStorage.setItem(MOBILE_ALERT_INIT_KEY, "true");
            return;
        } catch (error) {
            window.__mobileBreakpointAlertInitializedForTab = true;
        }
    }

    function isReloadNavigation() {
        const navigationEntry = window.performance?.getEntriesByType?.("navigation")?.[0];
        if (navigationEntry && typeof navigationEntry.type === "string") {
            return navigationEntry.type === "reload";
        }

        if (window.performance?.navigation) {
            return window.performance.navigation.type === 1;
        }

        return false;
    }

    function ensureAlertContainer() {
        const existingContainer = document.getElementById(ALERT_CONTAINER_ID);
        if (existingContainer) {
            return existingContainer;
        }

        const container = document.createElement("div");
        container.id = ALERT_CONTAINER_ID;
        container.className = "mobile-breakpoint-alert-container position-fixed bottom-0 start-50 translate-middle-x p-3";
        container.style.zIndex = "1080";
        document.body.appendChild(container);
        return container;
    }

    function ensureAlertElement() {
        const existingAlert = document.getElementById(ALERT_ID);
        if (existingAlert) {
            return existingAlert;
        }

        const container = ensureAlertContainer();
        const alert = document.createElement("div");
        alert.id = ALERT_ID;
        alert.className = "mobile-breakpoint-alert alert alert-dark alert-dismissible fade show mb-0 shadow-sm";
        alert.setAttribute("role", "alert");
        alert.innerHTML = [
            `  <div><strong><i class="ri-smartphone-line me-1"></i></strong>${ALERT_MESSAGE}</div>`,
            '  <button type="button" class="mobile-breakpoint-alert-close btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
        ].join("");

        container.appendChild(alert);
        return alert;
    }

    function attachFallbackCloseHandler(alertElement) {
        const closeButton = alertElement.querySelector("[data-bs-dismiss='alert']");
        if (!closeButton || closeButton.dataset.fallbackBound === "true") {
            return;
        }

        closeButton.dataset.fallbackBound = "true";
        closeButton.addEventListener("click", function () {
            alertElement.remove();
        });
    }

    function showMobileAlert() {
        const alertElement = ensureAlertElement();
        attachFallbackCloseHandler(alertElement);

        if (window.bootstrap && typeof window.bootstrap.Alert === "function") {
            window.bootstrap.Alert.getOrCreateInstance(alertElement);
        }

        alertElement.classList.add("show");

        if (fallbackHideTimer) {
            window.clearTimeout(fallbackHideTimer);
        }

        fallbackHideTimer = window.setTimeout(function () {
            if (window.bootstrap && typeof window.bootstrap.Alert === "function") {
                const alertInstance = window.bootstrap.Alert.getOrCreateInstance(alertElement);
                alertInstance.close();
            } else {
                alertElement.remove();
            }

            fallbackHideTimer = null;
        }, 3000);
    }

    function handleViewportChange(isMobile, wasMobile) {
        if (isMobile && !wasMobile) {
            showMobileAlert();
        }

        setStoredMobileViewport(isMobile);
    }

    function initWithMatchMedia() {
        const mediaQueryList = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
        let wasMobile = isStoredMobileViewport();

        function handleChange(event) {
            const isMobile = event.matches;
            handleViewportChange(isMobile, wasMobile);
            wasMobile = isMobile;
        }

        if (typeof mediaQueryList.addEventListener === "function") {
            mediaQueryList.addEventListener("change", handleChange);
            return;
        }

        if (typeof mediaQueryList.addListener === "function") {
            mediaQueryList.addListener(handleChange);
        }
    }

    function initWithResizeFallback() {
        let wasMobile = isStoredMobileViewport();

        window.addEventListener("resize", function () {
            const isMobile = window.innerWidth <= MOBILE_BREAKPOINT_PX;
            handleViewportChange(isMobile, wasMobile);
            wasMobile = isMobile;
        });
    }

    function showInitialMobileAlert() {
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT_PX;
        const wasInitialized = hasInitializedMobileAlert();
        const wasMobile = isStoredMobileViewport();
        const isReload = isReloadNavigation();

        if (isMobile && (isReload || !wasInitialized || !wasMobile)) {
            showMobileAlert();
        }

        setMobileAlertInitialized();
        setStoredMobileViewport(isMobile);
    }

    function initMobileBreakpointAlert() {
        if (isMobileBrowserContext()) {
            setStoredMobileViewport(window.innerWidth <= MOBILE_BREAKPOINT_PX);
            return;
        }

        showInitialMobileAlert();

        if (typeof window.matchMedia === "function") {
            initWithMatchMedia();
            return;
        }

        initWithResizeFallback();
    }

    initMobileBreakpointAlert();
})();
