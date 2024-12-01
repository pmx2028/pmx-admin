var PageScript = function() {
    var listUrl = "/tvcms/tvVods"; //list url
    var krx_cont = $('#krx_matches');
    var prefix = "vod";

    //페이지 로딩시 기본값 세팅.
    var _componentpage = function() {
        //프로그램 선택시 초기화

        $("#programId").change(function(e){
            var selectBox = document.getElementById("programId");
            // 선택된 option의 name 속성 값 가져오기
            var  programName= selectBox.options[selectBox.selectedIndex].getAttribute("data-name");
            $("#programName").val(programName);
        });

        //저장버튼 event
        $('.action-submit').click(function(){

            if ($('select[name="programId"]').val() == "") {
               alert("프로그램을 선택하세요.");
                $("#programId").focus();
                return false;
            }

            if ($.trim($("input[name='vodName']").val()) == ""){
                alert("VOD 제목을 입력하세요.");
                $("#vodName").focus();
                return false;
            }
            if ($.trim($("input[name='youtubeUrl']").val()) == ""){
                alert("Youtube 주소을 입력하세요.");
                $("#youtubeUrl").focus();
                return false;
            }
            fielUpload();
        });


        var selectKRX = function(dom) {
            var v = $(dom).html();
            var _id_clue = /<code>([0-9]+)<\/code>/.exec(v);
            if(_id_clue && _id_clue[1]) {
                $("#" + prefix + "_ucode").val("");
                $("#" + prefix + "_ucode").blur();
                $("#" + prefix + "_ucode").focus();
                krx_cont.attr("data-q", "");
                krx_cont.html("").hide();
                addIDS("#" + prefix + "_krx_ids", _id_clue[1]);
                $("#selected_krxes").append("<li>" + v + "</li>")
            }
        }

        var removeKRX = function(dom) {
            var v = $(dom).html();
            var _id_clue = /<code>([0-9]+)<\/code>/.exec(v);
            if(_id_clue && _id_clue[1]) {
                removeIDS("#" + prefix + "_krx_ids", _id_clue[1]);
                $(dom).remove();
            }
        }


        var belong = $("#" + krx_cont.attr("data-rel"));
        var position = belong.position();
        // krx_cont.css({
        //     left: position.left,
        //     width: belong.outerWidth()
        // });

        $("#krx_matches").on("click", function(e) {
            var trigger = $(e.target);

            if(/li/i.test(trigger.prop("tagName"))) {
                selectKRX(trigger);
            }
        });


        $("#vod_ucode").on("keyup", function(e) {

            if(e.which == 13) { // ENTER

                var selected = krx_cont.find("li.selected");

                if(selected.length <= 0 && krx_cont.find("li").length > 0) {
                    selected = krx_cont.find("li:first-child");
                }

                if(selected.length > 0) {
                    selectKRX(selected);
                }

            } else if(e.which == 38) { // up

                e.preventDefault();
                var selected = krx_cont.find("li.selected");
                var target;
                if(selected.length > 0) {
                    target = selected.prev();
                    selected.removeClass("selected");
                }
                if(!target || target.length <= 0) target = krx_cont.find("li:last-child");
                target.addClass("selected");

            } else if(e.which == 40) { // down

                e.preventDefault();
                var selected = krx_cont.find("li.selected");
                var target;
                if(selected.length > 0) {
                    target = selected.next();
                    selected.removeClass("selected");
                }
                if(!target || target.length <= 0) target = krx_cont.find("li:first-child");
                target.addClass("selected");

            } else {
                var c = $(this).val();
                if(c && c != krx_cont.attr("data-q")) {
                    krx_cont.attr("data-q", c);
                    $.ajax({
                        url: '/setting/krxes/list?krxeName=' + encodeURI(c),
                        method: "GET",
                        success: function(result) {
                            krx_cont.html('').show();
                            var codeList = "";
                            for (var i=0; i<result.data.length; i++) {
                                codeList += "<li><code>" + result.data[i].id + "</code>" + result.data[i].name + "(" + result.data[i].code + ")</li>";
                            }
                            $('#krx_matches').html(codeList);
                        }
                    });
                }

            }

        });

        $("#selected_krxes").on("click", function(e) {
            var trigger = $(e.target);

            if(/li/i.test(trigger.prop("tagName"))) {
                if(confirm("삭제합니까?")) {
                    removeKRX(trigger);
                }
            }
        });

        $("#delete_img").on("click", function(e) {
            //var trigger = $(e.target);
            deleteImg();
        });

    }

    function fielUpload(){
        var confirmMsg = "";
        if ($("#id").val() == ""){
            confirmMsg ="입력하신 정보로 VOD를 등록 하시겠습니까?";
        } else {
            confirmMsg ="입력하신 정보로 VOD를 수정 하시겠습니까?";
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
    var _ajaxProgramList = function(){
        var result = ajaxProgramList(); //common_dcenter_ajax.js
        var optionHTML = "";
        if (result.success){
            for (var i=0; i<result.data.length; i++){
                optionHTML += "<option data-name='"+result.data[i].programName+"' value='"+result.data[i].id+"'>"+result.data[i].programName+"</option>";
            }
            $("#programId").append(optionHTML);
        }

        var temp_programId = $("#temp_programId").val()
        $("#programId").val(temp_programId).prop("selected", true);

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
    function addIDS(dom_id, v) {
        var duplicated = false;
        var $input = $(dom_id);

        var _vs = $input.val().split(",");
        if(_vs.indexOf(v) < 0) {
            _vs.push(v)
        } else {
            duplicated = true;
        }

        for(var i=0;i<_vs.length;i++) {
            if(_vs[i] == "" || _vs[i] == undefined) {
                _vs.splice(i,1);
                i--;
            }
        }

        $input.val(_vs.join(","));

        return duplicated;
    };
    function removeIDS(dom_id, v) {
        var $input = $(dom_id);

        var _vs = $input.val().split(",");
        var _idx = _vs.indexOf(v);
        if(_idx >= 0) {
            _vs.splice(_idx,1);
        }

        for(var i=0;i<_vs.length;i++) {
            if(_vs[i] == "" || _vs[i] == undefined) {
                _vs.splice(i,1);
                i--;
            }
        }

        $input.val(_vs.join(","));
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

    function deleteImg() {
        $("#addFile").val('');
        $("#fileName").val('');
        $("#saveFileName").val('');
        $("#filePath").val('');
        $("#view_img").hide();
    }
    
    // Return objects assigned to module
    return {
        init: function() {
            _componentpage();
            _ajaxProgramList();
        }
    }
}();

// Initialize module
document.addEventListener('DOMContentLoaded', function() {
    PageScript.init();
});