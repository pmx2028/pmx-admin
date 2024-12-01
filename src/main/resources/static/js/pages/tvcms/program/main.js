var settingMainPageScript = function() {
    //============================================================================
    // 개별 페이지에 사용하는 스크립트는 여기에 작성
    //--------------------
    
    //----------------------------------------------------------------------------
    //페이지 로딩시 기본값 세팅.
    var _componentpage = function() {


        //검색버튼 event
        $(".action-search").click(function(){
            actionSearch();
        });

        //초기화버튼 event
        $(".action-reset").click(function(){
            $(location).attr('href', $("#pageUrl").val());
        });


        $('#programName').keypress(function (e) {
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
        var modalFrameReset = function(){

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