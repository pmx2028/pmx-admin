
<#import "/spring.ftl" as spring/>

<!DOCTYPE html>
<html lang="ko">
	<head>
	    <#include "/_include/tag_head.ftl">

       <!-- swiper -->      
      <link href="/static/css/swiper-bundle.min.css" rel="stylesheet" type="text/css">
      <script type="text/javascript" src="/static/js/plugins/swiper/swiper-bundle.min.js"></script> 
      <!-- schedule -->     
      <link href="/static/css/schedule.css" rel="stylesheet" type="text/css">     

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
                                <span class="breadcrumb-item">편성표 입력</span>
                                <span class="breadcrumb-item active">편성표 입력</span>
							</div>
						</div>
					</div>
                </div>
                <!-- /Page header -->
                
                <!-- Inner content -->
                <div class="content-inner">
                
                    <!-- Content area -->
                    <div class="content">
                    
                        <!-- button area -->
                        <div class="card mb-2">
                            <div class="card-body"> 
                                <div class="row"> 
                             
                                    <div class="col-sm-2">  
                                        <div class="breadcrumb">
                                            <a href="#" class="btn bg-primary submit-form-btn mr-2">
                                                <i class="icon-floppy-disk mr-1"></i>저장</a>
                                            <a href="#" class="btn btn-light action-close">
                                            <i class="icon-cross2"></i> 취소</a>
                                        </div>
                                    </div>                                    
                               
                                    <div class="col-sm-10 text-right">   
                                    
                                         <button type="button" class="btn bg-grey-400 font-size-xs action-reset">
                                           <i class="icon-reset"></i> <span>전체 초기화</span>
                                        </button>                         
                                        <span class="bordl-1 ml-1 pl-2">
                                        <a href="#" class="btn btn-sm badge-lg bg-purple">
                                        <i class="fas fa-plus-square mr-1"></i>열추가</a>
                                        </span>

                                        </div>
                                    </div>                                  

                                </div>
                            </div>
                        </div>
                        <!-- /button area -->
                                    
                        <!-- middle area -->
                        <div class="card mb-2">
                            <div class="card-body px-3">
                                <div class="row"> 

                                <!-- Swiper -->
                                <div class="swiper mySwiper">
                                    <div class="swiper-wrapper">
                                        
                                        <div class="swiper-slide tbl-bord1">
                                            <!-- timetable list -->
                                            <div class="timetable-lab">
                                                <form name="" id="" method="">
                                                    <table class="timetable2">                                   
                                                        <thead>
                                                            <tr>                 
                                                                <th>
                                                                    <div class="breadcrumb float-md-left ml-1">
                                                                        <span class="font-size-lg pt-1 sun">2024년 6월 30일 (일)</span>
                                                                        <a href="#" class="btn btn-sm badge bg-teal ml-1">
                                                                        <i class="fas fa-plus-square mr-1"></i><span>행추가</span></a>
                                                                    </div>
                                                                    <div class="float-md-right">                                                           
                                                                     
                                                                        <button type="button" class="btn btn-sm badge bg-pink">
                                                                          <i class="far fa-copy mr-1"></i> <span>익일로 복사</span>
                                                                        </button>


                                                                        <button type="button" class="btn btn-sm badge bg-grey">
                                                                           <i class="icon-reset"></i> <span>초기화</span>
                                                                        </button>
                                                                    
                                                                    </div>
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr class="">
                                                                <td>
                                                                    <!-- select list -->
                                                                    <table class="timetable-sub">
                                                                        <colgroup>
                                                                            <col style="width:22%">
                                                                            <col style="width:16%">
                                                                            <col style="width:40%">
                                                                            <col style="width:6%">
                                                                            <col style="width:8%">
                                                                            <col style="width:8%">
                                                                        </colgroup>
                                                                        <thead>
                                                                            <tr>                 
                                                                                <th>편성시</th>
                                                                                <th>운행길이</th>
                                                                                <th>프로그램</th>
                                                                                <th>회차</th>
                                                                                <th>시청등급</th>
                                                                                <th>방송구분</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>                                      
                                                                            <tr class="">
                                                                                <td>                                                    
                                                                                    <!-- time -->
                                                                                    <div class="row">
                                                                                        <div class="col-sm-9 ml-1 p-0">
                                                                                            <input type="time" id="appt" name="appt" min="09:00" max="18:00" class="form-control form-control-sm" required="">
                                                                                        </div>   
                                                                                        <div class="col-sm-2 ml-1 p-0">
                                                                                            <input type="" id="" name="" class="form-control form-control-sm" value="00" disabled/>
                                                                                        </div> 
                                                                                    </div>                                                       
                                                                                    <!-- /time -->	
                                                                                </td> 
                                                                                <td> 
                                                                                    <!-- time -->
                                                                                    <div class="">
                                                                                        <input type="time" id="appt" name="appt" min="09:00" max="18:00" class="form-control form-control-sm" required="">
                                                                                    </div>                                                        
                                                                                    <!-- /time -->	

                                                                                </td>
                                                                                <td class="tleft">
                                                                                    <!-- program -->
                                                                                    <div class="row">                                                                           
                                                                                        <div class="col-sm-8 pr-1">
                                                                                            <select class="form-control form-control-sm" name="programList">
                                                                                                <option value="">- 선택 -</option>
                                                                                                <option value="">나 혼자 쩜상
                                                                                                </option><option value="">한밤의 미주라</option>
                                                                                                <option value="">딜사이트 매거진</option>
                                                                                                <option value="">출발 딜사이트 1부</option>
                                                                                                <option value="">출발 딜사이트 2부</option>
                                                                                                <option value="">살맛나는 주식</option>
                                                                                                <option value="">딜사이트 런치박스</option>
                                                                                                <option value="">소문난 주식 맛집 주슐랭</option>
                                                                                                <option value="">딜사이트 마감노트</option>
                                                                                                <option value="">불만제로 D마켓</option>
                                                                                                <option value="">머니 네버슬립</option>
                                                                                                <option value="">상한가 스쿨</option>
                                                                                            </select>                                                                         
                                                                                        </div>
                                                                                        <div class="col-sm-4 pt-1 pl-1">
                                                                                            <a href="#" class="btn btn-outline-success badge modify-btn">직접입력</a>
                                                                                            <a  href="#" class="btn bg-indigo badge">신규등록</a>
                                                                                        </div>
                                                                                    </div>
                                                                                    <!-- /program -->	
                                                                                </td>
                                                                                <td>
                                                                                    
                                                                                    <!-- 회차 -->	
                                                                                    <div class="">
                                                                                        <input type="text" data-name="" name="" maxlength="10" class="form-control form-control-sm">
                                                                                    </div>
                                                                                    <!-- /회차 -->
                                                                                </td>
                                                                                <td>
                                                                                    <!-- 시청등급 -->	
                                                                                    <div class="">   
                                                                                        <select name="" class="form-control form-control-sm">
                                                                                            <option value="">- 선택 -</option>
                                                                                            <option value="1">전체등급</option>
                                                                                            <option value="2">7세이상</option>
                                                                                            <option value="3">12세 이상</option>
                                                                                            <option value="4">15세 이상</option>
                                                                                            <option value="5">19세 이상</option>
                                                                                        </select>
                                                                                    </div>
                                                                                        <!-- /시청등급 -->
                                                                                </td>
                                                                                                        
                                                                                <td>
                                                                                <!-- 방송구분 -->	
                                                                                    <div class="">
                                                                                        <select name="" class="form-control form-control-sm">
                                                                                            <option value="">- 선택 -</option>
                                                                                            <option value="1">본방송 + 생방송</option>
                                                                                            <option value="2">본방송</option>
                                                                                            <option value="3">생방송</option>                                                                
                                                                                            <option value="4">재방송</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <!-- /방송구분 -->
                                                                                </td>
                                                                            
                                                                            </tr>   
                                                                            <tr class="">
                                                                                <td>                                                    
                                                                                    <!-- time -->
                                                                                    <div class="row">
                                                                                        <div class="col-sm-9 ml-1 p-0">
                                                                                            <input type="time" id="appt" name="appt" min="09:00" max="18:00" class="form-control form-control-sm" required="">
                                                                                        </div>   
                                                                                        <div class="col-sm-2 ml-1 p-0">
                                                                                            <input type="" id="" name="" class="form-control form-control-sm" value="00" disabled/>
                                                                                        </div> 
                                                                                    </div>                                                       
                                                                                    <!-- /time -->	
                                                                                </td> 
                                                                                <td> 
                                                                                    <!-- time -->
                                                                                    <div class="">
                                                                                        <input type="time" id="appt" name="appt" min="09:00" max="18:00" class="form-control form-control-sm" required="">
                                                                                    </div>                                                        
                                                                                    <!-- /time -->	

                                                                                </td>
                                                                                <td class="tleft">
                                                                                    <!-- program -->
                                                                                    <div class="row">                                                                           
                                                                                        <div class="col-sm-8 pr-1">
                                                                                            <div class="input-group">
                                                                                                <input type="text" name="" class="form-control form-control-sm" placeholder="프로그램명을 입력하세요" value="">
                                                                                            </div>                                                                     
                                                                                        </div>
                                                                                        <div class="col-sm-4 pt-1 pl-1">
                                                                                        <a href="#" class="btn btn-outline-success badge modify-btn">직접입력</a>
                                                                                        <a href="#" class="btn bg-indigo badge">신규등록</a>
                                                                                        </div>
                                                                                    </div>
                                                                                    <!-- /program -->	
                                                                                </td>
                                                                                <td>
                                                                                    
                                                                                    <!-- 회차 -->	
                                                                                    <div class="">
                                                                                        <input type="text" data-name="" name="" maxlength="10" class="form-control form-control-sm">
                                                                                    </div>
                                                                                    <!-- /회차 -->
                                                                                </td>
                                                                                <td>
                                                                                    <!-- 시청등급 -->	
                                                                                    <div class="">   
                                                                                        <select name="" class="form-control form-control-sm">
                                                                                            <option value="">- 선택 -</option>
                                                                                            <option value="1">전체등급</option>
                                                                                            <option value="2">7세이상</option>
                                                                                            <option value="3">12세 이상</option>
                                                                                            <option value="4">15세 이상</option>
                                                                                            <option value="5">19세 이상</option>
                                                                                        </select>
                                                                                    </div>
                                                                                        <!-- /시청등급 -->
                                                                                </td>
                                                                                                        
                                                                                <td>
                                                                                <!-- 방송구분 -->	
                                                                                    <div class="">
                                                                                        <select name="" class="form-control form-control-sm">
                                                                                            <option value="">- 선택 -</option>
                                                                                            <option value="1">본방송 + 생방송</option>
                                                                                            <option value="2">본방송</option>
                                                                                            <option value="3">생방송</option>                                                                
                                                                                            <option value="4">재방송</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <!-- /방송구분 -->
                                                                                </td>
                                                                            
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                                                                                                       
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                           <!-- list -->
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft">10</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                             <!-- list -->
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft">10</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                             <!-- list --> 
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft">10</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                             <!-- list --> 
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft">10</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                             <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                             <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                             <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                             <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                             <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                             <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                             <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            <!-- list -->
                                                                             <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft">10</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                                                                                                
                                                                        </tbody>
                                                                    </table>
                                                                    <!-- /select list -->
                                                                </td>                                                        
                                                            </tr>                                                                          
                                                        </tbody>
                                                    </table>
                                                </form>
                                            </div>
                                            <!-- /timetable list --> 
                                        </div>

                                        <div class="swiper-slide tbl-bord1">
                                            <!-- timetable list -->
                                            <div class="timetable-lab">
                                                <form name="" id="" method="">
                                                    <table class="timetable2">                                   
                                                        <thead>
                                                            <tr>                 
                                                                <th>
                                                                    <div class="breadcrumb float-md-left ml-1">
                                                                        <span class="font-size-lg pt-1">2024년 7월 1일 (월)</span>
                                                                        <a href="#" class="btn btn-sm badge bg-teal ml-1">
                                                                        <i class="fas fa-plus-square mr-1"></i><span>행추가</span></a>
                                                                    </div>
                                                                    <div class="float-md-right">                                                           
                                                                     
                                                                        <button type="button" class="btn btn-sm badge bg-pink">
                                                                          <i class="far fa-copy mr-1"></i> <span>익일로 복사</span>
                                                                        </button>

                                                                        <button type="button" class="btn btn-sm badge bg-grey">
                                                                           <i class="icon-reset"></i> <span>초기화</span>
                                                                        </button>
                                                                    
                                                                    </div>
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr class="">
                                                                <td>
                                                                    <!-- select list -->
                                                                    <table class="timetable-sub">
                                                                        <colgroup>
                                                                            <col style="width:22%">
                                                                            <col style="width:16%">
                                                                            <col style="width:40%">
                                                                            <col style="width:6%">
                                                                            <col style="width:8%">
                                                                            <col style="width:8%">
                                                                        </colgroup>
                                                                        <thead>
                                                                            <tr>                 
                                                                                <th>편성시</th>
                                                                                <th>운행길이</th>
                                                                                <th>프로그램</th>
                                                                                <th>회차</th>
                                                                                <th>시청등급</th>
                                                                                <th>방송구분</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>                                      
                                                                            <tr class="">
                                                                                <td>                                                    
                                                                                    <!-- time -->
                                                                                    <div class="row">
                                                                                        <div class="col-sm-9 ml-1 p-0">
                                                                                            <input type="time" id="appt" name="appt" min="09:00" max="18:00" class="form-control form-control-sm" required="">
                                                                                        </div>   
                                                                                        <div class="col-sm-2 ml-1 p-0">
                                                                                            <input type="" id="" name="" class="form-control form-control-sm" value="00" disabled/>
                                                                                        </div> 
                                                                                    </div>                                                       
                                                                                    <!-- /time -->	
                                                                                </td> 
                                                                                <td> 
                                                                                    <!-- time -->
                                                                                    <div class="">
                                                                                        <input type="time" id="appt" name="appt" min="09:00" max="18:00" class="form-control form-control-sm" required="">
                                                                                    </div>                                                        
                                                                                    <!-- /time -->	

                                                                                </td>
                                                                                <td class="tleft">
                                                                                        <!-- program -->
                                                                                        <div class="row">                                                                           
                                                                                            <div class="col-sm-8 pr-1">
                                                                                                <select class="form-control form-control-sm" name="programList">
                                                                                                    <option value="">- 선택 -</option>
                                                                                                    <option value="">나 혼자 쩜상
                                                                                                    </option><option value="">한밤의 미주라</option>
                                                                                                    <option value="">딜사이트 매거진</option>
                                                                                                    <option value="">출발 딜사이트 1부</option>
                                                                                                    <option value="">출발 딜사이트 2부</option>
                                                                                                    <option value="">살맛나는 주식</option>
                                                                                                    <option value="">딜사이트 런치박스</option>
                                                                                                    <option value="">소문난 주식 맛집 주슐랭</option>
                                                                                                    <option value="">딜사이트 마감노트</option>
                                                                                                    <option value="">불만제로 D마켓</option>
                                                                                                    <option value="">머니 네버슬립</option>
                                                                                                    <option value="">상한가 스쿨</option>
                                                                                                </select>                                                                         
                                                                                            </div>
                                                                                            <div class="col-sm-4 pt-1 pl-1">
                                                                                                <a href="#" class="btn btn-outline-success badge modify-btn">직접입력</a>
                                                                                                <a  href="#" class="btn bg-indigo badge">신규등록</a>
                                                                                            </div>
                                                                                        </div>
                                                                                        <!-- /program -->	
                                                                                    </td>
                                                                                    <td>
                                                                                        
                                                                                        <!-- 회차 -->	
                                                                                        <div class="">
                                                                                            <input type="text" data-name="" name="" maxlength="10" class="form-control form-control-sm">
                                                                                        </div>
                                                                                        <!-- /회차 -->
                                                                                    </td>
                                                                                    <td>
                                                                                        <!-- 시청등급 -->	
                                                                                        <div class="">   
                                                                                            <select name="" class="form-control form-control-sm">
                                                                                                <option value="">- 선택 -</option>
                                                                                                <option value="1">전체등급</option>
                                                                                                <option value="2">7세이상</option>
                                                                                                <option value="3">12세 이상</option>
                                                                                                <option value="4">15세 이상</option>
                                                                                                <option value="5">19세 이상</option>
                                                                                            </select>
                                                                                        </div>
                                                                                            <!-- /시청등급 -->
                                                                                    </td>
                                                                                                            
                                                                                    <td>
                                                                                    <!-- 방송구분 -->	
                                                                                        <div class="">
                                                                                            <select name="" class="form-control form-control-sm">
                                                                                                <option value="">- 선택 -</option>
                                                                                                <option value="1">본방송 + 생방송</option>
                                                                                                <option value="2">본방송</option>
                                                                                                <option value="3">생방송</option>                                                                
                                                                                                <option value="4">재방송</option>
                                                                                            </select>
                                                                                        </div>
                                                                                        <!-- /방송구분 -->
                                                                                    </td>
                                                                                
                                                                            </tr>   
                                                                            <tr class="">
                                                                                <td>                                                    
                                                                                    <!-- time -->
                                                                                    <div class="row">
                                                                                        <div class="col-sm-9 ml-1 p-0">
                                                                                            <input type="time" id="appt" name="appt" min="09:00" max="18:00" class="form-control form-control-sm" required="">
                                                                                        </div>   
                                                                                        <div class="col-sm-2 ml-1 p-0">
                                                                                            <input type="" id="" name="" class="form-control form-control-sm" value="00" disabled/>
                                                                                        </div> 
                                                                                    </div>                                                       
                                                                                    <!-- /time -->	
                                                                                </td> 
                                                                                <td> 
                                                                                    <!-- time -->
                                                                                    <div class="">
                                                                                        <input type="time" id="appt" name="appt" min="09:00" max="18:00" class="form-control form-control-sm" required="">
                                                                                    </div>                                                        
                                                                                    <!-- /time -->	

                                                                                </td>
                                                                                <td class="tleft">
                                                                                    <!-- program -->
                                                                                    <div class="row">                                                                           
                                                                                        <div class="col-sm-8 pr-1">
                                                                                            <div class="input-group">
                                                                                                <input type="text" name="" class="form-control form-control-sm" placeholder="프로그램명을 입력하세요" value="">
                                                                                            </div>                                                                     
                                                                                        </div>
                                                                                        <div class="col-sm-4 pt-1 pl-1">
                                                                                        <a href="#" class="btn btn-outline-success badge modify-btn">직접입력</a>
                                                                                        <a href="#" class="btn bg-indigo badge">신규등록</a>
                                                                                        </div>
                                                                                    </div>
                                                                                    <!-- /program -->	
                                                                                </td>
                                                                                <td>
                                                                                    
                                                                                    <!-- 회차 -->	
                                                                                    <div class="">
                                                                                        <input type="text" data-name="" name="" maxlength="10" class="form-control form-control-sm">
                                                                                    </div>
                                                                                    <!-- /회차 -->
                                                                                </td>
                                                                                <td>
                                                                                    <!-- 시청등급 -->	
                                                                                    <div class="">   
                                                                                        <select name="" class="form-control form-control-sm">
                                                                                            <option value="">- 선택 -</option>
                                                                                            <option value="1">전체등급</option>
                                                                                            <option value="2">7세이상</option>
                                                                                            <option value="3">12세 이상</option>
                                                                                            <option value="4">15세 이상</option>
                                                                                            <option value="5">19세 이상</option>
                                                                                        </select>
                                                                                    </div>
                                                                                        <!-- /시청등급 -->
                                                                                </td>
                                                                                                        
                                                                                <td>
                                                                                <!-- 방송구분 -->	
                                                                                    <div class="">
                                                                                        <select name="" class="form-control form-control-sm">
                                                                                            <option value="">- 선택 -</option>
                                                                                            <option value="1">본방송 + 생방송</option>
                                                                                            <option value="2">본방송</option>
                                                                                            <option value="3">생방송</option>                                                                
                                                                                            <option value="4">재방송</option>
                                                                                        </select>
                                                                                    </div>
                                                                                    <!-- /방송구분 -->
                                                                                </td>
                                                                            
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                              <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr>  
                                                                            <tr class="">
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td class="tleft"></td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>                                                                       
                                                                            </tr> 
                                                                            
                                                                                                                                                        
                                                                        </tbody>
                                                                    </table>
                                                                    <!-- /select list -->
                                                                </td>                                                        
                                                            </tr>                                                                          
                                                        </tbody>
                                                    </table>
                                                </form>
                                            </div>
                                            <!-- /timetable list --> 
                                        </div>

                                        <div class="swiper-slide tbl-bord1">
                                            <!-- timetable list -->
                                            <div class="timetable-lab">
                                                <form name="" id="" method="">
                                                    <table class="timetable2">                                   
                                                        <thead>
                                                            <tr>                 
                                                                <th>
                                                                    <div class="breadcrumb float-md-left ml-1">
                                                                        <span class="font-size-lg pt-1">2024년 7월 2일 (화)</span>
                                                                        <a href="#" class="btn btn-sm badge bg-teal ml-1">
                                                                        <i class="fas fa-plus-square mr-1"></i><span>행추가</span></a>
                                                                    </div>
                                                                    <div class="float-md-right">                                                           
                                                                     
                                                                        <button type="button" class="btn btn-sm badge bg-pink">
                                                                          <i class="far fa-copy mr-1"></i> <span>익일로 복사</span>
                                                                        </button>


                                                                        <button type="button" class="btn btn-sm badge bg-grey">
                                                                           <i class="icon-reset"></i> <span>초기화</span>
                                                                        </button>
                                                                    
                                                                    </div>
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr class="">
                                                            <td>
                                                                <!-- select list -->
                                                                <table class="timetable-sub">
                                                                    <colgroup>
                                                                        <col style="width:22%">
                                                                        <col style="width:16%">
                                                                        <col style="width:40%">
                                                                        <col style="width:6%">
                                                                        <col style="width:8%">
                                                                        <col style="width:8%">
                                                                    </colgroup>
                                                                    <thead>
                                                                        <tr>                 
                                                                            <th>편성시</th>
                                                                            <th>운행길이</th>
                                                                            <th>프로그램</th>
                                                                            <th>회차</th>
                                                                            <th>시청등급</th>
                                                                            <th>방송구분</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>                                      
                                                                        <tr class="">
                                                                            <td>                                                    
                                                                                <!-- time -->
                                                                                <div class="row">
                                                                                    <div class="col-sm-9 ml-1 p-0">
                                                                                        <input type="time" id="appt" name="appt" min="09:00" max="18:00" class="form-control form-control-sm" required="">
                                                                                    </div>   
                                                                                    <div class="col-sm-2 ml-1 p-0">
                                                                                        <input type="" id="" name="" class="form-control form-control-sm" value="00" disabled/>
                                                                                    </div> 
                                                                                </div>                                                       
                                                                                <!-- /time -->	
                                                                            </td> 
                                                                            <td> 
                                                                                <!-- time -->
                                                                                <div class="">
                                                                                    <input type="time" id="appt" name="appt" min="09:00" max="18:00" class="form-control form-control-sm" required="">
                                                                                </div>                                                        
                                                                                <!-- /time -->	

                                                                            </td>
                                                                        <td class="tleft">
                                                                                <!-- program -->
                                                                                <div class="row">                                                                           
                                                                                    <div class="col-sm-8 pr-1">
                                                                                        <select class="form-control form-control-sm" name="programList">
                                                                                            <option value="">- 선택 -</option>
                                                                                            <option value="">나 혼자 쩜상
                                                                                            </option><option value="">한밤의 미주라</option>
                                                                                            <option value="">딜사이트 매거진</option>
                                                                                            <option value="">출발 딜사이트 1부</option>
                                                                                            <option value="">출발 딜사이트 2부</option>
                                                                                            <option value="">살맛나는 주식</option>
                                                                                            <option value="">딜사이트 런치박스</option>
                                                                                            <option value="">소문난 주식 맛집 주슐랭</option>
                                                                                            <option value="">딜사이트 마감노트</option>
                                                                                            <option value="">불만제로 D마켓</option>
                                                                                            <option value="">머니 네버슬립</option>
                                                                                            <option value="">상한가 스쿨</option>
                                                                                        </select>                                                                         
                                                                                    </div>
                                                                                    <div class="col-sm-4 pt-1 pl-1">
                                                                                        <a href="#" class="btn btn-outline-success badge modify-btn">직접입력</a>
                                                                                        <a  href="#" class="btn bg-indigo badge">신규등록</a>
                                                                                    </div>
                                                                                </div>
                                                                                <!-- /program -->	
                                                                            </td>
                                                                            <td>
                                                                                
                                                                                <!-- 회차 -->	
                                                                                <div class="">
                                                                                    <input type="text" data-name="" name="" maxlength="10" class="form-control form-control-sm">
                                                                                </div>
                                                                                <!-- /회차 -->
                                                                            </td>
                                                                            <td>
                                                                                <!-- 시청등급 -->	
                                                                                <div class="">   
                                                                                    <select name="" class="form-control form-control-sm">
                                                                                        <option value="">- 선택 -</option>
                                                                                        <option value="1">전체등급</option>
                                                                                        <option value="2">7세이상</option>
                                                                                        <option value="3">12세 이상</option>
                                                                                        <option value="4">15세 이상</option>
                                                                                        <option value="5">19세 이상</option>
                                                                                    </select>
                                                                                </div>
                                                                                    <!-- /시청등급 -->
                                                                            </td>
                                                                                                    
                                                                            <td>
                                                                            <!-- 방송구분 -->	
                                                                                <div class="">
                                                                                    <select name="" class="form-control form-control-sm">
                                                                                        <option value="">- 선택 -</option>
                                                                                        <option value="1">본방송 + 생방송</option>
                                                                                        <option value="2">본방송</option>
                                                                                        <option value="3">생방송</option>                                                                
                                                                                        <option value="4">재방송</option>
                                                                                    </select>
                                                                                </div>
                                                                                <!-- /방송구분 -->
                                                                            </td>
                                                                        
                                                                        </tr>   
                                                                        <tr class="">
                                                                            <td>                                                    
                                                                                <!-- time -->
                                                                                <div class="row">
                                                                                    <div class="col-sm-9 ml-1 p-0">
                                                                                        <input type="time" id="appt" name="appt" min="09:00" max="18:00" class="form-control form-control-sm" required="">
                                                                                    </div>   
                                                                                    <div class="col-sm-2 ml-1 p-0">
                                                                                        <input type="" id="" name="" class="form-control form-control-sm" value="00" disabled/>
                                                                                    </div> 
                                                                                </div>                                                       
                                                                                <!-- /time -->	
                                                                            </td> 
                                                                            <td> 
                                                                                <!-- time -->
                                                                                <div class="">
                                                                                    <input type="time" id="appt" name="appt" min="09:00" max="18:00" class="form-control form-control-sm" required="">
                                                                                </div>                                                        
                                                                                <!-- /time -->	

                                                                            </td>
                                                                        <td class="tleft">
                                                                                <!-- program -->
                                                                                <div class="row">                                                                           
                                                                                    <div class="col-sm-8 pr-1">
                                                                                        <div class="input-group">
                                                                                            <input type="text" name="" class="form-control form-control-sm" placeholder="프로그램명을 입력하세요" value="">
                                                                                        </div>                                                                     
                                                                                    </div>
                                                                                    <div class="col-sm-4 pt-1 pl-1">
                                                                                    <a href="#" class="btn btn-outline-success badge modify-btn">직접입력</a>
                                                                                    <a href="#" class="btn bg-indigo badge">신규등록</a>
                                                                                    </div>
                                                                                </div>
                                                                                <!-- /program -->	
                                                                            </td>
                                                                            <td>
                                                                                
                                                                                <!-- 회차 -->	
                                                                                <div class="">
                                                                                    <input type="text" data-name="" name="" maxlength="10" class="form-control form-control-sm">
                                                                                </div>
                                                                                <!-- /회차 -->
                                                                            </td>
                                                                            <td>
                                                                                <!-- 시청등급 -->	
                                                                                <div class="">   
                                                                                    <select name="" class="form-control form-control-sm">
                                                                                        <option value="">- 선택 -</option>
                                                                                        <option value="1">전체등급</option>
                                                                                        <option value="2">7세이상</option>
                                                                                        <option value="3">12세 이상</option>
                                                                                        <option value="4">15세 이상</option>
                                                                                        <option value="5">19세 이상</option>
                                                                                    </select>
                                                                                </div>
                                                                                    <!-- /시청등급 -->
                                                                            </td>
                                                                                                    
                                                                            <td>
                                                                            <!-- 방송구분 -->	
                                                                                <div class="">
                                                                                    <select name="" class="form-control form-control-sm">
                                                                                        <option value="">- 선택 -</option>
                                                                                        <option value="1">본방송 + 생방송</option>
                                                                                        <option value="2">본방송</option>
                                                                                        <option value="3">생방송</option>                                                                
                                                                                        <option value="4">재방송</option>
                                                                                    </select>
                                                                                </div>
                                                                                <!-- /방송구분 -->
                                                                            </td>
                                                                        
                                                                        </tr>  
                                                                        <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                        <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                        <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr>  
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                         <tr class="">
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td class="tleft"></td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>
                                                                            <td>&nbsp;</td>                                                                       
                                                                        </tr> 
                                                                        

                                                                                                                                                    
                                                                    </tbody>
                                                                </table>
                                                                <!-- /select list -->
                                                            </td>                                                        
                                                            </tr>  
                                                            
                                                                        
                                                        </tbody>
                                                    </table>
                                                </form>
                                            </div>
                                            <!-- /timetable list --> 
                                        </div>  

                                    </div>  
                                                             
                                </div>
                                    <div class="swiper-button-next"></div>
                                    <div class="swiper-button-prev"></div>
                                  
                                </div>
                                <!-- /Swiper -->

                                <!-- Initialize Swiper -->
                                <script>
                                    var swiper = new Swiper(".mySwiper", {
                                        slidesPerView: "auto",      
                                        spaceBetween: 1,
                                        navigation: {
                                            nextEl: ".swiper-button-next",
                                            prevEl: ".swiper-button-prev",
                                        },
                                    });
                                </script>
                                <!-- /Initialize Swiper -->

                                </div>                                
                            </div>
                        </div>
                        <!-- /middle area -->

                        <!-- pagenation area -->
                       <#--   <div class="card mb-0">
                            <div class="table-responsive table-pagenum">
                                <table class="table">
                                    <tbody>
                                        <tr>                                           
                                            <td >
                                            <div class="dataTables_paginate">
                                                <ul class="pagination pagination-flat pagination-rounded align-self-right">
                                                    <li class="page-item disabled"><a href="#" class="page-link"><i class="fa fa-angle-double-left"></i></a></li>
                                                    <li class="page-item disabled"><a href="#" class="page-link"><i class="fa fa-angle-left"></i></a></li>
                                                    <li class="page-item active"><a href="#" class="page-link">1</a></li>
                                                    <li class="page-item"><a href="/setting/corpGroup?page=2" class="page-link">2</a></li>
                                                    <li class="page-item"><a href="/setting/corpGroup?page=3" class="page-link">3</a></li>
                                                    <li class="page-item"><a href="/setting/corpGroup?page=4" class="page-link">4</a></li>
                                                    <li class="page-item"><a href="/setting/corpGroup?page=5" class="page-link">5</a></li>
                                                    <li class="page-item"><a href="/setting/corpGroup?page=6" class="page-link">6</a></li>                                                    
                                                    <li class="page-item disabled"><a href="#" class="page-link"><i class="fa fa-angle-right"></i></a></li>
                                                    <li class="page-item"><a href="/setting/corpGroup?page=6" class="page-link"><i class="fa fa-angle-double-right"></i></a></li>
                                                </ul>
                                            </div>                                           
                                        </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>  -->
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