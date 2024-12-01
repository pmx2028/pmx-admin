var settingValidator;
var settingFormModalPageScript = function() {
    //============================================================================
    // 개별 페이지에 사용하는 스크립트는 여기에 작성
    //--------------------
    
    //----------------------------------------------------------------------------
    //페이지 로딩시 기본값 세팅.
    var _componentpage = function() {
        //삭제버튼 hide
        $(".action-delete").hide();

        //저장버튼 event
        $('.action-submit').click(function(){
            $('#program_submit_form').submit();
        });

        //취소 / 닫기 버튼 event
        $(".action-close").click(function(){
            resetForm();
        });

        //----------------------------------------------------------------------------
        //닫기버튼, 상단 X 버튼 클릭 시
        var resetForm = function(){
            //form reset
            $("#program_submit_form")[0].reset();
            settingValidator.resetForm();
            $('html, body').removeClass('modal-open');
            //modal 닫기
            $("#program_modal_form").modal("hide");
        }

    }
    
    //----------------------------------------------------------------------------
    // Validation config
    // input type이 hidden 이거나 disabled일 경우 check pass.
    var _componentValidation = function() {
        if (!$().validate) {
            console.warn('Warning - validate.min.js is not loaded.');
            return;
        }

        // Initialize

        settingValidator = $('.form-validate-jquery').validate({
            ignore: 'input[type=hidden], .select2-search__field, :hidden, [contenteditable=\'true\']:not([name])', // ignore hidden fields
            errorClass: 'validation-invalid-label',
            successClass: 'validation-valid-label',
            validClass: 'validation-valid-label',
            highlight: function(element, errorClass) {
                $(element).removeClass(errorClass);
            },
            unhighlight: function(element, errorClass) {
                $(element).removeClass(errorClass);
            },
            // success: function(label) {
            //     // label.addClass('validation-valid-label').text('유효함.'); // remove to hide Success message
            // },
            // Different components require proper error label placement
            /**
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
                groupName:{
                    required:true,
                    normalizer: function (value) {
                        //Trim the value of element for whitespaces
                        return $.trim(value);
                     }
                } 
            },
            messages: {
                groupName: {
                    required: "그룹명을 입력하세요."
                }
            },
            */



            submitHandler: function() {
                if (confirm("입력하신 정보로  프로그램 등록 하시겠습니까?")){
                    var uploadFlag = false;
                    if ($("#addFile").val() != ""){
                        uploadFlag = ajaxFileUpload();
                    } else {
                        uploadFlag = true;
                    }
                    if (uploadFlag) ajaxSubmit();
                }


            }
        });
    };

    function ajaxSubmit(){
        //저장/수정에 따라 url 분기
        var url = "";
        if ($("#id").val() == ""){
            url = "/tvcms/tvPrograms/create";
        } else {
            url = "/tvcms/tvPrograms/update";
        }

        //ajax 호출
        ajaxSave(url);
    }

    function ajaxSave(url){
        $.ajax({
            cache : false,
            url : url,
            type : 'POST', 
            data : $("#program_submit_form").serializeArray(),
            async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다. 
            success : function(obj) {
                alert("처리되었습니다.");
                $(location).attr('href', $("#pageUrl").val());
            }, 
            error: function(xhr, status, error){
                ajaxError(xhr);
            }
        });
    }

    //썸네일  파일업로드
    function ajaxFileUpload(){
        $("#fileName").val('');
        $("#saveFileName").val('');
        $("#filePath").val('');

        //확장자 체크
        if (!fileExtCheck($("#addFile").val())){
            $("#addFile").val('');
            $("#addFileSpan").text('');
            alert("썸내일 이미지는 "+filePaperExt.join(", ")+" 형식의 파일만 업로드할 수 있습니다.");
            return false;
        }else if($("#addFile")[0].files[0].size > (15*(1024*1024))){
            //파일용량 확인
            $("#addFile").val('');
            $("#addFileSpan").text('');
            alert("파일용량은 15MB입니다. 파일 사이즈를 확인해주세요.");
            return false;
        } else {
            //파일 업로드 ajax
            var formData = new FormData();
            formData.append("addFile", $("#addFile")[0].files[0]);
            formData.append("filePath", "/regs/program");                                    //이미지 저장 경로
            $.ajax({
                url: '/common/fileUpload',
                data: formData,
                processData: false,
                contentType: false,
                enctype: 'multipart/form-data', // 필수
                type : 'POST',
                async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다.
                success: function(result){
                    if (result != ""){
                        $("#fileName").val(result.data[0].originalFileName);
                        $("#saveFileName").val(result.data[0].newFileName);
                        $("#filePath").val(result.data[0].filePath);
                        resultFlag = true;
                    } else {
                        alert("파일 사이즈가 기준사이즈보다 큽니다. 파일사이즈를 확인해주세요.");
                        resultFlag = false;
                    }
                }
            });
            return resultFlag;
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
    settingFormModalPageScript.init();
});