<#import "/spring.ftl" as spring/>

<!DOCTYPE html>
<html lang="ko">
	<head>
		<title>DealSiteTV - CMS</title>
	    <#include "/_include/tag_head.ftl">
        <script src="/static/js/pages/auth/login.js"></script>
	</head>
	<body>

        <#include "/_include/header.ftl">

        <!-- Page content -->
        <div class="page-content">

            <!-- Main content -->
            <div class="content-wrapper">

                <!-- Content area -->
                <div class="content d-flex justify-content-center align-items-center pt-0">

                    <!-- Login card -->
                    <form name="loginForm" id="loginForm" class="login-form form-validate" onsubmit="return false;" method="post">
                        <div class="card mb-0">
                            <div class="card-body p-3">
                                <div class="text-center mb-1">
                                    <i class="icon-user-lock icon-2x text-slate-300 border-slate-300 border-3 rounded-round p-3 mt-3"></i>
                                    <h5 class="p-3">DealSiteTV CMS Login</h5>
                                </div>
                                <div class="form-group form-group-feedback form-group-feedback-left mt-2">
                                    <input type="text" class="form-control" name="login" id="login" placeholder="아이디" value="${saveid!''}" autocomplete="off" required>
                                    <div class="form-control-feedback">
                                        <i class="icon-user text-muted"></i>
                                    </div>
                                </div>

                                <div class="form-group form-group-feedback form-group-feedback-left">
                                    <input type="password" class="form-control" name="password" placeholder="비밀번호" autocomplete="off" required>
                                    <div class="form-control-feedback">
                                        <i class="icon-lock2 text-muted"></i>
                                    </div>
                                </div>

                                <div class="form-group d-flex align-items-center">
                                    <div class="form-check mb-0">
                                        <!--label class="form-check-label">
                                            <input type="checkbox" name="autologin" class="form-input-styled"${_isRememberMe?string(' checked', '')} data-fouc>
                                            자동로그인
                                        </label-->
                                    </div>
                                    <div class="form-check mb-0 ml-auto">
                                        <label class="form-check-label">
                                            <input type="checkbox" name="saveid" <#if saveid??> checked</#if> data-fouc>
                                            아이디저장
                                        </label>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <button type="submit" class="btn btn-primary btn-block">로그인</button>
                                </div>
                                <div class="form-group">
                                    <button type="button"  class="signup_btn">회원가입</button>
                                </div>

                            </div>
                        </div>
                    </form>
                    <!-- /login card -->
                </div>
                <!-- /content area -->
                <#include "/_include/footer.ftl">
            </div>
            <!-- /main content -->
        </div>
        <!-- /page content -->
    <#include "memberFormModal.ftl">
    </body>
</html>
