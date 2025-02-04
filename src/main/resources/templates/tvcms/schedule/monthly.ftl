<#import "/spring.ftl" as spring/>

<!DOCTYPE html>
<html lang="ko">
	<head>
	    <#include "/_include/tag_head.ftl">
        <script src="/static/js/pages/tvcms/schedule/monthly.js"></script>
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
                                <li><a href="schedule">일간</a></li> 
                                <li><a href="weekly">주간</a></li>          
                                <li class="on"><a href="monthly">월간</a></li>
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
                                                <input type="hidden" name="searchDate" id="searchDate" value="${searchDate}">
                                            <!-- day -->			
                                            <div class="select-date">                                                                            
                                                <a tabindex="0" href ="#" class="prev-date" data-searchdate="${searchDate}"><i class="icon-circle-left2 ml-2"></i></a>
                                                <span tabindex="0" class="selected-date">${searchDate}</span>
                                                <a tabindex="0" href ="#"  class="next-date" data-searchdate="${searchDate}"><i class="icon-circle-right2 mr-2"></i></a>
                                            </div>
                                            <!-- /day -->
                                            </form>
                                        </div>
                                        
                                        <div class="">				
                                            <table class="calendar-table table-left">
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
                                                    <th><span class="sun">일</span></th>
                                                    <th>월</th>
                                                    <th>화</th>
                                                    <th>수</th>
                                                    <th>목</th>
                                                    <th>금</th>
                                                    <th><span class="sat">토</span></th>					 
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <#list monthData?chunk(7) as week>
                                                <#assign dayWeek = 0>
                                                <tr>
                                                    <#list week as day>
                                                    <td>
                                                        <div class="daygrid-day-number font-weight-bolder"><a id="block${day.day}" class="now-date" data-searchdate="${day.day}" tabindex="0">${day.day}</a></div>
                                                        <#if day.tvSchedules?has_content>
                                                        <#list day.tvSchedules as schedule>
                                                        <div class="program-list"><a id="block${schedule.id?c}" href="/tvcms/schedule/search?searchStartDt=${startDate!}&searchEndDt=${endDate!}&searchTarget=0&searchName=${schedule.scheduleName!}" tabindex="0"><i class="icon-arrow-right13"></i>${schedule.scheduleName}</a></div>
                                                        </#list>
                                                        </#if>
                                                    </td>
                                                    </#list>
                                                </tr>
                                                </#list>
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