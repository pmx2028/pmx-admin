var settingMainPageScript = function() {
    //============================================================================
    // 개별 페이지에 사용하는 스크립트는 여기에 작성
    //--------------------
    
    //----------------------------------------------------------------------------
    //페이지 로딩시 기본값 세팅.
    var _componentpage = function() {
        /************************************************************
        excel download (common_utils.js)
        ************************************************************/
        // $(".excel_export").on("click", function(e) {
        //     unlimitedExportFile($(this).data("url"), "그룹목록");
        // });


        //----------------------------------------------------------------------------
        //버튼 event 영역
        // 편성표 입력
        $(".action-form").click(function(){


            $('#schduleModal').modal("show");
            $("#schduleModal").on("shown.bs.modal", function () {
                // $("#programName").focus();
            });


        });

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