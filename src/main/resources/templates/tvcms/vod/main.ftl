<#import "/spring.ftl" as spring/>
<!DOCTYPE html>
<html lang="ko">
	<head>
        <#include "/_include/tag_head.ftl">
        <script src="/static/js/pages/tvcms/vod/main.js"></script>
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
                                <span class="breadcrumb-item">VOD 관리</span>
							</div>
						</div>
					</div>
                </div>

                <!-- Inner content -->
                <div class="content-inner">
                    <div class="content">
                        <!-- search area -->
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
                                                        <div class="breadcrumb justify-content-center ml-2">
                                                            <a href="/tvcms/tvVods/form" class="btn bg-primary btn-sm">
                                                                <i class="icon-pen-plus mr-1"></i>VOD 등록
                                                            </a>
                                                        </div>
                                                        <!-- /등록 -->      
                                                    </div>
                                                </div>
                                                <div class="col-sm-10">
                                                    <div class="col-sm-8 col-fl-r">
                                                        <div class="row">
                                                            <label class="col-sm-2 col-form-label pb-0 font-weight-bolder text-right"><i class="icon-arrow-right13"></i>검색대상 설정</label>                                                        
                                                            <div class="col-sm-3 px-0">
                                                                <select id="" name="searchTarget" class="form-control form-control-sm">
                                                                    <option value=""  <#if RequestParameters.searchTarget?? || RequestParameters.searchTarget!'' = ''?string> selected </#if>>- 선택 -</option>
                                                                    <option value="0" <#if RequestParameters.searchTarget?? && RequestParameters.searchTarget?string = '0'?string> selected </#if>>프로그램명 </option>
                                                                    <option value="1" <#if RequestParameters.searchTarget?? && RequestParameters.searchTarget?string = '1'?string> selected </#if>>VOD 제목 </option>
                                                                    <option value="2" <#if RequestParameters.searchTarget?? && RequestParameters.searchTarget?string = '2'?string> selected </#if>>관련 종목명 </option>
                                                                </select>
                                                            </div>
                        
                                                            <div class="col-sm-7 pr-0">
                                                                <div class="input-group">
                                                                    <input type="text" name="searchName" id="searchName" class="form-control form-control-sm" placeholder="검색어를 입력하세요" autocomplete="off" value="${RequestParameters.searchName!''}">
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
                                </div>
                            </form>
                        </div>
                        <!-- /search area -->
                        <div class="card mb-2">
                            <div class="timetable-lab">
                                <table class="timetable table-hover">
                                    <colgroup>
                                        <col style="width:8%">                                            
                                        <col style="width:20%">                                            
                                        <col style="width:20%">
                                        <col style="width:20%">
                                        <col style="width:8%">
                                        <col style="width:8%">
                                        <col style="width:8%">
                                        <col style="width:8%">
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th>No.</th>                                               
                                            <th>프로그램명</th>
                                            <th>VOD 제목</th>
                                            <th>관련종목</th>
                                            <th>썸네일</th>                                               
                                            <th>작성자</th>
                                            <th>등록/수정일</th>
                                            <th>작업</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <#if tvVodsList.iterator()?? && tvVodsList.totalElements != 0>
                                            <#list tvVodsList.iterator() as list>
                                                <tr>
                                                    <td>${tvVodsList.totalElements - tvVodsList.number * tvVodsList.size - list?index}</td>
                                                    <td class="tleft">${list.programName}</td>
                                                    <td class="tleft"><a id="block${list.id?c}" href="/tvcms/tvVods/form?vodId=${list.id?c}<#if pageParam != "" >&${pageParam!''}</#if>"  tabindex="0">${list.vodName}</a></td>
                                                    <td class="tleft">${list.krxeName}</td>
                                                    <td>
                                                        <a href="#" tabindex="0">
                                                            <span class="img"><img src="${list.fileUrl!'-'}" width="80"></span>
                                                        </a>
                                                    </td>
                                                    <td>${list.createdName}</td>
                                                    <td>${list.veiwdateAt}</td>
                                                    <td>
                                                        <#if adminAuth_String?index_of("ROLE_SUPER_ADMIN") != -1 || adminAuth_String?index_of("ROLE_DC_ADMIN") != -1>
                                                            <a id="block${list.id?c}" href="/tvcms/tvVods/form?vodId=${list.id?c}<#if pageParam != "" >&${pageParam!''}</#if>" class="btn btn-outline-success badge action-form modify-btn" data-vodid="${list.id?c}">수정</a>
                                                            <button class="btn btn-outline-danger badge destroy-btn" data-id="${list.id?c}">삭제</button>
                                                       <#else>
                                                           <a id="block${list.id?c}" href="/tvcms/tvVods/form?vodId=${list.id?c}<#if pageParam != "" >&${pageParam!''}</#if>" class="btn btn-outline-success badge action-form modify-btn" data-vodid="${list.id?c}">보기</a>
                                                       </#if>
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
                                            <td>
                                                <#--  <div class="header-elements" title="excel download">
                                                    <button data-url="/setting/corpGroup/excel?${pageParam}" class="btn bg-success-800 btn-sm excel_export">
                                                        <i class="icon-file-excel mr-1"></i>EXCEL
                                                    </button>
                                                </div>  -->
                                            </td>
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