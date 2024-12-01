jQuery.fn.serializeObject = function() {
    var obj = null;
    try {
        if (this[0].tagName && this[0].tagName.toUpperCase() == "FORM") {
            var arr = this.serializeArray();
            if (arr) {
                obj = {};
                jQuery.each(arr, function() {
                    obj[this.name] = this.value;
                });
            }//if ( arr ) {
        }
    } catch (e) {
        alert(e.message);
    } finally {
    }
 
    return obj;
};

//byte 용량계산
function bytesToSize(bytes) {

    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];   
}

function nowDate(){
    var d = new Date();
    var dateStrY = d.getFullYear();
    var dateStrM = ((d.getMonth()+1)+"").length == 1 ? "0"+(d.getMonth()+1)+"" : d.getMonth()+1;
    var dateStrD = (d.getDate()+"").length == 1 ? "0"+(d.getDate()+"") : d.getDate();
    var dateStr = dateStrY+"-"+dateStrM+"-"+dateStrD;

    return dateStr;
}

function nowDateHangul(){
    var d = new Date();
    var dateStrY = d.getFullYear();
    var dateStrM = ((d.getMonth()+1)+"").length == 1 ? "0"+(d.getMonth()+1)+"" : d.getMonth()+1;
    var dateStrD = (d.getDate()+"").length == 1 ? "0"+(d.getDate()+"") : d.getDate();
    var dateStr = dateStrY+"년 "+dateStrM+"월 "+dateStrD+"일";

    return dateStr;
}

function nowDateTime(){
    var d = new Date();

    var dateStrY = d.getFullYear();
    var dateStrM = ((d.getMonth()+1)+"").length == 1 ? "0"+(d.getMonth()+1)+"" : d.getMonth()+1;
    var dateStrD = (d.getDate()+"").length == 1 ? "0"+(d.getDate()+"") : d.getDate();
    var dateStr = dateStrY+"-"+dateStrM+"-"+dateStrD;

    var timeStrH = (d.getHours()+"").length == 1 ? "0"+(d.getHours()+"") : d.getHours();
    var timeStrM = ((d.getMinutes()+1)+"").length == 1 ? "0"+(d.getMinutes()+1)+"" : d.getMinutes()+1;

    var timeStr = timeStrH +":"+timeStrM;

    return dateStr+" "+timeStr;
}

function nowDateTimeMilliseconds(){
    var d = new Date();
    return d.getTime();
}

function convertDate(string){
    var dateStrY = string.split("-")[0];
    var dateStrM = (string.split("-")[1]+"").length == 1 ? "0"+(string.split("-")[1]+"") : string.split("-")[1];
    var dateStrD = (string.split("-")[2]+"").length == 1 ? "0"+(string.split("-")[2]+"") : string.split("-")[2];
    var dateStr = dateStrY+"-"+dateStrM+"-"+dateStrD;

    return dateStr;
}

function convertDateTime(string){
    var splitData = string.split[" "];

    var dateStrY = splitData[0].split("-")[0];
    var dateStrM = (splitData[0].split("-")[1]+"").length == 1 ? "0"+(splitData[0].split("-")[1]+"") : splitData[0].split("-")[1];
    var dateStrD = (splitData[0].split("-")[2]+"").length == 1 ? "0"+(splitData[0].split("-")[2]+"") : splitData[0].split("-")[2];
    var dateStr = dateStrY+"-"+dateStrM+"-"+dateStrD;

    var timeStrH = (splitData[1].split(":")[0]+"").length == 1 ? "0"+(splitData[1].split(":")[0]+"") : splitData[1].split(":")[0];
    var timeStrM = (splitData[1].split(":")[1]+"").length == 1 ? "0"+(splitData[1].split(":")[1]+"") : splitData[1].split(":")[1];
    var timeStr = timeStrH +":"+timeStrM;

    return dateStr+" "+timeStr;
}

//[년,월,일,시,분]
function convertArrayToDateTime(dateTimeArray){
    var dateStrY = dateTimeArray[0];
    var dateStrM = (dateTimeArray[1]+"").length == 1 ? "0"+(dateTimeArray[1]+"") : dateTimeArray[1];
    var dateStrD = (dateTimeArray[2]+"").length == 1 ? "0"+(dateTimeArray[2]+"") : dateTimeArray[2];
    var dateStr = dateStrY+"-"+dateStrM+"-"+dateStrD;

    var timeStrH = (dateTimeArray[3]+"").length == 1 ? "0"+(dateTimeArray[3]+"") : dateTimeArray[3];
    var timeStrM = (dateTimeArray[4]+"").length == 1 ? "0"+(dateTimeArray[4]+"") : dateTimeArray[4];
    var timeStr = timeStrH +":"+timeStrM;

    return dateStr+"T"+timeStr;
}

