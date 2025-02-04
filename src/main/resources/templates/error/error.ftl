<#import "/spring.ftl" as spring/>
<!DOCTYPE html>
<html lang="ko">
    <head>
        <#include "/_include/tag_head.ftl">
    </head>
<body>
    <#include "/_include/header.ftl">
    <!-- Page content -->
    <div class="page-content">
        <!-- Main content -->
        <div class="content-wrapper">
            <!-- Page header -->
            <#--  <div class="page-header page-header-light">
                <div class="breadcrumb-line breadcrumb-line-light header-elements-lg-inline">
                    <div class="d-flex">
                        <div class="breadcrumb">
                            <a href="/datacenter" class="breadcrumb-item"><i class="icon-home2 mr-2"></i> Data Center</a>
                        </div>
                        <a href="#" class="header-elements-toggle text-body d-lg-none"><i class="icon-more"></i></a>
                    </div>
                </div>
            </div>  -->
            <!-- /Page header -->
            <!-- Inner content -->
            <div class="content-inner">
                <div class="content d-flex justify-content-center align-items-center">
                    <div class="flex-fill">
                        <div class="text-center">
                            <h1 class="error-title"><#if status??>${status}</#if></h1>
                            <h5 class="pt-3"><@spring.message "error.http."+status!'default'/></h5>
                        </div>
                        <div class="col-xl-4 offset-xl-4 col-md-8 offset-md-2">
                            <!-- Buttons -->
                            <div class="col-sm">
                                <a href="javascript:history.go(-1);" class="btn btn-primary btn-block"><i class="icon-arrow-left8 mr-2"></i> BACK</a>
                            </div>
                            <!-- /buttons -->
                        </div>
                    </div>
                </div>
                <!-- /content area -->
                <#include "/_include/footer.ftl">
            </div>
            <!-- /inner content -->
        </div>
        <!-- /main content -->
    </div>
</body>
</html>