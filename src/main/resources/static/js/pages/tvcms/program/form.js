var PageScript = function() {
    //============================================================================
    // 개별 페이지에 사용하는 스크립트는 여기에 작성
    //--------------------
    var listUrl = "/tvcms/tvPrograms"; //list url
    //----------------------------------------------------------------------------
    //페이지 로딩시 기본값 세팅.
    var _componentpage = function() {

        //저장버튼 event
        $('.action-submit').click(function(){
            if ($.trim($("input[name='programName']").val()) == ""){
                alert("프로그램명을 입력하세요.");
                $("#programName").focus();
                return false;
            }
            if ($.trim($("input[name='broadStartDt']").val()) == ""){
                alert("방영시작일을 입력하세요.");
                $("#programName").focus();
                return false;
            }
            if ($.trim($("input[name='saveFileName']").val()) == ""){
                alert("타이틀이미지를 등록하세요.");
                $("#programName").focus();
                return false;
            }

            fielUpload();
        });
    }

    function fielUpload(){
        var confirmMsg = "";
        if ($("#id").val() == ""){
            confirmMsg ="입력하신 정보로 프로그램 등록 하시겠습니까?";
        } else {
            confirmMsg ="입력하신 정보로 프로그램 수정 하시겠습니까?";
        }
        if (confirm(confirmMsg)){
            var uploadFlag = false;
            if ($("#addFile").val() != ""){
                uploadFlag = ajaxFileUpload();
            } else {
                uploadFlag = true;
            }
            if (uploadFlag) ajaxSubmit();
        }
    }

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
                if ($("input[name='id']").val() != "" ){
                    alert("정보가 수정되었습니다. 목록으로 이동합니다.");
                    //pageparameter
                    if ($("#pageParam").val() != ""){
                        listUrl = listUrl + "?" + $("#pageParam").val();
                    }
                    $(location).attr('href',listUrl);
                } else{
                    alert("정보가 등록되었습니다. 목록으로 이동합니다.");
                    $(location).attr("href", listUrl);

                }
            },
            error: function(xhr, status, error){
                ajaxError(xhr);
            }
        });
    }

    //이미지  파일업로드
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
    PageScript.init();
});