// 이전 년.월.일 구하기
function lastMonth(month) {

    // var test_date = '2025-03-31';
    // var nowDate = moment(test_date);

    var nowDate = moment();
    var d = nowDate.clone().subtract(month,'month').add(1,'d').format('YYYY-MM-DD');

    return d;
}

//br 적용
function nl2br(str){  
    return str.replace(/\n/g, "<br />");  
}  

//숫자값 --> 요일 리턴
function getWeekName(str, flag){
    var week = ['월', '화', '수', '목', '금', '토', '일'];
    var dayOfWeek = week[str-1];
    if (flag){
        dayOfWeek = dayOfWeek+"요일";
    }
    return dayOfWeek;
}

//날짜로 요일 찾기
function getDayWeekName(str) { 
    var weekName = new Array('일','월','화','수','목','금','토'); 
    var year = str.split("-")[0]; 
    var month = str.split("-")[1]; 
    var day = str.split("-")[2]; 
    var week = new Date(year, month-1, day, 0,0,0,0); 
    
    week = weekName[week.getDay()]; 
    return week; 
}

//날짜로 요일 숫자값 찾기
function getDayWeekIndex(str) { 
    var year = str.split("-")[0]; 
    var month = str.split("-")[1]; 
    var day = str.split("-")[2]; 
    var week = new Date(year, month-1, day, 0,0,0,0); 
    
    week = week.getDay(); 
    return week; 
}

//두 날짜 사이 차이값 (startDt:시작일자, endDt:종료일자, 반환타입:D-일수, M-월수, Y-년수)
//날짜형식 : YYYY-MM-DD
function getDateDiff(startDt, endDt, returnType){
    var dt1 = new Date(startDt);
    var dt2 = new Date(endDt);

    var diff = dt2 - dt1;
   
    var day = 1000 * 60 * 60 * 24; //밀리세컨초 * 초 * 분 * 시간
    var month = day * 30;
    var year = month * 12;
    
    //윤년포함일수 체크
    var leapDayArray = checkLeapDay(getDatesStartToLast(startDt, endDt));
    var elapsedDay = (diff / day) - leapDayArray.length; //윤년일수 빼기

    if (returnType == "D"){
        return parseInt(diff/day);
    } else if (returnType == "M"){
        return parseInt(diff/month);
    } else if (returnType == "Y"){
        return parseInt(diff/year);
    } else if (returnType == "YD"){
        if (elapsedDay <= 0){
            return ("0Y 0D");
        } else if(elapsedDay < 365) {
            return ("0Y "+elapsedDay + "D");
        } else {
            year  = Math.floor(elapsedDay/365);
            day   = elapsedDay - (year*365);
            return (year + "Y " + day + "D");
        }
    } else if (returnType == "YMD"){
        if (elapsedDay <= 0){
            return ("0D");
        } else  if(elapsedDay < 30) {
            return ("0Y0M" + elapsedDay + "D");
        } else if (elapsedDay < 365) {
            month = Math.floor(elapsedDay/30);
            day   = elapsedDay - (month * 30);
            return ("0Y" + month + "M" + day + "D");
        } else {
            year  = Math.floor(elapsedDay/365);
            month = Math.floor((elapsedDay-(year*365))/30) 
            day   = elapsedDay - (year*365); //시작날짜, 종료날짜 미포함으로 2를 빼준다.
            return (year + "Y" + month + "M" + day + "D");
        }
    } 
}

// yyyy-mm-dd 형식의 문자열로 시작날짜와 마지막 날짜를 받아, 시작 날짜와 마지막 날짜 사이의 모든 날짜를 yyyy-mm-dd 형식의 문자로 배열에 담아 반환하는 함수
function getDatesStartToLast(startDate, lastDate) {
	var regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);
	if(!(regex.test(startDate) && regex.test(lastDate))) return "Not Date Format";
	var result = [];
	var curDate = new Date(startDate);
	while(curDate <= new Date(lastDate)) {
		result.push(curDate.toISOString().split("T")[0]);
		curDate.setDate(curDate.getDate() + 1);
	}
	return result;
}

//윤달/일 체크
function checkLeapDay(element) {
    var result = element.filter(function (sentence) {
        return sentence.indexOf('02-29') != -1;
    });

    return result;
  } 
  

//현재달의 몇번째 주인지, 1~5번째 주, 숫자반환
function getWeekNo(str) {
    var date = new Date();
    if(str){
        date = new Date(str);
    }
    return Math.ceil(date.getDate() / 7);
}

