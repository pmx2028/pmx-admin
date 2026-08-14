/**
* Theme: Jidox - Responsive Bootstrap 5 Admin Dashboard
* Author: Coderthemes
* Module/App: Main Js
*/


(function ($) {

    'use strict';

    // Bootstrap Components
    function initComponents() {

        // loader - Preloader
        $(window).on('load', function () {
            $('#status').fadeOut();
            $('#preloader').delay(350).fadeOut('slow');
        });

        // Popovers
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
        const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

        // Tooltips
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

        // offcanvas
        const offcanvasElementList = document.querySelectorAll('.offcanvas')
        const offcanvasList = [...offcanvasElementList].map(offcanvasEl => new bootstrap.Offcanvas(offcanvasEl))

        //Toasts
        var toastPlacement = document.getElementById("toastPlacement");
        if (toastPlacement) {
            document.getElementById("selectToastPlacement").addEventListener("change", function () {
                if (!toastPlacement.dataset.originalClass) {
                    toastPlacement.dataset.originalClass = toastPlacement.className;
                }
                toastPlacement.className = toastPlacement.dataset.originalClass + " " + this.value;
            });
        }

        var toastElList = [].slice.call(document.querySelectorAll('.toast'))
        var toastList = toastElList.map(function (toastEl) {
            return new bootstrap.Toast(toastEl)
        })

        // Bootstrap Alert Live Example
        const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
        const alert = (message, type) => {
            const wrapper = document.createElement('div')
            wrapper.innerHTML = [
                `<div class="alert alert-${type} alert-dismissible" role="alert">`,
                `   <div>${message}</div>`,
                '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
                '</div>'
            ].join('')

            alertPlaceholder.append(wrapper)
        }

        const alertTrigger = document.getElementById('liveAlertBtn')
        if (alertTrigger) {
            alertTrigger.addEventListener('click', () => {
                alert('Nice, you triggered this alert message!', 'success')
            })
        }

        // RTL Layout
        if (document.getElementById('app-style').href.includes('rtl.min.css')) {
            document.getElementsByTagName('html')[0].dir = "rtl";
        }
    }

    // Portlet Widget (Card Reload, Collapse, and Delete)
    function initPortletCard() {

        var portletIdentifier = ".card"
        var portletCloser = '.card a[data-bs-toggle="remove"]'
        var portletRefresher = '.card a[data-bs-toggle="reload"]'
        let self = this

        // Panel closest
        $(document).on("click", portletCloser, function (ev) {
            ev.preventDefault();
            var $portlet = $(this).closest(portletIdentifier);
            var $portlet_parent = $portlet.parent();
            $portlet.remove();
            if ($portlet_parent.children().length == 0) {
                $portlet_parent.remove();
            }
        });

        // Panel Reload
        $(document).on("click", portletRefresher, function (ev) {
            ev.preventDefault();
            var $portlet = $(this).closest(portletIdentifier);
            // This is just a simulation, nothing is going to be reloaded
            $portlet.append('<div class="card-disabled"><div class="card-portlets-loader"></div></div>');
            var $pd = $portlet.find('.card-disabled');
            setTimeout(function () {
                $pd.fadeOut('fast', function () {
                    $pd.remove();
                });
            }, 500 + 300 * (Math.random() * 5));
        });
    }

    //  Multi Dropdown
    function initMultiDropdown() {
        $('.dropdown-menu a.dropdown-toggle').on('click', function () {
            var dropdown = $(this).next('.dropdown-menu');
            var otherDropdown = $(this).parent().parent().find('.dropdown-menu').not(dropdown);
            otherDropdown.removeClass('show')
            otherDropdown.parent().find('.dropdown-toggle').removeClass('show')
            return false;
        });
    }

    // Left Sidebar Menu (Vertical Menu)
    function initLeftSidebar() {
        var self = this;

        if ($(".side-nav").length) {
            var navCollapse = $('.side-nav li .collapse');
            var navToggle = $(".side-nav li [data-bs-toggle='collapse']");
            navToggle.on('click', function (e) {
                return false;
            });

            // open one menu at a time only
            navCollapse.on({
                'show.bs.collapse': function (event) {
                    var parent = $(event.target).parents('.collapse.show');
                    $('.side-nav .collapse.show').not(event.target).not(parent).collapse('hide');
                }
            });

            // activate the menu in left side bar (Vertical Menu) based on url
            $(".side-nav a").each(function () {
                var pageUrl = window.location.href.split(/[?#]/)[0];
                if (this.href == pageUrl) {
                    $(this).addClass("active");
                    $(this).parent().addClass("menuitem-active");
                    $(this).parent().parent().parent().addClass("show");
                    $(this).parent().parent().parent().parent().addClass("menuitem-active"); // add active to li of the current link

                    var firstLevelParent = $(this).parent().parent().parent().parent().parent().parent();
                    if (firstLevelParent.attr('id') !== 'sidebar-menu') firstLevelParent.addClass("show");

                    $(this).parent().parent().parent().parent().parent().parent().parent().addClass("menuitem-active");

                    var secondLevelParent = $(this).parent().parent().parent().parent().parent().parent().parent().parent().parent();
                    if (secondLevelParent.attr('id') !== 'wrapper') secondLevelParent.addClass("show");

                    var upperLevelParent = $(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent();
                    if (!upperLevelParent.is('body')) upperLevelParent.addClass("menuitem-active");
                }
            });


            setTimeout(function () {
                var activatedItem = document.querySelector('li.menuitem-active .active');
                if (activatedItem != null) {
                    var simplebarContent = document.querySelector('.leftside-menu .simplebar-content-wrapper');
                    var offset = activatedItem.offsetTop - 300;
                    if (simplebarContent && offset > 100) {
                        scrollTo(simplebarContent, offset, 600);
                    }
                }
            }, 200);

            // scrollTo (Left Side Bar Active Menu)
            function easeInOutQuad(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            }
            function scrollTo(element, to, duration) {
                var start = element.scrollTop, change = to - start, currentTime = 0, increment = 20;
                var animateScroll = function () {
                    currentTime += increment;
                    var val = easeInOutQuad(currentTime, start, change, duration);
                    element.scrollTop = val;
                    if (currentTime < duration) {
                        setTimeout(animateScroll, increment);
                    }
                };
                animateScroll();
            }
        }
    }

    // Topbar Menu (HOrizontal Menu)
    function initTopbarMenu() {
        if ($('.navbar-nav').length) {
            $('.navbar-nav li a').each(function () {
                var pageUrl = window.location.href.split(/[?#]/)[0];
                if (this.href == pageUrl) {
                    $(this).addClass('active');
                    $(this).parent().parent().addClass('active'); // add active to li of the current link
                    $(this).parent().parent().parent().parent().addClass('active');
                    $(this).parent().parent().parent().parent().parent().parent().addClass('active');
                }
            });

            // Topbar - main menu
            $('.navbar-toggle').on('click', function () {
                $(this).toggleClass('open');
                $('#navigation').slideToggle(400);
            });
        }
    }

    // Topbar Search Form
    function initSearch() {
        // Serach Toggle
        var navDropdowns = $('.navbar-custom .dropdown:not(.app-search)');

        // hide on other click
        $(document).on('click', function (e) {
            if (e.target.id == "top-search" || e.target.closest('#search-dropdown')) {
                $('#search-dropdown').addClass('show');
            } else {
                $('#search-dropdown').removeClass('show');
            }
            return true;
        });

        // Serach Toggle
        $('#top-search').on('focus', function (e) {
            e.preventDefault();
            navDropdowns.children('.dropdown-menu.show').removeClass('show');
            $('#search-dropdown').addClass('show');
            return false;
        });

        // hide search on opening other dropdown
        navDropdowns.on('show.bs.dropdown', function () {
            $('#search-dropdown').removeClass('show');
        });
    }

    // Topbar Fullscreen Button
    function initfullScreenListener() {
        var self = this;
        var fullScreenBtn = document.querySelector('[data-toggle="fullscreen"]');

        if (fullScreenBtn) {
            fullScreenBtn.addEventListener('click', function (e) {
                e.preventDefault();
                document.body.classList.toggle('fullscreen-enable')
                if (!document.fullscreenElement && /* alternative standard method */ !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
                    if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen();
                    } else if (document.documentElement.mozRequestFullScreen) {
                        document.documentElement.mozRequestFullScreen();
                    } else if (document.documentElement.webkitRequestFullscreen) {
                        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                    }
                } else {
                    if (document.cancelFullScreen) {
                        document.cancelFullScreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    }
                }
            });
        }
    }

    // Show/Hide Password
    function initShowHidePassword() {
        $("[data-password]").on('click', function () {
            if ($(this).attr('data-password') == "false") {
                $(this).siblings("input").attr("type", "text");
                $(this).attr('data-password', 'true');
                $(this).addClass("show-password");
            } else {
                $(this).siblings("input").attr("type", "password");
                $(this).attr('data-password', 'false');
                $(this).removeClass("show-password");
            }
        });
    }

    // Form Validation
    function initFormValidation() {
        // Example starter JavaScript for disabling form submissions if there are invalid fields
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        // Loop over them and prevent submission
        document.querySelectorAll('.needs-validation').forEach(form => {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
    }

    // Form Advance
    function initFormAdvance() {
        // Select2
        if (jQuery().select2) {
            $('[data-toggle="select2"]').select2();
        }

        // Input Mask
        if (jQuery().mask) {
            $('[data-toggle="input-mask"]').each(function (idx, obj) {
                var maskFormat = $(obj).data("maskFormat");
                var reverse = $(obj).data("reverse");
                if (reverse != null)
                    $(obj).mask(maskFormat, { 'reverse': reverse });
                else
                    $(obj).mask(maskFormat);
            });
        }

        // Bootstrap Touchspin
        if (jQuery().TouchSpin) {
            var defaultOptions = {

            };

            $('[data-toggle="touchspin"]').each(function (idx, obj) {
                var objOptions = $.extend({}, defaultOptions, $(obj).data());
                $(obj).TouchSpin(objOptions);
            });
        }

        // Bootstrap Maxlength
        if (jQuery().maxlength) {
            var defaultOptions = {
                warningClass: "badge bg-success",
                limitReachedClass: "badge bg-danger",
                separator: ' out of ',
                preText: 'You typed ',
                postText: ' chars available.',
                placement: 'bottom',
            };

            $('[data-toggle="maxlength"]').each(function (idx, obj) {
                var objOptions = $.extend({}, defaultOptions, $(obj).data());
                $(obj).maxlength(objOptions);
            });
        }
    }

    function init() {
        initComponents();
        initPortletCard();
        initMultiDropdown();
        initLeftSidebar()
        initTopbarMenu();
        initSearch();
        initfullScreenListener();
        initShowHidePassword();
        initFormValidation();
        initFormAdvance();
    }

    init();

})(jQuery)

class LayoutAdjuster {
    // 자바스크립트 클래스 생성자 함수: 인스턴스의 초기 상태 설정
    constructor() {
        this.html = document.getElementsByTagName('html')[0]; // 문서의 첫 번째 <html> 태그 가져오기
        this.config = {}; // 설정 객체 초기화
        this.html.classList.add('no-transition'); // 초기 로딩 시 트랜지션 비활성화 클래스
    }

    // 초기 설정 메서드
    initConfig() {
        const runtimeConfig = window.config || window.defaultConfig || {};
        const preferredSidenavSize =
            runtimeConfig.sidenav?.size ||
            this.html.getAttribute('data-sidenav-size') ||
            'default';

        // HTML 속성에서 초기값 로드
        this.config = {            
            sidenav: {
                size: preferredSidenavSize
            },
            layout: {
                mode: this.html.getAttribute('data-layout-mode') || 'fluid',
                position: this.html.getAttribute('data-layout-position') || 'fixed' // 레이아웃 위치 추가
            },
            theme: this.html.getAttribute('data-bs-theme') || 'light',
            menu: {
                color: this.html.getAttribute('data-menu-color') || 'dark'
            },
            topbar: {
                color: this.html.getAttribute('data-topbar-color') || 'dark'
            }
        };

        // Local Storage에서 저장된 테마를 로드 - HTML 속성보다 우선
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.config.theme = savedTheme;
        }

        // 로드된 테마를 HTML에 즉시 적용
        this.html.setAttribute('data-bs-theme', this.config.theme);

        // 개발 중 디버깅을 위해 초기 설정값 확인
        console.log("[initConfig] 초기 설정값:", this.config);
    }

    // 사이드바 크기 변경 함수
    changeLeftbarSize(size, save = true) {
        // <html> 태그의 'data-sidenav-size' 속성 값을 확인
        const currentDisplayedSize = this.html.getAttribute('data-sidenav-size');
        
        // 현재 표시된 크기가 새로 설정하려는 'size'와 동일하다면, 불필요한 DOM 조작을 막기 위해 함수 실행을 중단
        if (currentDisplayedSize === size) {
            console.log(`[changeLeftbarSize] Leftbar size is already ${size}. No change needed.`);
            return;
        }

        // HTML 속성 업데이트
        this.html.setAttribute('data-sidenav-size', size);

        // 설정 객체에 변경된 사이드바 크기를 저장
        if (save) {
            this.config.sidenav.size = size;
        }
        console.log(`[changeLeftbarSize] Leftbar size successfully changed to: ${size}`);
    }

    // 레이아웃 모드 변경 함수
    changeLayoutMode(mode, save = true) {
        // <html> 태그의 'data-layout-mode' 속성 값을 확인
        const currentDisplayedMode = this.html.getAttribute('data-layout-mode');

        if (currentDisplayedMode === mode) {
            console.log(`[changeLayoutMode] Layout mode is already ${mode}. No change needed.`);
            return;
        }

        // HTML 속성 업데이트
        this.html.setAttribute('data-layout-mode', mode);

        // 설정 객체에 변경된 레이아웃 모드를 저장
        if (save) { 
            this.config.layout.mode = mode;
        }
        console.log(`[changeLayoutMode] Layout mode successfully changed to: ${mode}`);
    }

    // 테마 색상 변경 함수
    changeLayoutColor(color) {
        // 현재 HTML의 'data-bs-theme' 속성 값을 확인
        const currentTheme = this.html.getAttribute('data-bs-theme');

        // 현재 테마와 변경하려는 테마가 동일하다면, 함수 실행 중단
        if (currentTheme === color) {
            console.log(`[changeLayoutColor] Layout mode is already ${color}. No change needed.`);
            return;
        }

        // HTML 속성 업데이트
        this.html.setAttribute('data-bs-theme', color);
        
        // 설정 객체 업데이트
        this.config.theme = color;
        // 테마를 로컬 스토리지에 저장
        localStorage.setItem('theme', color);
        // console.log(`[changeLayoutColor] Layout mode is already ${color}. change to.`);
        console.log(`[changeLayoutColor] Layout mode changed to ${color}.`);
    }

    // 창 크기 변경 이벤트를 초기화하고 디바운싱(debouncing)을 적용
    initWindowSize() {
        var self = this;
        let resizeTimer;

        window.addEventListener('resize', function (e) {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                self._adjustLayout(); // 200ms 동안 'resize' 이벤트가 발생하지 않으면 '_adjustLayout' 함수를 실행
            }, 200);
        });
    }

    // 뷰포트 크기에 따라 레이아웃을 조정하는 함수
    _adjustLayout() {
        var self = this;
        const isMobileViewport = window.innerWidth <= 768;
        const isTabletViewport = window.innerWidth > 768 && window.innerWidth <= 1440;
        const preferredSidenavSize = self.config.sidenav.size;

        if (!isMobileViewport) {
            self.html.classList.remove('sidebar-enable');
            self.hideBackdrop();
        }

        if (isMobileViewport) { // 모바일 (768px )
            self.changeLeftbarSize('full', false);
        } else if (isTabletViewport) { // 태블릿 & FHD
            // 태블릿 구간에서는 모바일용 full 숨김 상태를 유지하지 않고 요약형으로 복귀
            if (preferredSidenavSize !== 'full' && preferredSidenavSize !== 'fullscreen') {
                if (preferredSidenavSize === 'sm-hover') {
                    self.changeLeftbarSize('condensed'); // 애니메이션 적용될 수 있음
                } else {
                    self.changeLeftbarSize('condensed', false); // 애니메이션 없이 condensed
                }
            } else {
                self.changeLeftbarSize('condensed', false);
            }
        } else { // PC (화면 너비가 1369px 초과일 때)
            if (preferredSidenavSize === 'full') {
                self.changeLeftbarSize('default', false);
            } else {
                self.changeLeftbarSize(preferredSidenavSize);
            }
            self.changeLayoutMode(self.config.layout.mode);
        }

        // 레이아웃 변경 후 SimpleBar 인스턴스를 찾아서 재계산 호출
        setTimeout(function() {
            var simpleBarElements = document.querySelectorAll('[data-simplebar]');
            simpleBarElements.forEach(function(el) {
                var instance = SimpleBar.instances.get(el);
                if (instance) {
                    instance.recalculate();
                }
            });
        }, 500);
    }


    // 라이트/다크 모드 버튼 클릭 이벤트 리스너 추가
    initThemeToggleListener() {
        var self = this;
        var themeColorToggle = document.getElementById('light-dark-mode');
        if (themeColorToggle) {
            themeColorToggle.addEventListener('click', function (e) {
                // 현재 config에 저장된 테마를 기준으로 전환
                if (self.config.theme === 'light') {
                    self.changeLayoutColor('dark');
                } else {
                    self.changeLayoutColor('light');
                }
            });
        }
    }

    //모바일 메뉴 토글 버튼 클릭 이벤트 리스너 추가
    initMobileMenuToggleListener() {
        const self = this;

        const menuToggleBtn = document.querySelector('.button-toggle-menu');
        if (menuToggleBtn) {
            menuToggleBtn.addEventListener('click', function () {
                const currentSize = self.html.getAttribute('data-sidenav-size');
                const configSize = self.config.sidenav.size;

                if (currentSize === 'full') {
                    self.showBackdrop();
                } else {
                    if (configSize === 'fullscreen') {
                        self.changeLeftbarSize(currentSize === 'fullscreen' ? 'default' : 'fullscreen', false);
                    } else {
                        self.changeLeftbarSize(currentSize === 'condensed' ? 'default' : 'condensed', false);
                    }
                }

                self.html.classList.toggle('sidebar-enable');
            });
        }

        const menuCloseBtn = document.querySelector('.button-close-fullsidebar');
        if (menuCloseBtn) {
            menuCloseBtn.addEventListener('click', function () {
                self.html.classList.remove('sidebar-enable');
                self.hideBackdrop();
            });
        }
    }

    showBackdrop() {
        const backdrop = document.createElement('div');
        backdrop.id = 'custom-backdrop';
        backdrop.className = 'offcanvas-backdrop fade show';
        document.body.appendChild(backdrop);
        document.body.style.overflow = "hidden";
        if (window.innerWidth > 767) {
            document.body.style.paddingRight = "15px";
        }

        const self = this;
        backdrop.addEventListener('click', function () {
            self.html.classList.remove('sidebar-enable');
            self.hideBackdrop();
        });
    }

    hideBackdrop() {
        const backdrop = document.getElementById('custom-backdrop');
        if (backdrop) {
            document.body.removeChild(backdrop);
            document.body.style.overflow = null;
            document.body.style.paddingRight = null;
        }
    }

    // 클래스 초기화 메서드
    init() {
        this.initConfig();      // 설정 객체 초기화
        this.initWindowSize();  // 리사이즈 이벤트 리스너를 초기화하고 디바운싱
        this.initThemeToggleListener(); // 테마 토글 버튼 이벤트 리스너 설정
        this.initMobileMenuToggleListener(); // 모바일 메뉴 이벤트 초기화
        this._adjustLayout();   // 페이지 초기 로딩 시 레이아웃을 조정

        // 모든 초기 레이아웃 조정이 끝난 후, 200ms 딜레이 후 트랜지션 클래스 제거
        setTimeout(() => {
            this.html.classList.remove('no-transition');
        }, 200); 
    }
}

// LayoutAdjuster 클래스의 인스턴스를 생성하고 초기화 메서드를 호출 기능 시작
new LayoutAdjuster().init();
