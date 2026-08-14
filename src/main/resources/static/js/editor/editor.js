import {
    bindActionBtnClickEventInEditor,
    bindArticleDetailData,
    bindCategoryBoxAddRemoveEvents,
    bindEmbargoEvent,
    bindEditorExitUnlock,
    bindForceUnlockButtonClick,
    bindMyspaceDetailData,
    bindPackAutocomplete,
    checkAndPromptLoadArticleTemp,
    bindReporterAutocomplete, blurActiveTextarea,
    customBylineCheckEvent,
    handleBeforeUnload,
    initArticleTitleCharacterCount,
    initArticleTitleColorPicker,
    initArticleClipDropzone,
    initAutoResizeTextArea,
    initCategoryModal,
    initOffCanvasEvent,
    initSingleCheckboxGroup,
    loadRampad,
    removeBylineAlert,
    saveArticle,
    saveMySpace,
    setupReporterByline, showArticlePreviewBeforeSave,
    startArticleTempAutoSaveInterval,
    startAutoSaveInterval,
    toggleBylineLiveAlertPlaceholder,
    updateArticle, updateArticleInMySpaceContinue,
} from "./editor-utils.js";
import {
    initRelatedArticleSelection, initRelatedKrxSelection,
    removeAutoHashtag,
    searchCandidateRelatedArticles, searchCandidateRelatedKrx,
    searchInfographicChart,
    initRightPreviews,
    addThumbnailEvent, bindAutoHashtagDebounce, searchCandidateDealData, bindDealDataModalButtons,
    bindUploadImageInSubArea, bindImageModalInSubArea
} from "./editor-sub-area-utils.js";
import {initModalDealUtils} from "./modal-deal-utils.js";
import {initModalStockUtils} from "./modal-stock-utils.js";
import {
    addBylineUserBlock,
    initCategoryOptions,
} from "./category-byline-utils.js";
import {printArticle} from "../article/article-utils.js";
import {showArticlePreview} from "../article/article-preview-utils.js";