//mobile, pc 모드 체크
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ? true : false;
jQuery(document).ready(function($){ 
     if(!isMobile) {
        $(".desktop-mode").show();
        $(".mobile-mode").hide();
     } else {
        $(".desktop-mode").hide();
        $(".mobile-mode").show();
     }

    //input 관련 로딩 이벤트 모음.
    initInputReload();
});

//input 관련 로딩 이벤트 모음.
function initInputReload(){
    //input type="text"에서 esc키 눌렀을 경우 해당 값 지우기
    $('input[type="text"], input[type="date"], input[type="datetime-local"]').keydown(function(e){
        if(e.keyCode == 27) {
            $(this).val('');
            $(this).attr("value", "");
        }
    });

    //input type="text"에 focus될 경우 value select, auotcomplet 없애기 
    $('input[type="text"]').focus(function() { 
        $(this).select();
        $(this).attr("autocomplete","off"); 
    } );

    //log out
    $(".navbar_logout").on("click", function () {
        $("form[name='logoutForm']").submit();
    });

    //comma-type css event (숫자확인. comma 찍기)
    $(".comma-type").on("keyup", function(e) {
        inputNumberFormat(this);
    });

    //comma-type css event (숫자확인. comma, dot 찍기)
    $(".comma-dot-type").on("keyup", function(e) {
        inputNumberDotFormat(this);
    });
}

