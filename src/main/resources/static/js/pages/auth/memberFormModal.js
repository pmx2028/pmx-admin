var settingValidator;
var settingFormModalPageScript = function() {
    //============================================================================
    // 개별 페이지에 사용하는 스크립트는 여기에 작성
    //--------------------

    //----------------------------------------------------------------------------
    //페이지 로딩시 기본값 세팅.
    var _componentpage = function() {
        //등록버턴 event
        $('.submit-modal-form-btn').click(function(){

            const form = document.getElementById('memberForm');

            if (form.login.val() == "") {
                alert("아이디를 입력하세요.");
                form.login.focus();
                return false;
            }
            if (form.login.readOnly === false) {
				alert('아이디 중복 체크를 완료해 주세요.');
				throw new Error();
			}
            if (form.password.val() == "") {
                alert("패스워드를 입력하세요.");
                form.password.focus();
                return false;
            }
			if (form.password.value !== form.passwordCheck.value) {
				alert('비밀번호가 일치하지 않습니다.');
				form.mebrPwCheck.focus();
				throw new Error();
			}
            if (form.name.val() == "") {
                alert("이름을 입력하세요.");
                form.name.focus();
                return false;
            }
            //체크 로직 추가
            modalAjaxSubmit();
        });
        //취소 / 닫기 버튼 event
        $(".action-close").click(function(){
            modalResetForm();
        });
    }

    function modalAjaxSubmit(){
        url = "/tvcms/schedule/update";
        //ajax 호출
        var modFlag = false;
        modFlag = modalAjaxSave(url);
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
            data : $("#memberForm").serializeArray(),
            async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다.
            success : function(obj) {
                alert("등록되었습니다.");
                resultFlag = true;
             },
            error: function(xhr, status, error){
                ajaxError(xhr);
                resultFlag = false;
            }

        });
        return resultFlag;
    }
        //닫기버튼, 상단 X 버튼 클릭 시
    var modalResetForm = function(){
        //form reset
        $("#modal_form")[0].reset();

        $('html, body').removeClass('modal-open');
        //modal 닫기
        $("#modal_form").modal("hide");
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
