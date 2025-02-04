var settingMainPageScript = function() {
    //============================================================================
    // 개별 페이지에 사용하는 스크립트는 여기에 작성
    //--------------------
    
    //----------------------------------------------------------------------------
    //페이지 로딩시 기본값 세팅.
    var _componentpage = function() {

        //----------------------------------------------------------------------------
        //버튼 event 영역
        //작성버튼 event
        /**
        $(".action-form").click(function(){

            //modal 관련 초기세팅
            modalFrameReset();

            //form reset
            $("#vod_submit_form")[0].reset();

            var _data = "";
            if ($(this).data("vodid") !== undefined && $(this).data("vodid") != ""){
                //상세정보 불러오기
                _data = ajaxDetail("/tvcms/tvVods/detail", $(this).data("vodid"));
            } else {
                _data = "";
            }

            //입력, 수정폼 show
            if (_data == "") { //입력
                $('#vod_modal_form').modal("show");
                $("#vod_modal_form").on("shown.bs.modal", function () {
                    $("#programId").focus();
                });
            } else { //수정
                if (_data != false){
                    //직접입력일 경우 체크
                    if (_data.dartCorpCode == null || _data.dartCorpCode.length == 0){
                        //회사명 검색버튼 숨기기
                        $(".corp-search-span").hide();
                        //기업코드 필수체크 제외.
                        $("#dartCorpCode").prop("required", false);
                        //직접입력 check
                        $("#selfInputChecked").prop("checked", true);
                        // _componentUniform();

                    }
                    //그룹사가 있을 경우 삭제 아이콘 노출
                    if (_data.corpGroupId != null){
                        $(".group-in-icon").show();
                    }

                    $("#id").val(_data.id) ;
                    $("#programId").val(_data.programId) ;
                    $("#programName").val(_data.programName) ;
                    $("#vodName").val(_data.vodName) ;
                    $("#youtubeUrl").val(_data.youtubeUrl) ;
                    $("#krxeName").val(_data.krxeName) ;
                    $("#fileName").val(_data.fileName) ;
                    $("#saveFileName").val(_data.saveFileName) ;
                    $("#filePath").val(_data.filePath) ;
                    $("#viewFlag").val(_data.viewFlag) ;

                    //수정에서 초기화버튼 숨기기
                    //$(".action-corp-modal-reset").hide();
                    $('#vod_modal_form').modal("show");

                } else {
                    alert("오류입니다. 관리자에게 문의하세요.")
                    return false;
                }
            }

        });
       */

        //삭제버튼
        $(".destroy-btn").on("click", function (e) {
            destroyData("/tvcms/tvVods/delete", $(this).data('id'));
        });

        //검색버튼 event
        $(".action-search").click(function(){
            actionSearch();
        });


        //초기화버튼 event
        $(".action-reset").click(function(){
            $(location).attr('href', $("#pageUrl").val());
        });


        $('#searchName').keypress(function (e) {
            var key = e.which;
            if(key == 13) { // the enter key code
                actionSearch();
                return false;  
            }
        });   

        var actionSearch = function(){
            //input box value 공백제거
            $('#search_form').inputTextTrim(); //common_utils.js
            $('#search_form').attr('action', $("#pageUrl").val());
            $("#search_form").submit();
        }
    }

    // Return objects assigned to module
    return {
        init: function() {
            _componentpage();
        }
    }
}();

// Initialize module
document.addEventListener('DOMContentLoaded', function() {
    settingMainPageScript.init();
});