        <script src="/static/js/pages/tvcms/program/formModal.js"></script>
        <!-- modal form -->
        <div id="program_modal_form" class="bootbox modal fade" data-backdrop="false" tabindex="-1" role="dialog" style="display: none;" aria-modal="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header pb-3">
                        <h4 class="modal-title">그룹사 관리</h4>
                        <button type="button" class="close action-close">×</button>
                    </div>
                    <div class="modal-body py-0">
                        <form class="form-validate-jquery" name="program_submit_form" id="program_submit_form" action="#">
                            <input type="hidden" name="id" id="id">
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">프로그램명 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="programName" id="programName" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">방영시작일 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="broadStartDt" id="broadStartDt" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">방송일정 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="broadTime" id="broadTime" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">내용 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="content" id="content" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">연출 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="director" id="director" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">조연출 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="assistantDirector" id="assistantDirector" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">작가 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="author" id="author" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">진행자 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="programHost" id="programHost" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">비고 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="contentEtc" id="contentEtc" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">타이틀 이미지</label>
                                <div class="col-md-6">
                                    <label for="addFile" class="lab-file-001 br-btn btn-br-black">파일선택</label>
                                    <input id="addFile" name="addFile" type="file" class="normal-file" data-fouc>
                                    <span id="addFileSpan" class="txt-atc-file-fl"></span>
                                    <input type="hidden" name="fileName" id="fileName">
                                    <input type="hidden" name="saveFileName" id="saveFileName">
                                    <input type="hidden" name="filePath" id="filePath">
                                    </td>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">정렬순서 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="seq" id="seq" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">시청등급 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="programLevel" id="programLevel" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">주요프그램여부 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="majorFlag" id="majorFlag" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">방송중여부</label>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <select class="form-control" name="broadFlag" id="broadFlag">
                                            <option value="1">방송중</option>
                                            <option value="0">종료</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">노출여부</label>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <select class="form-control" name="viewFlag" id="viewFlag">
                                            <option value="1">노출</option>
                                            <option value="0">비노출</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer pt-2 d-flex justify-content-between align-items-center">
                        <div class="pull-left">
                            <button type="button" class="btn btn-light action-close"><i class="icon-cancel-circle2 mr-2"></i> 닫기</button>
                        </div>
                        <div class="pull-right">
                            <button type="button" class="btn bg-blue pull-right action-submit" ><i class="icon-checkmark4 mr-2"></i> 저장</button>
                            <button type="button" class="btn bg-danger pull-right action-delete mr-2" ><i class="icon-minus-circle2 mr-2"></i> 삭제</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- /modal form -->