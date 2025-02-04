var settingMainPageScript = function() {
    //============================================================================
    // 개별 페이지에 사용하는 스크립트는 여기에 작성
    //--------------------
    
    //----------------------------------------------------------------------------
    //페이지 로딩시 기본값 세팅.
    var _componentpage = function() {

        //이전
        $(".prev-date").click(function(){
            //하루전 날짜 구하기
            const givenDate = new Date($(this).data('searchdate'));
            givenDate.setDate(givenDate.getDate() - 1);
            var formattedDate = givenDate.getFullYear() + '-' +
                                        String(givenDate.getMonth() + 1).padStart(2, '0') + '-' +
                                        String(givenDate.getDate()).padStart(2, '0');
            $('input[name="searchDate"]').val(formattedDate);
            actionSearch();
        });

        $(".next-date").click(function(){
            //다음날짜 구하기
            const givenDate = new Date($(this).data('searchdate'));
            givenDate.setDate(givenDate.getDate() + 1);
            var formattedDate = givenDate.getFullYear() + '-' +
                                        String(givenDate.getMonth() + 1).padStart(2, '0') + '-' +
                                        String(givenDate.getDate()).padStart(2, '0');
            $('input[name="searchDate"]').val(formattedDate);
            actionSearch();
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