// 전역 플래그(없으면 생성)
document.addEventListener("DOMContentLoaded", function () {
    const mainScrollEl = document.querySelector('.main-scroll');
    const flexContainer = document.querySelector('.editor-flex-container');
    const mainAreaEl = document.querySelector('.main-area');
    const subPanelEl = document.querySelector('.sub-panel');
    const mobileMediaQuery = window.matchMedia('(max-width: 768px) and (hover: none) and (pointer: coarse)');

    const recalculateSimpleBar = (element) => {
        if (!element) {
            return;
        }

        window.SimpleBar?.instances?.get(element)?.recalculate?.();
    };

    const getEditorLayoutMode = () => {
        if (!flexContainer || !mainAreaEl || !subPanelEl) {
            return 'unknown';
        }

        if (flexContainer.classList.contains('is-fullscreen')) {
            return 'fullscreen';
        }

        const flexDirection = window.getComputedStyle(flexContainer).flexDirection;
        if (flexDirection === 'column') {
            return 'stacked';
        }

        const mainRect = mainAreaEl.getBoundingClientRect();
        const subRect = subPanelEl.getBoundingClientRect();
        return subRect.top >= (mainRect.bottom - 1) ? 'stacked' : 'split';
    };

    let layoutSyncRafId = 0;
    let lastLayoutMode = getEditorLayoutMode();

    const scheduleEditorLayoutSync = () => {
        if (layoutSyncRafId) {
            return;
        }

        layoutSyncRafId = window.requestAnimationFrame(() => {
            layoutSyncRafId = 0;

            recalculateSimpleBar(mainScrollEl);
            recalculateSimpleBar(subPanelEl);

            const nextLayoutMode = getEditorLayoutMode();
            const hasLayoutModeChanged = nextLayoutMode !== lastLayoutMode;
            lastLayoutMode = nextLayoutMode;

            if (hasLayoutModeChanged) {
                void window.recreateMainEditor?.({
                    isMobile: mobileMediaQuery.matches
                });
                return;
            }

            window.mainEditor?.ui?.view?.stickyPanel?.checkIfShouldBeSticky?.();
        });
    };

    if (flexContainer && mainAreaEl && subPanelEl) {
        window.addEventListener('resize', scheduleEditorLayoutSync, { passive: true });

        if (window.ResizeObserver) {
            const editorLayoutObserver = new ResizeObserver(() => {
                scheduleEditorLayoutSync();
            });

            editorLayoutObserver.observe(flexContainer);
            editorLayoutObserver.observe(mainAreaEl);
            editorLayoutObserver.observe(subPanelEl);
        }

        scheduleEditorLayoutSync();
    }

    // SimpleBar 스크롤 이벤트를 window scroll로 브리지
    // CKEditor sticky 패널 위치 계산이 window scroll 기준이므로 동기화 필요
    if (mainScrollEl) {
        requestAnimationFrame(() => {
            const instance = window.SimpleBar?.instances?.get(mainScrollEl);
            const scrollEl = instance?.getScrollElement();
            if (scrollEl) {
                let syncRafId = 0;

                const syncStickyStateNearActions = () => {
                    const stickyPanel = window.mainEditor?.ui?.view?.stickyPanel;
                    const actionBar = document.querySelector('.editor-action-bar');
                    if (!stickyPanel || !actionBar) return;

                    const stickyContentEl = document.querySelector('.ck-sticky-panel__content');
                    const scrollRect = scrollEl.getBoundingClientRect();
                    const actionRect = actionBar.getBoundingClientRect();
                    const stickyHeight = stickyContentEl?.getBoundingClientRect().height ?? 0;
                    const overlapLine = scrollRect.bottom - stickyHeight - 16;
                    const shouldDisableSticky = actionRect.top <= overlapLine;

                    if (shouldDisableSticky && stickyPanel.isActive) {
                        stickyPanel.isActive = false;
                        return;
                    }

                    if (!shouldDisableSticky && !stickyPanel.isActive) {
                        stickyPanel.isActive = true;
                    }
                };

                const syncCkeditorFloatingUi = () => {
                    if (syncRafId) return;

                    syncRafId = window.requestAnimationFrame(() => {
                        syncRafId = 0;

                        recalculateSimpleBar(mainScrollEl);
                        syncStickyStateNearActions();
                        window.mainEditor?.ui?.view?.stickyPanel?.checkIfShouldBeSticky?.();
                    });
                };

                scrollEl.addEventListener('scroll', syncCkeditorFloatingUi, { passive: true });
                syncCkeditorFloatingUi();
            }
        });
    }

    const mode = document.getElementById('mode').value;

    // -------- 편집중 안내 화면 --------------
    if (mode === 'editor-lock') {
        // editor-lock 모드일 때는 강제 해제만 처리하고 다른 건 실행하지 않음
        bindForceUnlockButtonClick();
        return;
    }

    // --------- 에디터 모드별 동작 영역 ----------
    initArticleTitleCharacterCount();

    if (mode==='create') {
        initCreateMode();

    } else if (mode==='edit') {
        initEditMode();

    } else if (mode==='autosave-continue') {
        initAutosaveContinueMode();  // 자동저장 이어쓰기

    } else if (mode==='continue') {
        initMyspaceContinueMode(); // 마이스페이스 이어쓰기
    }

    // ------- 공통 동작 영역 (editor) --------

    // 문패/어깨 자동완성 바인딩
    bindPackAutocomplete('series'); // 문패
    bindPackAutocomplete('serial'); // 어깨

    // 엠바고
    bindEmbargoEvent();

    // 분류 +/- 동작 바인딩
    bindCategoryBoxAddRemoveEvents();
    initCategoryModal();

    // 기자검색 자동완성 바인딩
    bindReporterAutocomplete();

    // 기사 속성 하나만 선택 가능하도록 제어
    initSingleCheckboxGroup('attributeType');
    // 기자 검색 후 바이라인 영역에 기자 추가 이벤트
    const reporterConfirmBtn = document.getElementById('AlertBtn');
    if (reporterConfirmBtn) {
        reporterConfirmBtn.addEventListener('click', () => {
            void setupReporterByline();
        });
    }

    // 바이라인 관련 체크박스 하나만 선택 가능하도록 제어
    initSingleCheckboxGroup('bylineType');
    // 바이라인 체크박스 선택 이벤트 바인딩
    toggleBylineLiveAlertPlaceholder()
    document.getElementById('byline-newsroom').addEventListener('change', toggleBylineLiveAlertPlaceholder);
    document.getElementById('byline-anonymous').addEventListener('change', toggleBylineLiveAlertPlaceholder);
    document.getElementById('custom-byline-check').addEventListener('change', customBylineCheckEvent);

    // 바이라인 삭제 이벤트 바인딩
    document.addEventListener('click', function (e) {
        const removeBtn = e.target.closest('.remove-byline-btn');
        if (removeBtn) {
            e.preventDefault(); // 기본 동작 막기
            removeBylineAlert(removeBtn);
        }
    });

    // 화면이탈 알림 리스너 등록
    window.__EDITOR_BEFORE_UNLOAD_HANDLER__ = handleBeforeUnload;
    window.addEventListener('beforeunload', handleBeforeUnload);

    // ------- 공통 동작 영역 (editor-sub-area) --------
    // 해시태그 삭제
    removeAutoHashtag();
    // 인포그래픽 검색
    searchInfographicChart();
    // 관련기사 대상 검색
    searchCandidateRelatedArticles();
    showArticlePreview();
    // 관련종목 대상 검색
    searchCandidateRelatedKrx();
    // 재무&Deal 데이타 대상 검색
    searchCandidateDealData();

    // 우측 이미지 이벤트
    initRightPreviews();
    bindImageModalInSubArea();
    initArticleClipDropzone();

    // 썸네일 등록 이벤트
    addThumbnailEvent();

    bindUploadImageInSubArea();

    // 재무, deal 모달 열기 이벤트
    bindDealDataModalButtons();

    // deal 데이터 관련 이벤트
    initModalDealUtils();

    // 재무데이터 관련 이벤트
    initModalStockUtils();

    printArticle();
});

