var settingValidator;
var settingFormModalPageScript = function() {
    //============================================================================
    // 개별 페이지에 사용하는 스크립트는 여기에 작성
    //--------------------
    
    //----------------------------------------------------------------------------
    //페이지 로딩시 기본값 세팅.
    var _componentpage = function() {
        //수정버튼 event
        $('.submit-modal-form-btn').click(function(){

            if ($('#schedule_update_form input[name="scheduleDay"]').val() == "") {
                alert("편성일을 선택하세요.");
                $("#schedule_update_form #scheduleDay").focus();
                return false;
            }

            if ($.trim($("#schedule_update_form input[name='scheduleStTime']").val()) == ""){
                alert("방영시작시간을  입력하세요.");
                $("#schedule_update_form #scheduleStTime").focus();
                return false;
            } else {
                var booleanChk = validateTime('scheduleStTime')
                if (!booleanChk) {
                    $("#schedule_update_form #scheduleStTime").focus();
                    return false;
                }
            }
            if ($.trim($("#schedule_update_form input[name='scheduleEdTime']").val()) == ""){
                alert("방영종료시간을  입력하세요.");
                $("#schedule_update_form #scheduleEdTime").focus();
                return false;
            } else {
                var booleanChk = validateTime('scheduleEdTime')
                if (!booleanChk) {
                    $("#schedule_update_form #scheduleEdTime").focus();
                    return false;
                }
            }
            if ($.trim($("#schedule_update_form input[name='scheduleName']").val()) == ""){
                alert("프로그램명을  입력하세요.");
                $("#schedule_update_form #scheduleName").focus();
                return false;
            }
            if ($.trim($("#schedule_update_form input[name='scheduleSeq']").val()) == ""){
                alert("회차를  입력하세요.");
                $("#schedule_update_form #scheduleSeq").focus();
                return false;
            }
            //체크 로직 추가
            modalAjaxSubmit();
        });
        //취소 / 닫기 버튼 event
        $(".action-close").click(function(){
            modalResetForm();
        });
        $("#schedule_update_form #programId").change(function(e){
            //var selectBox = document.getElementById("programId");

            var selectBox = document.querySelector("#schedule_update_form #programId")
            // 선택된 option의 name 속성 값 가져오기
            var  programName= selectBox.options[selectBox.selectedIndex].getAttribute("data-name");
            $("#schedule_update_form #scheduleName").val(programName);
        });

        $('#schedule_update_form #scheduleSeq').on('input', function () {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });



    }
    //닫기버튼, 상단 X 버튼 클릭 시
    var modalResetForm = function(){
        //form reset
        //$("#schedule_update_form")[0].reset();
        $("#schedule_update_form")[0].reset();

        $('html, body').removeClass('modal-open');
        //modal 닫기
        $("#schedule_modal_form").modal("hide");
    }

    function modalAjaxSubmit(){
        url = "/tvcms/schedule/update";
        //ajax 호출
        var modFlag = false;
        var modFlag = modalAjaxSave(url);

        if (modFlag)  {
            modalResetForm();                        //닫기버튼
            modalCloseCall();
        }
    }

    function modalAjaxSave(url){
        var resultFlag = false;
        $.ajax({
            cache : false,
            url : url,
            type : 'POST', 
            data : $("#schedule_update_form").serializeArray(),
            async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다. 
            success : function(obj) {
                alert("처리되었습니다.");
                resultFlag = true;
             },
            error: function(xhr, status, error){
                ajaxError(xhr);
                resultFlag = false;
            }

        });
        return resultFlag;
    }
    function validateTime(id) {

        const form = document.getElementById("schedule_update_form");
        const timeInput = form.querySelector('#'+id).value;
        //const item = document.getElementById(id);
        //const timeInput = form.appendChild(item).value;
        const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:mm 형식

        if (!timePattern.test(timeInput)) {
            alert('시간은 HH:mm 형식으로 입력해야 합니다.');
            return false;
        }
        return true;
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
    settingFormModalPageScript.init();
});