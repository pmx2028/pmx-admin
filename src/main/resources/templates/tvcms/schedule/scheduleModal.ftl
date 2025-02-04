        <script src="/static/js/pages/tvcms/schedule/scheduleFormModal.js"></script>
        <!-- modal form -->
        <div id="schduleModal" class="bootbox modal fade" data-backdrop="false" tabindex="-1" role="dialog" style="display: none;" aria-modal="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header pb-3">
                        <h4 class="modal-title">편성표 기간 선택</h4>
                        <button type="button" class="close action-close">×</button>
                    </div>
                    <div class="modal-body py-0">
                        <form class="form-validate-jquery" name="#schedule_date_submit" id="#schedule_date_submit">
                            <input type="date" active name="startDt" id="startDt">
                            <input type="date" active name="endDt" id="endDt">
                            
                        </form>
                    </div>
                    <div class="modal-footer pt-2 d-flex justify-content-between align-items-center">
                        <div class="pull-left">
                            <button type="button" class="btn btn-light action-close"><i class="icon-cancel-circle2 mr-2"></i> 닫기</button>
                        </div>
                        <div class="pull-right">
                            <button type="button" class="btn bg-blue pull-right action-submit" ><i class="icon-checkmark4 mr-2"></i>확인</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- /modal form -->