function bindAsyncClickWithLock(buttonOrButtons, handler) {
    const buttons = buttonOrButtons instanceof Element
        ? [buttonOrButtons]
        : Array.from(buttonOrButtons ?? []);

    if (buttons.length === 0) {
        return;
    }

    let requestInFlight = false;

    buttons.forEach(button => {
        if (button.dataset.asyncClickBound === '1') {
            return;
        }

        button.dataset.asyncClickBound = '1';

        button.addEventListener('click', async function () {
            if (requestInFlight) {
                return;
            }

            requestInFlight = true;
            const originalDisabledStates = buttons.map(targetButton => ({
                button: targetButton,
                disabled: targetButton.disabled,
            }));

            buttons.forEach(targetButton => {
                targetButton.disabled = true;
            });

            try {
                await handler();
            } finally {
                requestInFlight = false;
                originalDisabledStates.forEach(({ button, disabled }) => {
                    button.disabled = disabled;
                });
            }
        });
    });
}


function initCreateMode() {
    // 페이지 로드 시 자동저장에 사용되는 UUID 생성
    const tabKey = crypto.randomUUID();

    // 제목 색상 컬러픽커 세팅
    initArticleTitleColorPicker();

    // 제목, 부제목 단락 높이 세팅
    initAutoResizeTextArea();

    // 자동 해시태그
    bindAutoHashtagDebounce();

    // 미리보기
    showArticlePreviewBeforeSave();

    // 자동저장
    const rampadState = { rampadId: null };
    startAutoSaveInterval(tabKey, rampadState);

    // 본인 바이라인 로드
    const userId = document.getElementById("loginUserId").value;
    const userByline = document.getElementById("loginUserByline").value;
    const userName = document.getElementById("loginUserName").textContent;
    const alertContainer = document.getElementById('liveAlertPlaceholder');
    void addBylineUserBlock(userId, userName, alertContainer, userByline); // 본인 바이라인 로딩

    // depth1,2,3 옵션 로드
    document.querySelectorAll('.category-selector-box').forEach(box => {
        initCategoryOptions(box);
    });

    // 저장
    bindAsyncClickWithLock(document.getElementById('saveArticleBtn'), async function () {
        blurActiveTextarea();
        await saveArticle(rampadState);
    });

    // 마이스페이스 저장
    bindAsyncClickWithLock(document.getElementById('saveMyspaceBtn'), async function () {
        blurActiveTextarea();
        await saveMySpace(rampadState);
    });
}

// 수정 모드
function initEditMode() {
    const articleId = document.getElementById('articleId').value;
    const articleTempState = { tempId: null, lastSnapshot: null };

    bindEditorExitUnlock();

    // 사이드바 링크 클릭해서 화면이탈하는 경우 기사 unlock

    // 기사 상세 데이터 로드 후 → 컬러픽커 초기화
    bindArticleDetailData().then((canAccess) => {
        if (!canAccess) {
            return;
        }

        // 제목 색상 컬러픽커 세팅
        initArticleTitleColorPicker();
        // 제목, 부제목 단락 높이 세팅
        initAutoResizeTextArea();
        // 메모, 비교 이벤트
        initOffCanvasEvent();
        // 선택된 관련 종목 삭제 이벤트
        initRelatedKrxSelection();
        // 선택된 관련 기사 삭제 이벤트
        initRelatedArticleSelection();

        showArticlePreviewBeforeSave();
        startArticleTempAutoSaveInterval(articleId, articleTempState);
        void checkAndPromptLoadArticleTemp(articleId, articleTempState);

        // 업데이트 저장
        bindAsyncClickWithLock(document.querySelectorAll('.updateArticleBtn'), async function () {
            blurActiveTextarea();
            await updateArticle();
        });

        bindActionBtnClickEventInEditor();
    });
}


