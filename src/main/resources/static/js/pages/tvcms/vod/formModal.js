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
            //체크로직 추가
            $('#vod_submit_form').submit();
        });

        //기업검색기준 변경 시 기업명 검색값 초기화
        $("#programId").change(function(e){
            var selectBox = document.getElementById("programId");
            // 선택된 option의 name 속성 값 가져오기
            var  programName= selectBox.options[selectBox.selectedIndex].getAttribute("data-name");
            $("#programName").val(programName);
        });

        //취소 / 닫기 버튼 event
        $(".action-close").click(function(){
            resetForm();
        });

        //----------------------------------------------------------------------------
        //닫기버튼, 상단 X 버튼 클릭 시
        var resetForm = function(){
            //form reset
            $("#vod_submit_form")[0].reset();
            settingValidator.resetForm();
            $('html, body').removeClass('modal-open');
            //modal 닫기
            $("#vod_modal_form").modal("hide");
        }

    }

    var _ajaxProgramList = function(){
        var result = ajaxProgramList(); //common_dcenter_ajax.js
        var optionHTML = "";
        if (result.success){
            for (var i=0; i<result.data.length; i++){
                optionHTML += "<option data-name='"+result.data[i].programName+"' value='"+result.data[i].id+"'>"+result.data[i].programName+"</option>";
            }

            $("#programId").append(optionHTML);
        }
    }

    function ajaxSubmit(){
        //저장/수정에 따라 url 분기
        var url = "";
        if ($("#id").val() == ""){
            url = "/tvcms/tvVods/create";
        } else {
            url = "/tvcms/tvVods/update";
        }

        //ajax 호출
        ajaxSave(url);
    }

    function ajaxSave(url){
        $.ajax({
            cache : false,
            url : url,
            type : 'POST', 
            data : $("#vod_submit_form").serializeArray(),
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
            formData.append("filePath", "/regs/vod");                                    //이미지 저장 경로
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
    function ajaxProgramList(){
        var result;
        $.ajax({
            cache : false,
            url : "/tvcms/tvPrograms/list",
            type : 'GET',
            data : {},
            async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다.
            success : function(obj) {
                result = obj;
            },
            error: function(xhr, status, error){
                ajaxError("tvProgram List ERROR :: "+ xhr);
                result = false;
            }
        });

        return result;
    }


    // Return objects assigned to module
    return {
        init: function() {
            _componentpage();
            _componentValidation();
            _ajaxProgramList()
        }
    }
}();

// Initialize module
document.addEventListener('DOMContentLoaded', function() {
    settingFormModalPageScript.init();
});