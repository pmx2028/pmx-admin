<#import "/spring.ftl" as spring/>

<!DOCTYPE html>
<html lang="ko">
	<head>
	    <#include "/_include/tag_head.ftl">
        <script src="/static/js/pages/tvcms/program/form.js"></script>
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
                                <span class="breadcrumb-item">프로그램 관리</span>
                                    <span class="breadcrumb-item active">프로그램 등록</span>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- /Page header -->

                <!-- Inner content -->
                <div class="content-inner">
                
                    <!-- Content area -->
                    <div class="content">
                    
                        <!-- middle area -->
                        <div class="card mb-2">  

                            <div class="card-header col-sm-8 pr-2">
                                <h6 class="card-title2 font-weight-black"><i class="icon-square-right mr-2"></i>프로그램 등록</h6>
                            </div>

                            <form class="form-validate-jquery" name="program_submit_form" id="program_submit_form" action="#">
                                <input type="hidden" name="id" id="id" value="${detail?default({}).id!''}">
                                <input type="hidden" id="pageParam" value="${searchRequest!''}">
                                <div class="card-body py-2 px-3 col-sm-8">
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>프로그램명</label>  
                                        <div class="col-sm-10">
                                            <div class="row">
                                                <div class="input-group">
                                                    <input type="text"  name="programName" id="programName" value="${detail?default({}).programName!''}" autocomplete="off" required class="form-control form-control-sm" placeholder="프로그램명을 입력하세요" >
                                                </div>
                                            </div>
                                        </div>   

                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>방영시작일</label>
                                        <div class="col-sm-3" >
                                            <div class="row">  
                                            <input type="date" max="2999-12-31" class="form-control form-control-sm" name="broadStartDt" id="broadStartDt" value="${detail?default({}).broadStartDt!''}" autocomplete="off" required>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-group row">                                           
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>방송일정</label>
                                        <div class="col-sm-10" >
                                            <div class="row">  
                                            <input type="text" class="form-control form-control-sm" placeholder="매주 월~금 17:00" name="broadTime" id="broadTime" value="${detail?default({}).broadTime!''}" autocomplete="off" required>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>내용</label>  
                                        <div class="col-sm-10 col-sm">
                                            <div class="row">
                                            <textarea rows="6" cols="3" name="content" id="content"  autocomplete="off"  class="form-control form-control-sm" placeholder="프로그램 소개글을 작성해주세요" required>${detail?default({}).content!''}</textarea>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-group row">                                           
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>연출</label>
                                        <div class="col-sm-10" >
                                            <div class="row">
                                            <input type="text" class="form-control form-control-sm" name="director" id="director" value="${detail?default({}).director!''}" autocomplete="off" required>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>조연출</label>
                                        <div class="col-sm-10" >
                                            <div class="row">
                                            <input type="text" class="form-control form-control-sm" name="assistantDirector" id="assistantDirector" value="${detail?default({}).assistantDirector!''}" autocomplete="off" required>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>작가</label>
                                        <div class="col-sm-10" >
                                            <div class="row">
                                            <input type="text" class="form-control form-control-sm" name="author" id="author" value="${detail?default({}).author!''}" autocomplete="off" required>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-group row">                                           
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>진행</label>
                                        <div class="col-sm-10" >
                                            <div class="row">
                                            <input type="text" class="form-control form-control-sm" name="programHost" id="programHost" value="${detail?default({}).programHost!''}" autocomplete="off" required>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>비고</label>  
                                        <div class="col-sm-10 col-sm">
                                            <div class="row">
                                            <textarea rows="3" cols="3" class="form-control form-control-sm"  placeholder="프로그램 관련 기타 comment를 입력해주세요" name="contentEtc" id="contentEtc"  autocomplete="off" required>${detail?default({}).contentEtc!''}</textarea>
                                            </div> 
                                        </div>
                                    </div>                                

                                    <div class="form-group row">                                               
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>타이틀이미지</label>           
                                        <div class="col-sm-10"> 
                                            <div class="row">                                    
                                                <div class="input-group">
                                                    <input id="addFile" name="addFile" type="file" class="normal-file" data-fouc style="padding:.25rem .75rem .3125rem .3125rem;">
                                                    <span id="addFileSpan" class="txt-atc-file-fl"></span>
                                                    <input type="hidden" name="fileName" id="fileName" value="${detail?default({}).fileName!''}">
                                                    <input type="hidden" name="saveFileName" id="saveFileName" value="${detail?default({}).saveFileName!''}">
                                                    <input type="hidden" name="filePath" id="filePath" value="${detail?default({}).filePath!''}">
                                                    <div class="input-group-text ml-1" style="padding:.3125rem .70rem">
                                                        <a href="javascript:thumbnail_popImg('${detail?default({}).fileUrl!}')"><img src="${detail?default({}).fileUrl!}" width="20" height="17" alt="이미지보기"></a>
                                                        <a href="#"  class="ml-1">삭제</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>         

                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>정렬순서</label>                                    
                                        <div class="col-sm-10">
                                            <div class="row">                                            
                                                <select  class="form-control form-control-sm" name="seq" id="seq" autocomplete="off"  required>
                                                    <option value="" <#if !detail.seq?if_exists?has_content> selected </#if>>- 선택 -</option>
                                                    <#list 1..20 as i>
                                                        <option value="${i}" <#if detail.seq?if_exists?string = "${i}"> selected </#if>>${i}</option>
                                                    </#list>
                                                </select>
                                            </div>
                                        </div>
                                        
                                    </div>
                                    
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>시청등급</label>
                                        <div class="col-sm-10">
                                            <div class="row"> 
                                                <select class="form-control form-control-sm" name="programLevel" id="programLevel" autocomplete="off" required>
                                                    <option value="" <#if !detail.programLevel?if_exists?has_content> selected </#if>>- 선택 -</option>
                                                    <option value="0" <#if detail.programLevel?if_exists?string = "0"> selected </#if>>전체등급</option>
                                                    <option value="1" <#if detail.programLevel?if_exists?string = "1"> selected </#if>>7세이상</option>
                                                    <option value="2" <#if detail.programLevel?if_exists?string = "2"> selected </#if>>12세 이상</option>
                                                    <option value="3" <#if detail.programLevel?if_exists?string = "3"> selected </#if>>15세 이상</option>
                                                    <option value="4" <#if detail.programLevel?if_exists?string = "4"> selected </#if>>19세 이상</option>
                                                </select>
                                                    
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>주요프로그램 여부</label>                 
                                        <div class="col-sm-10">
                                            <div class="row">                                            
                                                    <div class="form-check pl-0">
                                                        <label class="form-check-label">                                                                    
                                                            <input value="1" type="checkbox" class="custom-checkbox mr-1" name="majorFlag" id="majorFlag" autocomplete="off" required <#if !detail.modifyFlag?if_exists?has_content || detail.modifyFlag?if_exists?string = "1"?string> checked</#if>>
                                                            주요프로그램
                                                        </label>
                                                    </div>                                                                                   
                                            </div>
                                        </div>

                                    </div>                                

                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>노출여부</label>  
                                        <div class="col-sm-10">
                                            <div class="row">
                                                
                                                    <div class="form-check pl-0 mr-3">
                                                        <label class="form-check-label">
                                                            <input type="radio" name="viewFlag" value="1" class="mr-1" <#if !detail.viewFlag?if_exists?has_content || detail.viewFlag?if_exists?string = "1"?string> checked</#if>>노출
                                                        </label>
                                                    </div>
                                                
                                                    <div class="form-check pl-0">
                                                        <label class="form-check-label">
                                                            <input type="radio" name="viewFlag" value="0" class="mr-1" <#if detail.viewFlag?if_exists?string = "0"?string> checked</#if>>미노출
                                                        </label>
                                                    </div>
                                            
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>방영여부</label>  
                                        <div class="col-sm-10">
                                            <div class="row">
                                                
                                                    <div class="form-check pl-0 mr-3">
                                                        <label class="form-check-label">
                                                            <input type="radio"  name="broadFlag" value="1" class="mr-1" <#if !detail.broadFlag?if_exists?has_content || detail.broadFlag?if_exists?string = "1"?string> checked</#if>>방영
                                                        </label>
                                                    </div>
                                                
                                                    <div class="form-check pl-0">
                                                        <label class="form-check-label">
                                                            <input type="radio" name="broadFlag" value="0" class="mr-1" <#if detail.broadFlag?if_exists?string = "0"?string> checked</#if>>종영
                                                        </label>
                                                    </div>
                                            
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-group pl-2">
                                    
                                        <!-- button -->                           
                                        <div class="card-bottom">
                                            <div class="row card-btn2">                                        
                                                <div class="col-sm-12">
                                                
                                                    <div class="breadcrumb justify-content-center">
                                                        <#if adminAuth_String?index_of("ROLE_SUPER_ADMIN") != -1 || adminAuth_String?index_of("ROLE_DC_ADMIN") != -1>
                                                        <a  class="btn bg-primary submit-form-btn mr-2 action-submit">
                                                            <i class="icon-floppy-disk mr-1"></i>저장</a>
                                                        </#if>
                                                        <a href="javascript:history.back(-1)" class="btn btn-light action-close">
                                                        <i class="icon-cross2"></i> 취소</a>
                                                    </div>
                                                
                                                </div>       
                                            </div>
                                        </div>
                                        <!-- /button --> 
                                    </div>
                                
                                </div>
                            </form>                            

                        </div>
                            <!-- middle area -->

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