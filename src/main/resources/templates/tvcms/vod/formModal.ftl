        <script src="/static/js/pages/tvcms/vod/formModal.js"></script>
        <!-- modal form -->
        <div id="vod_modal_form" class="bootbox modal fade" data-backdrop="false" tabindex="-1" role="dialog" style="display: none;" aria-modal="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header pb-3">
                        <h4 class="modal-title">그룹사 관리</h4>
                        <button type="button" class="close action-close">×</button>
                    </div>
                    <div class="modal-body py-0">
                        <form class="form-validate-jquery" name="vod_submit_form" id="vod_submit_form" action="#">
                            <input type="hidden" name="id" id="id">
                            <input type="hidden" name="programName" id="programName">
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">프로그램명 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="col-md-4">
                                        <div class="form-group">
                                            <select class="form-control" name="programId" id="programId">
                                                <option value="">선택하세요.</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">VOD 제목 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="vodName" id="vodName" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3"> Youtube 주소 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="youtubeUrl" id="youtubeUrl" autocomplete="off" required placeholder="그룹명을 입력하세요">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-form-label col-md-3">관련종목검색 <span class="text-danger">*</span></label>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <input type="text" class="form-control" name="krxeName" id="krxeName" autocomplete="off" required placeholder="그룹명을 입력하세요">
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- /modal form -->