//콤마찍기
function comma(str) {
    str = String(str);
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

//콤마풀기(dot 포함)
function uncommadot(str) {
    str = String(str);
    var minus = str.substring(0, 1);

    str = str.replace(/[^\d.]+/g, '');

    if (minus == "-"){
        str = minus+str;
    }
    return str;
}

//콤마풀기(dot 미포함)
function uncomma(str) {
    str = String(str);
    var minus = str.substring(0, 1);

    str = str.replace(/[^\d]+/g, '');

    if (minus == "-"){
        str = minus+str;
    }
    return str;
}

//숫자만 사용할 수 있는 함수(+콤마)
function inputNumberFormat(obj) {
    obj.value = comma(uncomma(obj.value));
}

//숫자만 사용할 수 있는 함수(콤마X)
function inputOnlyNumberFormat(obj) {
    obj.value = onlynumber(uncomma(obj.value));
}

//숫자만 입력 (음수 O)
function minusonlynumber(str) {
    str = String(str);
    var minus = str.substring(0, 1);
    return minus+str.replace(/[^0-9]-/g,"");
}

//숫자만 입력 (음수 X)
function onlynumber(str) {
    str = String(str);

    return str.replace(/[^0-9]-/g,"");
}

//숫자만 사용할 수 있는 함수(+콤마+dot)
function inputNumberDotFormat(obj) {
    obj.value = comma(uncommadot(obj.value));
}

//outerHTML
$.fn.outerHTML = function () {
    return $(this).clone().wrapAll("<div />").parent().html();
}

//this form -> input type="text" value 공백제거
$.fn.inputTextTrim = function () {
    $(this).find('input:text').each(function(){
        $(this).val($.trim($(this).val()));
    });
}

//오른쪽 공백 제거
function rtrim(str){
    return str.replace(/\s+$/, "");
}

//왼쪽공백 제거
function ltrim(str){
    return str.replace(/^\s+/, "");
}


function excelReqSend(url, filename){
    var datatime = nowDateTimeMilliseconds();
        $('.blurBackground').addClass("visible");
        const req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.responseType = "arraybuffer";
        req.onload = function() {
            const arrayBuffer = req.response;
            if (arrayBuffer) {
                var blob = new Blob([arrayBuffer], {type: "application/octetstream"});
                var link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = filename+"_"+datatime+".xlsx";
                link.click();
                $('.blurBackground').removeClass("visible");
            }
        }
        req.send();
}

//export excel
//url : parameter가 적용된 download url. filename:download 파일명.
function exportFile(start, end, url, filename){
    var startDate = new Date(start);
    var endDate = new Date(end);

    var monthAddDate = new Date(start);
    monthAddDate.setMonth(startDate.getMonth() + 6);
    monthAddDate.setDate(startDate.getDate() - 1);

    if (start != "" && end != "" && endDate <= monthAddDate) {
        excelReqSend(url, filename);
    } else {
        alert("다운로드 최대기간은 6개월입니다. 검색기간을 선택 후 조회버튼을 눌러주세요.");
        return false;
    }

    // var start_date_arr = start.split("-");
    // var end_date_arr = end.split("-");
    // var numberOfMonths = (end_date_arr[0] - start_date_arr[0]) * 12 + (end_date_arr[1] - start_date_arr[1]) + 1;
    // if (start != "" && end != "" && numberOfMonths*1 <= 6){
    //     excelReqSend(url, filename);
    // } else {
    //     alert("다운로드 최대기간은 6개월입니다. 검색기간을 선택 후 조회버튼을 눌러주세요.");
    //     return false;
    // }
}


// 다운로드기간 1년
function exportFileYear(start, end, url, filename){
    var startDate = new Date(start);
    var endDate = new Date(end);

    var yearAddDate = new Date(start);
    yearAddDate.setFullYear(startDate.getFullYear() + 1);
    yearAddDate.setDate(startDate.getDate() - 1);

    if (start != "" && end != "" && endDate <= yearAddDate) {
        excelReqSend(url, filename);
    } else {
        alert("다운로드 최대기간은 1년입니다. 검색기간을 선택 후 조회버튼을 눌러주세요.");
        return false;
    }
    // console.log(Math.abs(endDate.getFullYear() - startDate.getFullYear()));
    // console.log( Math.abs((newDate.getFullYear() - oldDate.getFullYear())*12 + (newDate.getMonth() - oldDate.getMonth())));
    // var start_date_arr = start.split("-");
    // var end_date_arr = end.split("-");

    // console.log(start_date_arr[1]);
    // console.log(end_date_arr[1]);
    // var addMonth = 0;
    // if (end_date_arr[1] < start_date_arr[1]) {
    //     addMonth = 1;
    // }
    // var numberOfMonths = (end_date_arr[0] - start_date_arr[0]) * 12 + (end_date_arr[1] - start_date_arr[1]) + addMonth;
    // console.log(start_date_arr);
    // console.log(end_date_arr);
    // console.log(numberOfMonths);
    // if (start != "" && end != "" && numberOfMonths*1 <= 12){
    //     // excelReqSend(url, filename);
    // } else {
    //     alert("다운로드 최대기간은 1년입니다. 검색기간을 선택 후 조회버튼을 눌러주세요.");
    //     return false;
    // }
}


//url : parameter가 적용된 download url. filename:download 파일명.
//기간제한 없는 데이터 다운로드
function unlimitedExportFile(url, filename){
    var datatime = nowDateTimeMilliseconds();
    $('.blurBackground').addClass("visible");
    const req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = "arraybuffer";
    req.onload = function() {
        const arrayBuffer = req.response;
        if (arrayBuffer) {
            var blob = new Blob([arrayBuffer], {type: "application/octetstream"});
            var link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = filename+"_"+datatime+".xlsx";
            link.click();
            $('.blurBackground').removeClass("visible");
        }
    }
    req.send();
}
//byte 용량계산
function bytesToSize(bytes) {

    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

//파일 확장자 체크
var filePaperExt = ["gif", "jpg", "jpge", "png", "pdf"];
function fileExtCheck(obj){
    ext = obj.split(".").pop().toLowerCase();
    if ($.inArray(ext, filePaperExt) == -1){
        return false;
    } else {
        return true;
    }
}

// excel.js
const excelHandler = {
    createWorkbook : function(){
        return new ExcelJS.Workbook();
    },
    createWorksheet : function(workbook, sheetName){
        workbook.addWorksheet(sheetName);
        return workbook.getWorksheet(sheetName);
    },
    getRange : function(worksheet, startRowNum, startColNum, endRowNum, endColNum){
        var rowList = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
        var cells = [];
        for(let i=startRowNum-1; i < endRowNum; i++){
            for(let j=startColNum; j <= endColNum; j++){
                cells.push(worksheet.getCell(rowList[i]+j));
            }
        }
        return cells;
    },
    excelFileExport : function(workbook, filename) {
        workbook.xlsx.writeBuffer().then((data) => {
            const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename;
            anchor.click();
            window.URL.revokeObjectURL(url);
        })
    },
    jsonToWorksheet : function(worksheet, data) {
        // 텍스트값인 경우 붙여넣기
        if(typeof data == 'string'){
            worksheet.addRow([data]);
        }else {
            if(typeof data[0] == 'string'){
                // 개별 row 값인 경우 붙여넣기

            }else{
                // row의 list인 경우 순차적으로 붙여넣기
                for(let i=0; i < data.length; i++){
                    worksheet.addRow(data[i]);
                }
            }
        }
    },
    tableToWorksheet : function(worksheet, tableId, rowNumber, formatList) {
        //헤더 데이터 만들기
        var headerColumn = [];
        var headerData = [];
        $("#"+tableId).find("th").each(function(i){
            // 서식만 잡아주기 위한 column 데이터
            // width min이랑 max 잡기
            var width = $(this).width() < 60
                            ? 80/8
                            : 300 < $(this).width()
                                ? 300/8
                                : $(this).width()/8
            // 헤더의 정보만 담는 배열
            headerColumn.push({
                    key: 'key'+i
                    , width: width
                    , style: {
                        numFmt: formatList == undefined ? '@' : formatList[i]
                    }
                });
            // 실제로 들어갈 텍스트
            headerData.push($(this).text());
        });
        worksheet.columns = headerColumn;

        //헤더를 시트 row에 붙여넣기
        rowNumber = rowNumber != undefined ? rowNumber : 1;
        worksheet.getRow(rowNumber).values = headerData;
        worksheet.getRow(rowNumber).font = {bold:true};

        // 헤더 색상 수정
        $("#"+tableId).find("th").each(function(i){
            worksheet.getRow(rowNumber).getCell(i+1).fill = {
                type: 'pattern',
                pattern:'solid',
                fgColor:{ argb:'cccccc' }
            }
        });

        //내용 데이터 만들기
        $("#"+tableId).find("tr").each(function(i){
            rowNumber += 1;
            if($(this).find("td").length > 0){
                var row = {};
                $(this).find("td").each(function(j){
                    var val;
                    //데이터 서식 배열 넘겨받은걸 기반으로 테이블 text -> 포맷 전환. (배열이 비어있으면 그냥 텍스트로 입력)
                    switch (headerColumn[j].style.numFmt){
                        case '#,##0' :
                            val = parseFloat($(this).text().replaceAll(',','')) || $(this).text();
                            break;
                        case '0.##\"%\"' :
                            val = parseFloat($(this).text().replaceAll(',','').replace('%','')) || '';
                            break;
                        default:
                            val = $(this).text();
                            break;
                    }
                    row['key'+j] = $.trim(val);
                });
                //시트에 row 밀어넣기
                worksheet.addRow(row);
            }
        });

        // 푸터 색상 수정
        $("#"+tableId).find("th").each(function(i){
            worksheet.getRow(rowNumber-1).getCell(i+1).fill = {
                type: 'pattern',
                pattern:'solid',
                fgColor:{ argb:'cccccc' }
            }
        });
    },
    tableToWorksheetNoFooter : function(worksheet, tableId, rowNumber, formatList) {
        //헤더 데이터 만들기
        var headerColumn = [];
        var headerData = [];
        $("#"+tableId).find("th").each(function(i){
            // 서식만 잡아주기 위한 column 데이터
            // width min이랑 max 잡기
            var width = $(this).width() < 60
                            ? 80/8
                            : 300 < $(this).width()
                                ? 300/8
                                : $(this).width()/8
            // 헤더의 정보만 담는 배열
            headerColumn.push({
                    key: 'key'+i
                    , width: width
                    , style: {
                        numFmt: formatList == undefined ? '@' : formatList[i]
                    }
                });
            // 실제로 들어갈 텍스트
            headerData.push($(this).text());
        });
        worksheet.columns = headerColumn;

        //헤더를 시트 row에 붙여넣기
        rowNumber = rowNumber != undefined ? rowNumber : 1;
        worksheet.getRow(rowNumber).values = headerData;
        worksheet.getRow(rowNumber).font = {bold:true};

        // 헤더 색상 수정
        $("#"+tableId).find("th").not(".modify-th").each(function(i){
            worksheet.getRow(rowNumber).getCell(i+1).fill = {
                type: 'pattern',
                pattern:'solid',
                fgColor:{ argb:'cccccc' }
            }
        });

        //내용 데이터 만들기
        $("#"+tableId).find("tr").each(function(i){
            rowNumber += 1;
            if($(this).find("td").not(".modify-td").length > 0){
                var row = {};
                $(this).find("td").not(".modify-td").each(function(j){
                    var val;
                    //데이터 서식 배열 넘겨받은걸 기반으로 테이블 text -> 포맷 전환. (배열이 비어있으면 그냥 텍스트로 입력)
                    switch (headerColumn[j].style.numFmt){
                        case '#,##0' :
                            val = parseFloat($(this).text().replaceAll(',','')) || $(this).text();
                            break;
                        case '0.##\"%\"' :
                            val = parseFloat($(this).text().replaceAll(',','').replace('%','')) || '';
                            break;
                        default:
                            val = $(this).text();
                            break;
                    }
                    row['key'+j] = $.trim(val);
                });
                //시트에 row 밀어넣기
                worksheet.addRow(row);
            }
        });
    }

    
}
