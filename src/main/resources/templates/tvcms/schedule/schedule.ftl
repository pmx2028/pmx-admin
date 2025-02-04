<#import "/spring.ftl" as spring/>

<!DOCTYPE html>
<html lang="ko">
	<head>
	    <#include "/_include/tag_head.ftl">
        <script src="/static/js/pages/tvcms/schedule/schedule.js"></script>
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
                                <li class="on"><a href="schedule">일간</a></li> 
                                <li><a href="weekly">주간</a></li>          
                                <li><a href="monthly">월간</a></li>
                            </ul>
                        </div>     
                        <!-- /schedule tabmenu -->	
                            
                       <!-- middle area -->
                       <div class="card mb-2">                                
                            <div class="cont-area">
                                <!-- middle left -->
                                <div class="cont-area-md">
                                    <form name="search_form" id="search_form">
                                        <input type="hidden" name="pageUrl" id="pageUrl" value="${pageUrl}">
                                        <input type="hidden" name="searchDate" id="searchDate" value="${searchDate}">
                                    <!-- 캘린더 -->
                                    <div class="select-date-wrap">		
                                        <!-- day -->			
                                        <div class="select-date">                                                                            
                                            <a tabindex="0" class="prev-date" data-searchdate="${searchDate}" ><i class="icon-circle-left2 ml-2"></i></a>
                                            <span tabindex="0" class="selected-date">${searchDate}</span>
                                            <a tabindex="0" class="next-date" data-searchdate="${searchDate}"><i class="icon-circle-right2 mr-2"></i></a>
                                        </div>
                                        <!-- /day -->
                                        
                                    </div>
                                    
                                    <div class="">				
                                        <table class="calendar-table">
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

                                            <#list calendar?chunk(7) as week>
                                                <#assign dayWeek = 0>
                                            <tr>
                                                <#list week as day>
                                                <td>
                                                    <a class="now-date" data-searchdate="${day.day}" >
                                                    <#if dayWeek == 0 > <span class="sun"> ${day.day}
                                                    <#elseif dayWeek == 6> <span class="sat" >${day.day}
                                                    <#else> ${day.day}
                                                    </#if>
                                                    </a>
                                                </td>
                                                <#assign dayWeek = dayWeek + 1>
                                                </#list>
                                            </tr>
                                            </#list>
                                            </tbody>
                                        </table>			
                                    </div>
                                    <!-- /캘린더 -->
                                    </form>
                                </div>
                                <!-- /middle left -->

                                <!-- middle right -->
                                <div class="cont-area-md">
                                    
                                    <!-- 편성표 직접 입력 -->
                                    <div class="card mb-2">
                                     <form name="schedule_submit_form" id="schedule_submit_form" method="POST">
                                        <div class="card-header">
                                            <h5 class="card-title2 font-weight-black"><i class="fas fa-calendar-plus"></i>편성표 직접입력</h5>
                                        </div>
                                        <div class="card-body py-2 px-4">
                                        
                                            <div class="form-group row">                                           
                                                <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>편성일</label>
                                                <div class="col-sm-10" >
                                                    <div class="row">
                                                        <div class="col-sm-4">
                                                        <input type="date" id="scheduleDay" name="scheduleDay" max="2999-12-31" class="form-control form-control-sm" value="" >
                                                    </div>
                                                    </div>                                          
                                                </div>
                                            </div>

                                            <div class="form-group row">
                                                <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>방영시간</label>
                                                <div class="col-sm-10">
                                                    <div class="row">
                                                        <div class="col-sm-7">

                                                            <div class="row mb-1">
                                                                <div class="col-sm-12">
                                                                    <div class="row">
                                                                        <div class="col-sm-5">
                                                                            <input type="text" id="scheduleStTime" name="scheduleStTime" placeholder="HH:mm" pattern="^([01]\d|2[0-3]):([0-5]\d)$" class="form-control form-control-sm" value="" required />
                                                                        </div>
                                                                        <div class="mt-1 p-0 m-0"> ~ </div>
                                                                        <div class="col-sm-5">
                                                                            <input type="text" id="scheduleEdTime" name="scheduleEdTime" placeholder="HH:mm"  pattern="^([01]\d|2[0-3]):([0-5]\d)$"  class="form-control form-control-sm" value="" required />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                        <div class="col-sm-5">
                                                            <div class="row">
                                                                <label class="col-form-label col-sm-5 text-right font-weight-bolder"><i class="icon-arrow-right13"></i>운행시간</label>
                                                                <div class="col-sm-7">
                                                                <input type="text" id="scheduleLongTime" name="scheduleLongTime" class="form-control form-control-sm"  value="" disabled/>
                                                                 </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="form-group row">
                                                <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>프로그램</label>
                                                <div class="col-sm-10">
                                                    <div class="row">
                                                        <div class="col-sm-6">
                                                            <div class="row">
                                                                <div class="col-sm-10">
                                                                    <select class="form-control form-control-sm" id="programId" name="programId" >
                                                                        <#if tvProgramsList??>
                                                                            <option value="">- 선택 -</option>
                                                                            <#list tvProgramsList as programslist>
                                                                                <option value="${programslist.id?c!''}" data-name="${programslist.programName!}">${programslist.programName}</option>
                                                                            </#list>
                                                                        </#if>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-sm-6">
                                                            <div class="row">
                                                                <div class="col-sm-10">
                                                                    <input type="text" id="scheduleName" name="scheduleName" class="form-control form-control-sm"  value=""/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>회차</label>
                                                <div class="col-sm-10">
                                                    <div class="row">
                                                        <div class="col-sm-4">
                                                            <div class="row">
                                                                <div class="col-sm-10">
                                                                    <input type="text" name="scheduleSeq" id="scheduleSeq" maxlength="10" class="form-control form-control-sm" value="">
                                                                </div>
                                                                <div class="col-sm-auto mt-1 pl-0">회</div>
                                                            </div>
                                                        </div>
                                                        <div class="col-sm-8">
                                                            <div class="row">
                                                                <label class="col-form-label col-sm-5 text-right font-weight-bolder"><i class="icon-arrow-right13"></i>시청등급</label>
                                                                <div class="col-sm-10">
                                                                    <select  class="form-control form-control-sm" id="scheduleLevel" name="scheduleLevel">
                                                                        <option value="" >- 선택 -</option>
                                                                        <option value="0">전체등급</option>
                                                                        <option value="1">7세이상</option>
                                                                        <option value="2">12세 이상</option>
                                                                        <option value="3">15세 이상</option>
                                                                        <option value="4">19세 이상</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>방송구분</label>
                                                <div class="col-sm-10">
                                                    <div class="row">
                                                        <div class="col-sm-auto">
                                                            <div class="form-check pl-0">
                                                                <label class="form-check-label">
                                                                    <input type="checkbox"  value="1" class="mr-1" name="scheduleGubn">본방송
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-sm-auto">
                                                            <div class="form-check pl-0">
                                                                <label class="form-check-label">
                                                                    <input type="checkbox" value="2"  class="mr-1" name="scheduleGubn">생방송
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-sm-auto">
                                                            <div class="form-check pl-0">
                                                                <label class="form-check-label">
                                                                    <input type="checkbox" value="3"  class="mr-1" name="scheduleGubn">재방송
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>내용</label>
                                                <div class="col-sm-10">
                                                    <div class="row">
                                                        <div class="col-sm">
                                                            <textarea rows="6" cols="3" name="content"
                                                                      class="form-control form-control-sm mainform-input"></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>공개여부</label>
                                                <div class="col-sm-10">
                                                    <div class="row">
                                                        <div class="col-sm-auto">
                                                            <div class="form-check pl-0">
                                                                <label class="form-check-label">
                                                                    <input type="radio" name="viewFlag" value="1" class="mr-1"  checked >공개
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-sm-auto">
                                                            <div class="form-check pl-0">
                                                                <label class="form-check-label">
                                                                    <input type="radio" name="viewFlag" value="0" class="mr-1 ">비공개
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                            
                                            <!-- button -->
                                            <div class="card-bottom px-4">
                                            <div class="row card-btn2">                                        
                                                <div class="col-sm-12">
                                                    <div class="breadcrumb justify-content-center">
                                                        <a  href="#" class="btn bg-primary submit-form-btn mr-2">
                                                            <i class="icon-floppy-disk mr-1"></i>저장</a>
                                                        <a href="#" class="btn btn-light action-reset">
                                                        <i class="icon-cross2"></i> 취소</a>
                                                    </div>
                                                </div>       
                                            </div>
                                        </div>
                                        <!-- /button -->
                                     </form>   
                                    </div>                                   
                                    <!-- /편성표 직접 입력 -->		
                                
                                </div>
                                <!-- /middle right -->

                            </div>                           
                       </div>
                    
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
                                        <col style="width:18%">
                                        <col style="width:8%">
                                        <col style="width:8%">
                                    </colgroup>
                                    <thead>
                                        <tr>                 
                                            <th>시작시간</th>
                                            <th>종료시간</th>
                                            <th>프로그램명</th>
                                            <th>회차</th>
                                            <th>시청등급</th>
                                            <th>방송구분</th>
                                            <th>공개여부</th>
                                            <th>수정/삭제</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tbodyList">
                                    </tbody>
                                </table>
                            </div>
                            <!-- /timetable list -->
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
        <!-- /page content -->
        <#include "scheduleFormModal.ftl">
    </body>
</html>