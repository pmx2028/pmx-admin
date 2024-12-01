<!-- Main navbar -->
<div class="navbar navbar-expand-lg navbar-dark navbar-static">
    <div class="d-flex flex-1 d-lg-none">
        <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbar-mobile">
            <i class="icon-paragraph-justify3"></i>
        </button>
    </div>

    <div class="navbar-brand text-center text-lg-left">
        <a href="/" class="d-inline-block" id="gnb_logo">
            <img src="https://dtd31o1ybbmk8.cloudfront.net/images/d_logo_white_573130.svg" alt="">
        </a>
    </div>

    <#if _isAuthenticated!false >
        <#assign adminAuth_String = "">
        <#if _user??>
            <#assign adminAuth_String>${_auth?join(", ")}</#assign>
        </#if>
    <div class="d-md-none">
        <button class="navbar-toggler sidebar-mobile-main-toggle" type="button">
            <i class="icon-paragraph-justify3"></i>
        </button>
    </div>

    <div class="collapse navbar-collapse" id="navbar-mobile">
        <ul class="navbar-nav">
            <li class="nav-item">
                <a href="#" class="navbar-nav-link sidebar-control sidebar-main-toggle d-none d-md-block">
                    <i class="icon-paragraph-justify3"></i>
                </a>
            </li>
        </ul>
        <ul class="navbar-nav navbar-nav-highlight">
            <li class="nav-item">
                <a href="/" class="navbar-nav-link text-nowrap ${_selfUri?starts_with('/')?string('active','')}">
                    <i class="icon-tv mr-2"></i> 
                    편성표
                </a>
            </li>

            <li class="nav-item mobile-mode">
                <a href="#" class="navbar-nav ml-md-auto navbar-nav-link text-nowrap navbar_logout"><i class="icon-switch2"></i> Logout</a>
                <form name="logoutForm" action="/logout" method="post"></form>
            </li>
            
            <#--  <#if adminAuth_String?index_of("ROLE_SUPER_ADMIN") != -1 || adminAuth_String?index_of("ROLE_DC_ADMIN") != -1>  -->
            <#if _user?? && _user.userId = "admin">
            <li class="nav-item pt-3">
                <a href="/buildSearchIndex/deals">[ reindex deals ]</a>
            </li>
            </#if>
        </ul>
        <ul class="ml-md-auto desktop-mode navbar-nav">
            <li class="nav-item dropdown dropdown-user0">
                <a href="#" class="navbar-nav-link d-flex align-items-center dropdown-toggle pr-0" data-toggle="dropdown" aria-expanded="false"> 
                    <i class="fas fa-user"></i>
                    <span class="align-middle ml-1">
                        <#if _user??>
                            ${_user.name!""} ${_user.title!""}
                        </#if>
                    </span>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                    <#--  <a href="#" class="dropdown-item"><i class="icon-user-plus"></i> My profile</a>
                    <a href="#" class="dropdown-item"><i class="icon-coins"></i> My balance</a>
                    <a href="#" class="dropdown-item"><i class="icon-comment-discussion"></i> Messages <span class="badge badge-pill bg-blue ml-auto">58</span></a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item"><i class="icon-cog5"></i> Account settings</a>  -->
                    <a href="#" class="dropdown-item navbar_logout"><i class="icon-switch2"></i> Logout</a>
                    <#--  <button class="dropdown-item btn btn-sm bg-teal-300 btn-labeled rounded-round navbar_logout"><i class="icon-switch2"></i> Logout</button>  -->
                    <form name="logoutForm" action="/logout" method="post"></form>
                </div>
            </li>
        </ul>
    </div>
    </#if>
</div>