// 자동저장 이어쓰기 모드
function initAutosaveContinueMode() {
    const rampadId = document.getElementById('rampadId').value;
    const rampadState = { rampadId: rampadId };

    // 제목 색상 컬러픽커 세팅
    initArticleTitleColorPicker();

    // 제목, 부제목 단락 높이 세팅
    initAutoResizeTextArea();

    // 자동저장 내용 로드
    void loadRampad(rampadId);

    // 자동저장 기능
    startAutoSaveInterval(null, rampadState);

    // 미리보기
    showArticlePreviewBeforeSave();

    // 자동 해시태그
    bindAutoHashtagDebounce();

    // 본인 바이라인 로드
    const userId = document.getElementById("loginUserId").value;
    const userByline = document.getElementById("loginUserByline").value;
    const userName = document.getElementById("loginUserName").textContent;
    const alertContainer = document.getElementById('liveAlertPlaceholder');
    void addBylineUserBlock(userId, userName, alertContainer, userByline); // 본인 바이라인 로딩

    // depth1,2,3 옵션 로드
    document.querySelectorAll('.category-selector-box').forEach(box => {
        initCategoryOptions(box);
    });

    // 저장
    bindAsyncClickWithLock(document.getElementById('saveArticleBtn'), async function () {
        blurActiveTextarea();
        await saveArticle(rampadState);
    });

    // 저장
    bindAsyncClickWithLock(document.getElementById('saveMyspaceBtn'), async function () {
        blurActiveTextarea();
        await saveMySpace(rampadState);
    });
}

function initMyspaceContinueMode() {
    const articleId = document.getElementById('articleId').value;
    const articleTempState = { tempId: null, lastSnapshot: null };

    // Myspace 데이터 로드
    bindMyspaceDetailData().then(() => {
        // 제목, 부제목 단락 높이 세팅
        initAutoResizeTextArea();
        // 제목 색상 컬러픽커 세팅
        initArticleTitleColorPicker();

        showArticlePreviewBeforeSave();

        // 자동 해시태그
        bindAutoHashtagDebounce();
        startArticleTempAutoSaveInterval(articleId, articleTempState);
        void checkAndPromptLoadArticleTemp(articleId, articleTempState);
    });

    // 본인 바이라인 로드
    const userId = document.getElementById("loginUserId").value;
    const userByline = document.getElementById("loginUserByline").value;
    const userName = document.getElementById("loginUserName").textContent;
    const alertContainer = document.getElementById('liveAlertPlaceholder');
    void addBylineUserBlock(userId, userName, alertContainer, userByline); // 본인 바이라인 로딩

    // depth1,2,3 옵션 로드
    document.querySelectorAll('.category-selector-box').forEach(box => {
        initCategoryOptions(box);
    });

    // 마이스페이스 기사 -> 작성완료 상태 기사로 저장
    bindAsyncClickWithLock(document.querySelectorAll('.updateArticleBtn'), async function () {
        blurActiveTextarea();
        await updateArticleInMySpaceContinue("WRITING_DONE");
    });
    // 마이스페이스 기사 -> 마이스페이스 기사로 저장
    bindAsyncClickWithLock(document.querySelector('.updateMyspaceBtn'), async function () {
        blurActiveTextarea();
        await updateArticleInMySpaceContinue("MY_SPACE");
    });
}

// 수정 페이지에서 사이드바 클릭해서 페이지 나갈때 기사 수정중 상태 해제
function bindSidebarLeaveAlert() {
    return;

    const links = document.querySelectorAll('.leftside-menu .side-nav a[href]');
    const resolveTargetUrl = (linkEl) => {
        const rawHref = linkEl.getAttribute('href')?.trim();
        if (!rawHref || rawHref === '#') return null;
        if (!rawHref.startsWith('#')) return rawHref;

        const collapseEl = document.querySelector(rawHref);
        const firstSubLink = collapseEl?.querySelector('ul.side-nav-second-level a[href]:not([href^="#"])');
        return firstSubLink?.getAttribute('href') ?? null;
    };

    links.forEach(a => {
        a.addEventListener('click', function (e) {
            const targetUrl = resolveTargetUrl(this);
            if (!targetUrl) return;

            const ok = confirm('페이지에서 나가시겠습니까?\n변경사항이 저장되지 않을 수 있습니다.');

            if (!ok) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                return;
            }

            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();

            const articleId = document.getElementById('articleId')?.value;
            const move = () => {
                window.location.href = targetUrl;
            };

            if (!articleId) {
                move();
                return;
            }

            postWithCsrf(`/api/articles/${articleId}/unlock`)
                .catch(() => {
                    // 에러 무시
                })
                .finally(move);
        }, true); // 캡처링으로 먼저 잡기
    });
}





