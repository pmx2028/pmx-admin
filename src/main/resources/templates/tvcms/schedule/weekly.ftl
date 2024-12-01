<#import "/spring.ftl" as spring/>

<!DOCTYPE html>
<html lang="ko">
	<head>
	    <#include "/_include/tag_head.ftl">
        <link href="/static/css/schedule.css" rel="stylesheet" type="text/css">
        <script src="/static/js/pages/tvcms/schedule/weekly.js"></script>
	</head>    
	<body>

    <#include "/_include/header.ftl">
      
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
                                <span class="breadcrumb-item">편성표 관리</span>
							</div>
						</div>
					</div>
                </div>
                <!-- /Page header -->
                
                <!-- Inner content -->
                <div class="content-inner">
                
                    <!-- Content area -->
                    <div class="content">
                                              
                        <!-- schedule tabmenu --> 
                        <div class="grid-tab-sch">
                            <ul>
                                <li ><a href="schedule">일간</a></li> 
                                <li class="on"><a href="weekly">주간</a></li>          
                                <li><a href="monthly">월간</a></li>
                            </ul>
                        </div>     
                        <!-- /schedule tabmenu -->	
                            
                         <!-- middle area -->
                        <div class="card"> 
                            <div class="card-body">
                                <div class="row">                                                            
                                    <div class="col">                                                            
                                        <!-- center -->                              
                                        <div class="select-date-wrap">
                                            <form name="search_form" id="search_form">
                                                <input type="hidden" name="pageUrl" id="pageUrl" value="${pageUrl}">
                                                <input type="hidden" name="searchDate" id="searchDate">
                                            <!-- day -->
                                            <div class="select-date">
                                                <a tabindex="0" class="prev-date" data-searchdate="${startDt!}"><i class="icon-circle-left2 ml-2"></i></a>
                                                <span tabindex="0" class="selected-date">${startDt!} ~ ${endDt!}</span>
                                                <a tabindex="0" class="next-date" data-searchdate="${endDt!}"><i class="icon-circle-right2 mr-2"></i></a>
                                            </div>
                                            <!-- /day -->
                                            </form>
                                        </div>
                                        
                                        <div class="">				
                                            <table class="calendar-table2">
                                            <colgroup>
                                                <col style="width:calc(100% / 7)">
                                                <col style="width:calc(100% / 7)">
                                                <col style="width:calc(100% / 7)">
                                                <col style="width:calc(100% / 7)">
                                                <col style="width:calc(100% / 7)">
                                                <col style="width:calc(100% / 7)">
                                                <col style="width:calc(100% / 7)">
                                            </colgroup>
                                            <thead>
                                                <tr>
                                                    <#assign dayWeek = 0>
                                                    <#list weekData as day>
                                                        <th><div class="daygrid-day-number">
                                                                <#if dayWeek == 0 > <span class="sun" ><a id="block${day.date}" href="/tvcms/schedule/schedule?searchDate=${day.date}" tabindex="0"> ${day.date!}일 (일)</a>   </#if>
                                                                    <#if dayWeek == 1 ><a id="block${day.date}" href="/tvcms/schedule/schedule?searchDate=${day.date}" tabindex="0"> ${day.date!}일 (월)</a>   </#if>
                                                                    <#if dayWeek == 2 ><a id="block${day.date}" href="/tvcms/schedule/schedule?searchDate=${day.date}" tabindex="0"> ${day.date!}일 (화)</a>   </#if>
                                                                    <#if dayWeek == 3 ><a id="block${day.date}" href="/tvcms/schedule/schedule?searchDate=${day.date}" tabindex="0"> ${day.date!}일 (수)</a>   </#if>
                                                                    <#if dayWeek == 4 ><a id="block${day.date}" href="/tvcms/schedule/schedule?searchDate=${day.date}" tabindex="0"> ${day.date!}일 (목)</a>   </#if>
                                                                    <#if dayWeek == 5 > ${day.date!}일 (금)   </#if>
                                                                    <#if dayWeek == 6 > <span class="sat" ><a id="block${day.date}" href="/tvcms/schedule/schedule?searchDate=${day.date}" tabindex="0"> ${day.date!}일 (토)</a>   </#if>
                                                            </div></th>
                                                        <#assign dayWeek = dayWeek + 1>
                                                    </#list>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <#list weekData as day>
                                                        <#if day.tvSchedules?has_content>
                                                            <td>
                                                                <#list day.tvSchedules as schedule>
                                                                    <div class="program-list"><a id="block${schedule.id?c}" href="/tvcms/schedule/search?searchStartDt=${startDt!}&searchEndDt=${endDt!}&searchTarget=0&searchName=${schedule.scheduleName!}" tabindex="0"><i class="icon-arrow-right13"></i>${schedule.scheduleName!}</a></div>
                                                                </#list>
                                                            </td>
                                                        <#else>
                                                            <td>&nbsp;</td>
                                                        </#if>
                                                    </#list>
                                                </tr>
                                                    
                                                </tbody>            
                                            </table>			
                                        </div>
                                        <!-- /center -->
                                    </div>
                                </div>
                            </div>
                        </div>                        
                        <!-- /middle area -->

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