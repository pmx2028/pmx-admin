<#import "/spring.ftl" as spring/>

<!DOCTYPE html>
<html lang="ko">
	<head>
	    <#include "/_include/tag_head.ftl">
        <link href="/static/css/schedule.css" rel="stylesheet" type="text/css">
        <script src="/static/js/pages/tvcms/schedule/search.js"></script>
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
                                <span class="breadcrumb-item">편성표 검색</span>
							</div>
						</div>
					</div>
                </div>
                <!-- /Page header -->
                
                <!-- Inner content -->
                <div class="content-inner">
                
                    <!-- Content area -->
                    <div class="content">
                     
                        <!-- search area -->
                        <div class="card mb-2">
                            <form name="search_form" id="search_form">
                                <input type="hidden" name="pageUrl" id="pageUrl" value="${pageUrl}">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-sm-12">
                                        <div class="row">
                                            <div class="col-sm-2">
                                                <div class="row">
                                                    <label class="col-form-label pb-0 col-sm-auto font-weight-bolder"><i class="icon-arrow-right13"></i>방송구분</label>
                                                    <!-- 방송구분 -->	
                                                    <div class="col-sm-7 p-0">
                                                        <select name="scheduleGubn" class="form-control form-control-sm">
                                                            <option value=""  <#if RequestParameters.scheduleGubn?? || RequestParameters.scheduleGubn!'' = ''?string> selected </#if>>- 선택 -</option>
                                                            <option value="1,2" <#if RequestParameters.scheduleGubn?? && RequestParameters.scheduleGubn?string = '1,2'?string> selected </#if>>본방송+생방송</option>
                                                            <option value="1" <#if RequestParameters.scheduleGubn?? && RequestParameters.scheduleGubn?string = '1'?string> selected </#if>>본방송</option>
                                                            <option value="2" <#if RequestParameters.scheduleGubn?? && RequestParameters.scheduleGubn?string = '2'?string> selected </#if>>생방송</option>
                                                            <option value="3" <#if RequestParameters.scheduleGubn?? && RequestParameters.scheduleGubn?string = '3'?string> selected </#if>>재방송</option>
                                                        </select>
                                                    </div>
                                                    <!-- /방송구분 -->
                                                </div>
                                            </div>
                                            <div class="col-sm-5">
                                                <div class="row">
                                                    <label class="col-sm-3 col-form-label pb-0 font-weight-bolder text-right"><i class="icon-arrow-right13"></i>기간설정</label>
                                                    <div class="col-sm-9 px-0">
                                                        <div class="row">
                                                            <div class="col-sm-5">
                                                                <input type="date" name="searchStartDt" max="2999-12-31" value="${RequestParameters.searchStartDt!''}" class="form-control form-control-sm">
                                                            </div>
                                                            <div class="mt-1 p-0 m-0"> ~ </div>
                                                            <div class="col-sm-5">
                                                                <input type="date" name="searchEndDt" max="2999-12-31" value="${RequestParameters.searchEndDt!''}" class="form-control form-control-sm">
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-sm-5 col-fl-r">
                                                <div class="row">
                                                    <label class="col-sm-3 col-form-label pb-0 font-weight-bolder text-right"><i class="icon-arrow-right13"></i>검색대상 설정</label>                                                        
                                                    <div class="col-sm-3 px-0">
                                                        <select id="" name="searchTarget" class="form-control form-control-sm">
                                                            <option value="" <#if RequestParameters.searchTarget?? || RequestParameters.searchTarget!'' = ''?string> selected </#if>>- 선택 -</option>
                                                            <option value="0" <#if RequestParameters.searchTarget?? && RequestParameters.searchTarget?string = '0'?string> selected </#if>> 프로그램명 </option>
                                                            <option value="1" <#if RequestParameters.searchTarget?? && RequestParameters.searchTarget?string = '1'?string> selected </#if>> 내용 </option>
                                                            <option value="9" <#if RequestParameters.searchTarget?? && RequestParameters.searchTarget?string = '9'?string> selected </#if>> 프로그램명 + 내용 </option>
                                                        </select>
                                                    </div>
                                                    <div class="col-sm-6">
                                                        <div class="input-group">
                                                            <input type="text" name="searchName" id="searchName" class="form-control form-control-sm" placeholder="검색어를 입력하세요" value="${RequestParameters.searchName!''}">
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
                                            
                        <!-- middle area -->
                        <div class="card mb-2">                           
                         
                            <!-- timetable list -->
                            <div class="timetable-lab">
                                <table class="timetable table-hover">
                                    <colgroup>
                                        <col style="width:12%">
                                        <col style="width:12%">
                                        <col style="width:24%">
                                        <col style="width:8%">
                                        <col style="width:10%">
                                        <col style="width:16%">
                                        <col style="width:8%">
                                        <col style="width:10%">
                                    </colgroup>
                                    <thead>
                                        <tr>                 
                                            <th>일자</th>
                                            <th>시간</th>
                                            <th>프로그램명</th>
                                            <th>회차</th>
                                            <th>시청등급</th>
                                            <th>방송구분</th>
                                            <th>노출여부</th>
                                            <th>등록/수정일</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    <#if tvSchedulesList.iterator()?? && tvSchedulesList.totalElements != 0>
                                        <#list tvSchedulesList.iterator() as list>
                                        <tr class="">
                                            <td>${list.scheduleDay!}</td>
                                            <td>${list.scheduleStTime!}</td>
                                            <td class="tleft"><a id="block${list.id?c}" href="/tvcms/schedule/schedule?scheduleId=${list.id?c}<#if pageParam != "" >&${pageParam!''}</#if>"  tabindex="0">${list.scheduleName!''}</a></td>
                                            <td>${list.scheduleSeq!}</td>
                                            <td>${list.scheduleLevelNm!}</td>
                                            <td>${list.scheduleGubnNm!}</td>
                                            <td>${list.viewFlagNm!}</td>
                                            <td>${list.veiwdateAt!}</td>
                                        </tr>
                                        </#list>
                                    <#else>
                                        <tr>
                                            <td colspan="8" class="td-no-data-height-100"> 등록된 정보가 없습니다. </td>
                                        </tr>
                                    </#if>
                                    </tbody>
                                </table>
                            </div>
                            <!-- /timetable list -->                               
                                                  
                        </div>
                        <!-- /middle area -->  

                        <!-- pagenation area -->
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
                </div>
			    <!-- /inner content -->
            </div>
            <!-- /main content -->
        </div>
        <!-- /page content -->
    </body>
</html>