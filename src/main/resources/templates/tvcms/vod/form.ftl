<#import "/spring.ftl" as spring/>

<!DOCTYPE html>
<html lang="ko">
	<head>
	    <#include "/_include/tag_head.ftl">
        <link href="/static/css/schedule.css" rel="stylesheet" type="text/css">
        <script src="/static/js/pages/tvcms/vod/form.js"></script>
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
                                <span class="breadcrumb-item">VOD 관리</span>
                                <span class="breadcrumb-item active">VOD 등록</span>
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
                                <h6 class="card-title2 font-weight-black"><i class="icon-square-right mr-2"></i>VOD 등록</h6>
                            </div>

                            <form name="vod_submit_form" id="vod_submit_form" method="">
                                <input type="hidden" name="id" id="id" value="${detail?default({}).id!''}">
                                <input type="hidden" id="pageParam" value="${searchRequest!''}">
                                <input type="hidden" name="programName" id="programName" value="${detail?default({}).programName!''}">
                                <input type="hidden" id="temp_programId" value="${detail?default({}).programId!''}">
                                <div class="card-body py-2 px-3 col-sm-8">
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>프로그램명</label>
                                        <div class="col-sm-10">
                                            <div class="row">
                                                <select class="form-control form-control-sm" name="programId" id="programId" >
                                                    <option value="">- 프로그램명을 선택하세요 -</option>
                                                </select>
                                            </div>
                                        </div>

                                    </div>

                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>VOD 제목</label>
                                        <div class="col-sm-10">
                                            <div class="row">
                                                <div class="input-group">
                                                    <input type="text" name="vodName" id="vodName" value="${detail?default({}).vodName!''}" class="form-control form-control-sm" placeholder="VOD 제목을 입력하세요" autocomplete="off" required>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>Youtube 주소</label>
                                        <div class="col-sm-10">
                                            <div class="row">
                                                <div class="input-group">
                                                    <input type="text"  name="youtubeUrl" id="youtubeUrl" value="${detail?default({}).youtubeUrl!''}" class="form-control form-control-sm" placeholder="Youtube 공유 코드를 붙여넣어주세요" autocomplete="off" required>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-group row">
                                        <input type="hidden" name="vodKrxIds" id="vod_krx_ids" value="${detail?default({}).vodKrxIds!''}">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>관련종목검색</label>
                                        <div class="col-sm-10">
                                            <div class="row">
                                                <div class="input-group">
                                                    <input type="text" class="form-control form-control-sm" placeholder="종목검색" name="vod_ucode" id="vod_ucode" autocomplete="off" required>
                                                </div>
                                            </div>
                                            <div id="selected_krxes" class="row pt-1">
                                                <#if detail.krxesDtoList?has_content>
                                                    <#list detail.krxesDtoList as list>
                                                      <li><code>${list.id?c!''}</code>${list.name}(${list.code})</li>

                                                    </#list>
                                                </#if>
                                            </div>
                                            <div id="krx_matches">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>썸네일 등록</label>
                                        <div class="col-sm-10" >
                                            <div class="row">
                                                <div class="input-group">
                                                    <input class="form-control" id="addFile" name="addFile" type="file" data-fouc style="padding:.25rem .75rem .3125rem .3125rem;">
                                                    <div class="input-group-text ml-1" style="padding:.3125rem .70rem" >
                                                        <#if detail?? && detail.fileName?has_content>
                                                            <a id="view_img" href="javascript:thumbnail_popImg('${detail?default({}).fileUrl!}')"><img src="${detail?default({}).fileUrl!}" width="20" height="17" alt="이미지보기"></a>
                                                        </#if>
                                                        <a href="#"  id="delete_img" class="ml-1">삭제</a>
                                                    </div>
                                                    <input type="hidden" name="fileName" id="fileName" value="${detail?default({}).fileName!''}">
                                                    <input type="hidden" name="saveFileName" id="saveFileName" value="${detail?default({}).saveFileName!''}">
                                                    <input type="hidden" name="filePath" id="filePath" value="${detail?default({}).filePath!''}">
                                                </div>
                                                <span class="mt-2">※ 썸네일을 따로 등록하지 않은 경우, Youtube 썸네일이 자동으로 적용됩니다.</span>
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
                                                        <input type="radio" name="viewFlag" value="2" class="mr-1" <#if detail.viewFlag?if_exists?string = "0"?string> checked</#if>>미노출
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
                                                        <a  href="#" class="btn bg-primary action-submit mr-2">
                                                        <i class="icon-floppy-disk mr-1"></i>저장</a>
                                                        <a  href="javascript:history.back(-1)" class="btn btn-light action-close">
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