        <script src="/static/js/pages/tvcms/schedule/scheduleFormModal.js"></script>
        <!-- modal form -->
        <div id="schedule_modal_form" class="bootbox modal fade" data-backdrop="false" tabindex="-1" role="dialog" style="display: none;" aria-modal="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header pb-3">
                        <h4 class="modal-title">편성표 관리</h4>
                        <button type="button" class="close action-close">×</button>
                    </div>
                    <div class="modal-body py-0">
                        <!-- 편성표 직접 입력 -->
                        <div class="card mb-2">
                            <form name="schedule_update_form" id="schedule_update_form"  method="POST">
                                <input type="hidden" name="id" id="id" value="">
                                <div class="card-header">
                                    <h5 class="card-title2 font-weight-black"><i class="fas fa-calendar-plus"></i>편성표 수정</h5>
                                </div>
                                <div class="card-body py-2 px-4">
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>편성일</label>
                                        <div class="col-sm-10" >
                                            <div class="row">
                                                <div class="col-sm-4">
                                                    <input type="date" name="scheduleDay" id="scheduleDay" max="2999-12-31" class="form-control form-control-sm" value="" >
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>방영시간</label>
                                        <div class="col-sm-10">
                                            <div class="row">
                                                <div class="col-sm-6">
                                                    <div class="row mb-1">
                                                        <div class="col-sm-12">
                                                            <div class="row">
                                                                <div class="col-sm-5">
                                                                    <input type="text" id="scheduleStTime" name="scheduleStTime" placeholder="HH:mm" pattern="^([01]\d|2[0-3]):([0-5]\d)$" class="form-control form-control-sm" value="" required />
                                                                </div>
                                                                <div class="mt-1 p-0 m-0"> ~ </div>
                                                                <div class="col-sm-5">
                                                                    <input type="text" id="scheduleEdTime" name="scheduleEdTime" placeholder="HH:mm" pattern="^([01]\d|2[0-3]):([0-5]\d)$" class="form-control form-control-sm" value="" required />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-sm-6">
                                                    <div class="row">
                                                        <label class="col-form-label col-sm-7 text-right font-weight-bolder"><i class="icon-arrow-right13"></i>운행시간</label>
                                                        <div class="col-sm-5">
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
                                                        <div class="col-sm-11">
                                                            <select class="form-control form-control-sm" id="programId" name="programId" >
                                                                <#if tvProgramsList??>
                                                                    <option value=""  selected >- 선택 -</option>
                                                                    <#list tvProgramsList as programslist>
                                                                        <option value="${programslist.id?c!''}" data-name="${programslist.programName!}">${programslist.programName!}</option>
                                                                    </#list>
                                                                </#if>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-sm-6">
                                                    <div class="row">
                                                        <div class="col-sm-12">
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
                                                <div class="col-sm-5">
                                                    <div class="row">
                                                        <div class="col-sm-6">
                                                            <input type="text" name="scheduleSeq" id="scheduleSeq" class="form-control form-control-sm" value="">
                                                        </div>
                                                        <div class="col-sm-auto mt-1 pl-0">회</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>시청등급</label>
                                        <div class="col-sm-10">
                                            <div class="row">
                                                <div class="col-sm-5">
                                                    <div class="row">
                                                        <div class="col-sm-8">
                                                            <select class="form-control form-control-sm" id="scheduleLevel" name="scheduleLevel">
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
                                                            <input type="checkbox"  value="1" class="mr-1" name="scheduleGubn" id="scheduleGubn">본방송
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-sm-auto">
                                                    <div class="form-check pl-0">
                                                        <label class="form-check-label">
                                                            <input type="checkbox" value="2"  class="mr-1" name="scheduleGubn" id="scheduleGubn">생방송
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-sm-auto">
                                                    <div class="form-check pl-0">
                                                        <label class="form-check-label">
                                                            <input type="checkbox" value="3"  class="mr-1" name="scheduleGubn" id="scheduleGubn">재방송
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
                                                            <textarea rows="6" cols="3" name="content" id="content"
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
                                                            <input type="radio" name="viewFlag" id="viewFlag"  value="1" class="mr-1" checked>공개
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-sm-auto">
                                                    <div class="form-check pl-0">
                                                        <label class="form-check-label">
                                                            <input type="radio" name="viewFlag"  id="viewFlag" value="0" class="mr-1 ">비공개
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
                                                <a  href="#" class="btn bg-primary submit-modal-form-btn mr-2">
                                                    <i class="icon-floppy-disk mr-1"></i>수정</a>
                                                <a href="#" class="btn btn-light action-close">
                                                    <i class="icon-cross2"></i> 취소</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- /button -->
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- /modal form -->