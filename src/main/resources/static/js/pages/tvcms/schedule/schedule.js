var PageScript = function() {
    var listUrl = "/tvcms/tvVods"; //list url
    //페이지 로딩시 기본값 세팅.
    var _componentpage = function() {
        //프로그램 선택시 초기화

        /**
        $("#programId").change(function(e){
            var selectBox = document.getElementById("programId");
            // 선택된 option의 name 속성 값 가져오기
            var  schduleName= selectBox.options[selectBox.selectedIndex].getAttribute("data-name");
            $("#schduleName").val(schduleName);
        });
        */
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
        $(".now-date").click(function(){
            //다음날짜 구하기
            var nowDay = ($(this).data('searchdate'));
            nowDay = ("0" + nowDay).slice(-2);
            var searchDate = $('input[name="searchDate"]').val();
            var formattedDate = searchDate.substring(0,7)+"-"+nowDay;
            $('input[name="searchDate"]').val(formattedDate);
            actionSearch();
        });

        //저장버튼 event
        $('.submit-form-btn').click(function(){
            if ($('#schedule_submit_form input[name="scheduleDay"]').val() == "") {
                alert("편성일을 선택하세요.");
                $("#schedule_submit_form #scheduleDay").focus();
                return false;
            }

            if ($.trim($("#schedule_submit_form input[name='scheduleStTime']").val()) == ""){
                alert("방영시작시간을  입력하세요.");
                $("#schedule_submit_form #scheduleStTime").focus();
                return false;
            } else {
                var booleanChk = validateTime('scheduleStTime')
                if (!booleanChk) {
                    $("#schedule_submit_form #scheduleStTime").focus();
                    return false;
                }
            }

            if ($.trim($("#schedule_submit_form input[name='scheduleEdTime']").val()) == ""){
                alert("방영종료시간을  입력하세요.");
                $("#schedule_submit_form #scheduleEdTime").focus();
                return false;
            }else {
                var booleanChk = validateTime('scheduleEdTime')
                if (!booleanChk) {
                    $("#schedule_submit_form #scheduleEdTime").focus();
                    return false;
                }
            }
            if ($.trim($("#schedule_submit_form input[name='scheduleName']").val()) == ""){
                alert("프로그램명을  입력하세요.");
                $("#schedule_submit_form #scheduleName").focus();
                return false;
            }
            if ($.trim($("#schedule_submit_form input[name='scheduleSeq']").val()) == ""){
                alert("회차를  입력하세요.");
                $("#schedule_submit_form #scheduleSeq").focus();
                return false;
            }
            ajaxSubmit();
        });
        $("#schedule_submit_form #programId").change(function(e){
            var selectBox = document.querySelector("#schedule_submit_form #programId")
            // 선택된 option의 name 속성 값 가져오기
            var  programName= selectBox.options[selectBox.selectedIndex].getAttribute("data-name");
            $("#schedule_submit_form #scheduleName").val(programName);
        });
        $('#schedule_submit_form #scheduleSeq').on('input', function () {
            $(this).val($(this).val().replace(/[^0-9]/g, ''));
        });

        //수정버튼 event
        $(document).on('click', '.modify-btn', function() {
             var _data = "";
             if ($(this).data("scheduleid") !== undefined && $(this).data("scheduleid") != ""){
                 //상세정보 불러오기
                 _data = ajaxDetail("/tvcms/schedule/detail", $(this).data("scheduleid"));
             } else {
                 _data = "";
             }

             //입력, 수정폼 show
             if (_data == "") { //입력
                //  $('#program_modal_form').modal("show");
                //  $("#program_modal_form").on("shown.bs.modal", function () {
                //     $("#programName").focus();
                // });
             } else { //수정
                 if (_data != false) {

                     $("#schedule_modal_form #id").val(_data.id);
                     $("#schedule_modal_form #scheduleDay").val(_data.scheduleDay);
                     $("#schedule_modal_form #scheduleStTime").val(_data.scheduleStTime);
                     $("#schedule_modal_form #scheduleEdTime").val(_data.scheduleEdTime);
                     $("#schedule_modal_form #scheduleLongTime").val(_data.scheduleLongTime);
                     $("#schedule_modal_form #programId").val(_data.programId);
                     $("#schedule_modal_form #scheduleName").val(_data.scheduleName);
                     $("#schedule_modal_form #scheduleSeq").val(_data.scheduleSeq);
                     $("#schedule_modal_form #content").val(_data.content);

                     $("#schedule_modal_form select[name=scheduleLevel]").val(_data.scheduleLevel).prop("selected", true);


                     $("#schedule_modal_form input:radio[name=viewFlag]")
                         .filter(`[value='${_data.viewFlag}']`)
                         .prop("checked", true);

                     $("#schedule_modal_form input:checkbox[name=scheduleGubn]")
                         .filter(`[value='${_data.viewFlag}']`)
                         .prop("checked", true);

                     //$('input:radio[name="viewFlag"]:input[value="'+__data.viewFlag +'"]').prop("checked", true);

                     const scheduleGubn = _data.scheduleGubn.split(",");
                     $("#schedule_modal_form input:checkbox[name=scheduleGubn]").each(function () {
                         // 체크박스의 value가 배열 값에 포함되면 체크
                         if (scheduleGubn.includes($(this).val())) {
                             $(this).prop('checked', true);
                         } else {
                             $(this).prop('checked', false); // 배열에 없으면 체크 해제
                         }
                     });
                     //수정에서 초기화버튼 숨기기
                     //$(".action-corp-modal-reset").hide();
                     $('#schedule_modal_form').modal("show");


                 } else {
                     alert("오류입니다. 관리자에게 문의하세요.")
                     return false;
                 }
             }
         });
        $(document).on('click', '.destroy-btn', function() {
            var destroyFlag = false;
            var saveFldestroyFlag =  destroySchdduleData("/tvcms/schedule/destroy", $(this).data('scheduleid'));
            if (saveFldestroyFlag)  {
                _ajaxScheduleList();                        //리스트 RELOAD()
            }
        });

        document.getElementById('scheduleStTime' , 'scheduleEdTime').addEventListener('input', function (e) {
            const value = e.target.value;
            const pattern = /^([01]?\d|2[0-3]):?([0-5]?\d)?$/; // HH:mm 형식(부분 입력 허용)

            if (!pattern.test(value)) {
                e.target.value = value.slice(0, -1); // 잘못된 입력 제거
            }
        });

        //취소 / 닫기 버튼 event
        $(".action-reset").click(function(){
            resetForm();
        });

        var actionSearch = function(){
            //input box value 공백제거
            $('#search_form').inputTextTrim(); //common_utils.js
            $('#search_form').attr('action', $("#pageUrl").val());
            $("#search_form").submit();
        }

    }
    //----------------------------------------------------------------------------
    //닫기버튼, 상단 X 버튼 클릭 시
    function  resetForm(){
        //form reset
        //$("#schedule_update_form")[0].reset();
        $("#schedule_submit_form")[0].reset();

    }

    function ajaxSubmit(){
        url = "/tvcms/schedule/create";
        //ajax 호출
        var saveFlag = false;
        var saveFlag = ajaxSave(url);

        if (saveFlag)  {
            _ajaxScheduleList();                        //리스트 RELOAD()
        }
        resetForm();
    }
    //저장
    function ajaxSave(url){
        //저장/수정에 따라 url 분기
        var resultFlag = false;
        $.ajax({
            cache : false,
            url : url,
            type : 'POST',
            data : $("#schedule_submit_form").serializeArray(),
            async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다.
            success : function(obj) {
                alert("정보가 등록되었습니다.");
                resultFlag = true;              //리스트
            },
            error: function(xhr, status, error){
                ajaxError(xhr);
                resultFlag = false;
            }
        });
        return resultFlag;
    }

    var _ajaxScheduleList= function() {
        var result = ajaxScheduleList(); //common_dcenter_ajax.js
        var innerHtml = "";
        if (result.success){
            $("#tbodyList").empty();
            for (var i=0; i<result.data.length; i++) {
                innerHtml += "<tr className=''>"
                    + "<td>" + result.data[i].scheduleStTime + "</td>"
                    + "<td>" + result.data[i].scheduleEdTime + "</td>"
                    + "<td className='tleft'><a href='#' tabIndex='0'>" + result.data[i].scheduleName + "</a></td>"
                    + "<td>" + result.data[i].scheduleSeq + "</td>"
                    + "<td>" + result.data[i].scheduleLevelNm + "</td>"
                    + "<td>" + result.data[i].scheduleGubnNm + "</td>"
                    + "<td>" + result.data[i].viewFlagNm + "</td>"
                    + "<td>"
                    + "<a href='#' class='btn btn-outline-success modify-btn badge' data-scheduleid ='"+ result.data[i].id +"'>수정</a>"
                    + "<a href='#' class='btn btn-outline-danger destroy-btn badge' data-scheduleid ='"+ result.data[i].id +"'>삭제</a>"
                    + "</td>"
                 + "</tr>";

            }
            $("#tbodyList").append(innerHtml);
        }
    }

    function ajaxScheduleList() {
        var searchDate = $("input[name='searchDate']").val();
        var result;
        $.ajax({
            cache: false,
            url : "/tvcms//schedule/list",
            type : 'GET',
            data : {"searchDate" : searchDate},
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
    function destroySchdduleData(url, key, listUrl){
        var result = false;
        if (confirm("정보를 삭제합니다. 삭제된 정보는 복구할 수 없습니다.\n정말로 삭제하시겠습니까?")) {
            $.ajax({
                cache : false,
                url : url,
                type : 'GET',
                data : {"id" : key},
                async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다.
                success : function(obj) {
                    alert("정보가 삭제되었습니다.");
                    result = true;

                },
                error: function(xhr, status, error){
                    ajaxError(xhr);
                    result = false;
                }
            });
            return result;
        }
    }
    function validateTime(id) {
        const timeInput = document.getElementById(id).value;
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
            _ajaxScheduleList();
        },
        modalbackCall:function() {
            //_ajaxScheduleList();
        }

    }
}();

function modalCloseCall() {
    PageScript.modalbackCall();

}

// Initialize module
document.addEventListener('DOMContentLoaded', function() {
    PageScript.init();
});
