/* ------------------------------------------------------------------------------
*  # Login form with validation
* ---------------------------------------------------------------------------- */

// Setup module
var LoginValidation = function() {

    // Setup module components
    var _componentpage = function() {
        //로그인 페이지에서 아이디 입력 focus
        $("#login").focus();

       //get cookie
        var saveid = $.trim(getCookie("SAVEID_DC"));
        if (saveid != ""){
            $("#login").val(saveid);
            $("#saveid").prop("checked", true);
        } else {
            $("#login").val('');
            $("#saveid").prop("checked", false);
        }

        // ✅ 엔터로 제출: 폼 내 어떤 인풋에서든 Enter 누르면 submit
        $("#loginForm input").on("keydown", function(e){
            if (e.key === "Enter") {
                e.preventDefault();
                $("#loginForm").trigger("submit"); // validate가 가로채서 submitHandler 실행
            }
        });

        // ✅ 기존 로그인 버튼(앵커/버튼 어떤 것이든) 클릭 시에도 submit 이벤트로 통일
        //    (type="submit"이 아닐 가능성 대비)
        $(".btn-danger").on("click", function(e){
            e.preventDefault();
            $("#loginForm").trigger("submit");
        });
    }

    // Uniform
    var _componentUniform = function() {
        if (!$().uniform) {
            console.warn('Warning - uniform.min.js is not loaded.');
            return;
        }

        // Initialize
        $('.form-input-styled').uniform();
    };

    // Validation config
    var _componentValidation = function() {
        if (!$().validate) {
            console.warn('Warning - validate.min.js is not loaded.');
            return;
        }

        // Initialize
        var validator = $('.form-validate').validate({
            ignore: 'input[type=hidden], .select2-search__field', // ignore hidden fields
            errorClass: 'validation-invalid-label',
            successClass: 'validation-valid-label',
            validClass: 'validation-valid-label',
            highlight: function(element, errorClass) {
                $(element).removeClass(errorClass);
            },
            unhighlight: function(element, errorClass) {
                $(element).removeClass(errorClass);
            },
            success: function(label) {
                label.addClass('validation-valid-label').text('유효함.'); // remove to hide Success message
            },

            // Different components require proper error label placement
            errorPlacement: function(error, element) {

                // Unstyled checkboxes, radios
                if (element.parents().hasClass('form-check')) {
                    error.appendTo( element.parents('.form-check').parent() );
                }

                // Input with icons and Select2
                else if (element.parents().hasClass('form-group-feedback') || element.hasClass('select2-hidden-accessible')) {
                    error.appendTo( element.parent() );
                }

                // Input group, styled file input
                else if (element.parent().is('.uniform-uploader, .uniform-select') || element.parents().hasClass('input-group')) {
                    error.appendTo( element.parent().parent() );
                }

                // Other elements
                else {
                    error.insertAfter(element);
                }
            },
            rules: {
                login: {
                    minlength: 3
                },
                password: {
                    minlength: 4
                }
            },
            messages: {
                login: {
                    required: "아이디를 입력하세요.",
                    minlength: jQuery.validator.format("{0}자 이상 입력하세요.")
                },
                password: {
                    required: "비밀번호를 입력하세요.",
                    minlength: jQuery.validator.format("{0}자 이상 입력하세요.")
                }
            },
            submitHandler: function(form) {
                if($("input:checkbox[name=saveid]").is(":checked")) {
                    $.cookie("SAVEID_DC", $("input[name=login]").val(), {expires: 7, path : '/'});
                } else {
                    $.removeCookie("SAVEID_DC", { path: '/'});
                }
            
                ajaxLoginProc(form);
            }
        });
    }

    //영문(소), 영문(대), 숫자, 특수문자, 한글 key check
    _componentValidateEraser = function() {
        $("#login").inputEraser({
            maxlength: 16,
            hangul: false,
            english: true,
            ENGLISH: true,
            digits: true,
            space: false,
            special: true
        });
    }

    //cookie값 가져오기
    function getCookie(cookieName) { 
        cookieName = cookieName + '='; 
        var cookieData = document.cookie; 
        var start = cookieData.indexOf(cookieName); 
        var cookieValue = ''; 
        if(start != -1){ 
            start += cookieName.length; 
            var end = cookieData.indexOf(';', start); 
            if(end == -1) end = cookieData.length; 
            cookieValue = cookieData.substring(start, end); 
        } 
        return unescape(cookieValue); 
    }

    //login ajax
    function ajaxLoginProc(form){
        $.ajax({
            url : "/signin",
            type : "POST",
            dataType : "JSON",
            credentials: 'include',
            data : $("#loginForm").serializeArray()
        }).done(function(result) {
            if (result.success) { //로그인 성공
                locationUrl = "/login/success";
                location.href = locationUrl;
            } else {
                alert(result.message);
            }
        }).fail(function(request,status,error){
            alert(ajax_fail_message+"\ncode:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        });
    }

    // Return objects assigned to module
    return {
        init: function() {
            _componentpage();
            _componentUniform();
            _componentValidation();
        }
    }
}();

// Initialize module
document.addEventListener('DOMContentLoaded', function() {
    LoginValidation.init();
});