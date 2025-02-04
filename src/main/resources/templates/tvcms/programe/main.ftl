<#import "/spring.ftl" as spring/>
<!DOCTYPE html>
<html lang="ko">
	<head>
	    <#include "/_include/tag_head.ftl">
        <script src="/static/js/pages/tvcms/program/main.js"></script>
	</head>
	<body>
        <#include "/_include/header.ftl">
        <#assign pageParam = "">
        <#if searchRequest??>
            <#list searchRequest as key, value>
                <#if value??>
                    <#if key?index = 0>
                        <#assign pageParam = pageParam+key+"="+value />
                    <#else>
                        <#assign pageParam = pageParam+"&"+key+"="+value />
                    </#if>
                <#else>
                </#if>
            </#list>
        </#if>
        <!-- Page content -->
        <div class="page-content">
            <#include "/_include/schedule/sidebar.ftl">
            <!-- Main content -->
            <div class="content-wrapper">
                <!-- Page header -->
                <div class="page-header page-header-light">
                    <div class="breadcrumb-line breadcrumb-line-light header-elements-lg-inline">
						<div class="d-flex">
							<div class="breadcrumb">
								<a href="/" class="breadcrumb-item"><i class="icon-home2 mr-2"></i> 편성표</a>
                                <span class="breadcrumb-item">프로그램 관리</span>
							</div>
						</div>
					</div>
                </div>

                <!-- Inner content -->
                <div class="content-inner">
                    <div class="content">
                        <div class="card mb-2">
                            <form name="search_form" id="search_form">
                                <input type="hidden" name="pageUrl" id="pageUrl" value="${pageUrl}">
                                <#-- 검색 정렬값 -->
                                <#if RequestParameters.order?has_content>
                                    <#assign order = RequestParameters.order />
                                <#else>
                                    <#assign order = "SEQ" />
                                </#if>
                                <#-- /검색 정렬값 -->
                                <input type="hidden" name="order" id="order" value="${order}">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <div class="row">
                                                <div class="col-sm-2">
                                                    <div class="row">                  
                                                        <!-- 등록 -->
                                                        <div class="breadcrumb ml-2">
                                                            <a href="/tvcms/tvPrograms/form" class="btn bg-primary btn-sm ">
                                                                <i class="icon-pen-plus mr-1"></i>프로그램 등록
                                                            </a>
                                                        </div>
                                                        <!-- /등록 -->                              

                                                    </div>
                                                </div>
                                    
                                                <div class="col-sm-10">                                                                                             
                                                    <div class="col-sm-6 col-fl-r">
                                                        <div class="row">
                                                            <div class="input-group">
                                                                <input type="text" name="NAME_LIKE" id="NAME_LIKE" class="form-control form-control-sm corp-search" placeholder="프로그램 제목으로 검색" autocomplete="off" value="${RequestParameters.NAME_LIKE!''}">
                                                                <input type="hidden" name="" value="">  
                                                                <button type="button" class="btn bg-success-400 font-size-xs action-search mr-1">
                                                                    <i class="icon-search4"></i> <span>검색</span>
                                                                </button>
                                                                <button type="button" class="btn bg-grey-400 font-size-xs action-reset">
                                                                    <i class="icon-reset"></i> <span>초기화</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>  
                                                </div>                        

                                            </div>
                                        </div>          
                                    </div>
                                </div>
                            </form>
                        </div>

                        <!-- /search area -->
                        <div class="card mb-2">
                            <!-- timetable list -->
                            <div class="timetable-lab">
                                <table class="timetable table-hover">
                                    <colgroup>
                                        <col style="width:8%">                                            
                                        <col style="width:25%">                                            
                                        <col style="width:15%">
                                        <col style="width:8%">
                                        <col style="width:8%">
                                        <col style="width:8%">
                                        <col style="width:8%">
                                        <col style="width:10%">
                                        <col style="width:20%">
                                        <col style="width:10%">
                                    </colgroup>
                                    <thead>
                                        <tr>                 
                                            <th>No.</th>                                               
                                            <th>프로그램명</th>
                                                <th>타이틀 이미지</th>
                                            <th>주요 여부</th>                                               
                                            <th>순서</th>
                                            <th>노출여부</th>
                                            <th>방송중</th>
                                            <th>시청등급</th>
                                            <th>등록/수정일</th>
                                            <th>작업</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <#if tvProgramsList.iterator()?? && tvProgramsList.totalElements != 0>
                                            <#list tvProgramsList.iterator() as list>
                                                <tr>
                                                    <td>${tvProgramsList.totalElements - tvProgramsList.number * tvProgramsList.size - list?index}</td>
                                                    <td class="tleft"><a id="block${list.id?c}" href="/tvcms/tvPrograms/form?paramId=${list.id?c}<#if pageParam != "" >&${pageParam!''}</#if>" tabindex="0">${list.programName}</a></td>
                                                    <td>
                                                        <a href="#" tabindex="0">
                                                        <span class="img"><img src="${list.fileUrl!'-'}" width="80"></span>
                                                        </a>
                                                    </td>
                                                    <td><i class="icon-circle2 text-primary">${list.majorFlag!'-'}</td>
                                                    <td>${list.seq!'0'}</td>                                                
                                                    <td>${list.viewFlagNm}</td>
                                                    <td>${list.broadFlagNm}</td>
                                                    <td>${list.programLevelNm}</td>
                                                    <td>${list.veiwdateAt}</td>
                                                    <td>
                                                        <#if adminAuth_String?index_of("ROLE_SUPER_ADMIN") != -1 || adminAuth_String?index_of("ROLE_DC_ADMIN") != -1>
                                                            <a id="block${list.id?c}" href="/tvcms/tvPrograms/form?paramId=${list.id?c}<#if pageParam != "" >&${pageParam!''}</#if>" class="btn btn-outline-success badge action-form">수정</a>
                                                        <#else>
                                                            <a id="block${list.id?c}" href="/tvcms/tvPrograms/form?paramId=${list.id?c}<#if pageParam != "" >&${pageParam!''}</#if>" class="btn btn-outline-success badge show-btn">보기</a>
                                                        </#if>
                                                        <!--a href="#" class="btn btn-outline-success badge action-form" data-programid="${list.id?c}">수정</a-->
                                                    </td>
                                                </tr>   
                                            </#list>
                                        <#else>
                                            <tr>
                                                <td colspan="9" class="td-no-data-height-100"> 등록된 정보가 없습니다. </td>
                                            </tr>
                                        </#if>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <!-- pagenation area -->
                        <div class="card mb-0">
                            <div class="table-responsive">
                                <table class="table">
                                    <tbody>
                                        <tr>
                                            <#--  <td>
                                                <div class="header-elements" title="excel download">
                                                    <button data-url="/setting/corpGroup/excel?${pageParam}" class="btn bg-success-800 btn-sm excel_export">
                                                        <i class="icon-file-excel mr-1"></i>EXCEL
                                                    </button>
                                                </div>
                                            </td>  -->
                                            <td>
                                                <#include "/_include/pagination.ftl">
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <!-- /pagenation area -->
                    </div>
                    <!-- /content area -->
                <#include "/_include/footer.ftl">
                </div>
			    <!-- /inner content -->
            </div>
            <!-- /main content -->

        </div>
        <!-- /page content -->
        <#include "formModal.ftl">
        <!--loading-->
        <div class="blurBackground">
            <div class="loading-circle">
                <i class="icon-spinner2 spinner"></i>
            </div>
            <div class="loding-text">
                다운로드 중입니다. 잠시만 기다려 주세요.
            </div>
        </div>
        <!--loading-->
    </body>
</html>