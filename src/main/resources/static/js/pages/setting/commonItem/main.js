var settingFormValidator;
var SettingMainPageScript = function() {
    //============================================================================
    // 개별 페이지에 사용하는 스크립트는 여기에 작성
    //--------------------
    
    //----------------------------------------------------------------------------
    //페이지 로딩시 기본값 세팅.
    var _componentpage = function() {
        //삭제버튼 hide
        $(".action-delete").hide();
        //상위항목명 hide
        $(".item-title-div").hide();

        //초기 로딩시 하위 tr hide
        $("tr[class*='CHILD-']").hide();

        //상위 +, - 클릭시
        $(".child-control").click(function(){
            if ($(this).text() == "+"){
                $("tr[class$='"+$(this).data("targetClass")+"']").show();
                $(this).text('-');
            } else {
                $("tr[class$='"+$(this).data("targetClass")+"']").hide();
                $(this).text('+');
            }
        });

        //----------------------------------------------------------------------------
        //버튼 event 영역
        //작성버튼 event
        $('.action-form').click(function(){
            //system target 정보 넣기 (C:CMS, D:데이터센터)
            $("#systemTarget").val($(this).data("system-target")); 
            //선택한 위치별 depth 다름. top-작성버튼 : depth=1, 목록버튼 : depth=2,3
            $("#dumyId").val($(this).data("dumyid"));
            $("#depth").val($(this).data("depth"));
            $("#topParentId").val($(this).data("tparent"));
            $("#parentId").val($(this).data("parent"));

            //1depth에서는 입력시에는 노출되지 않음
            if ($(this).data("depth") != 1){
                //상위항목명 관련
                $("#itemTitle").val($(this).data("title"));
                $(".item-title-div").show();
            }

            if ($(this).data("id") != ""){
                //상세정보 불러오기
                _data = ajaxDetail("/setting/commonItem/detail", $(this).data("id"));
                $("#id").val(_data.id);
                $("#nameKor").val(_data.nameKor);
                $("#nameEng").val(_data.nameEng);
                $("#nameSimple").val(_data.nameSimple);
                $("#viewFlag").val(_data.viewFlag);
                $("#useFlag").val(_data.useFlag);
            }
            
            //입력, 수정폼 show
            $('#modal_form').modal("show");
        });
       
        //저장버튼 event
        $('.action-submit').click(function(){
            $('#submit_form').submit(); 
        });

        //취소 / 닫기 버튼 event
        $(".action-close").click(function(){
            resetForm();
        });
    }

    //----------------------------------------------------------------------------
    //닫기버튼, 상단 X 버튼 클릭 시
    var resetForm = function(){
        //form reset
        $("#submit_form")[0].reset();
        settingFormValidator.resetForm();
        $('html, body').removeClass('modal-open');
        //modal 닫기
        $("#modal_form").modal("hide");
        //depth 값 초기화
        $("#depth").val("");
        //system target값 초기화
        $("#systemTarget").val(""); 
        //상위항목명값 초기화
        $("#itemTitle").val("");
        //상위항목명 hide
        $(".item-title-div").hide();
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
        settingFormValidator = $('.form-validate-jquery').validate({
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
                nameKor:{
                    required:true,
                    normalizer: function (value) {
                        //Trim the value of element for whitespaces
                        return $.trim(value);
                     }
                } 
            },
            messages: {
                nameKor: {
                    required: "한글명을 입력하세요."
                }
            },
            submitHandler: function() {
                ajaxSubmit();
            }
        });
    };

    function ajaxSubmit(){
        //저장/수정에 따라 url 분기
        var url = "";
        if ($("#id").val() == ""){
            url = "/setting/commonItem/create";
        } else {
            url = "/setting/commonItem/update";
        }

        //ajax 호출
        ajaxSave(url);
    }

    function ajaxSave(url){
        $.ajax({
            cache : false,
            url : url,
            type : 'POST', 
            data : $("#submit_form").serializeArray(), 
            async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다. 
            success : function(obj) {
                alert("처리되었습니다.");
                document.location.reload();
            }, 
            error: function(xhr, status, error){
                ajaxError(xhr);
            }
        });
    }
    ajaxDetail
    // function ajaxDetail(url, id){
    //     $.ajax({
    //         cache : false,
    //         url : url,
    //         type : 'POST', 
    //         data : {"id" : id}, 
    //         async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다. 
    //         success : function(obj) {
    //             return obj.data;
    //             $("#id").val(data.id);
    //             $("#nameKor").val(data.nameKor);
    //             $("#nameEng").val(data.nameEng);
    //             $("#nameSimple").val(data.nameSimple);
    //             $("#viewFlag").val(data.viewFlag);
    //             $("#useFlag").val(data.useFlag);
    //         }, 
    //         error: function(xhr, status, error){
    //             ajaxError("ajaxView ERROR :: "+xhr);
    //         }
    //     });
    // }

    // Return objects assigned to module
    return {
        init: function() {
            _componentpage();
            _componentValidation();
        }
    }
}();

// Initialize module
document.addEventListener('DOMContentLoaded', function() {
    SettingMainPageScript.init();
});