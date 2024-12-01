/*****************************************************************
description : 삭제 ajax
parameter description
- url : action url (삭제가 실행되는 path)
- key : 삭제될 data id
- listUlr : 삭제 후 이동할 목록 url (listUlr은 form.ftl, modifyForm.ftl 페이지내 Right sidebar component include 위에 정의.)
*****************************************************************/
function destroyData(url, key, listUrl){
    if (confirm("정보를 삭제합니다. 삭제된 정보는 복구할 수 없습니다.\n정말로 삭제하시겠습니까?")) {
        $.ajax({
            cache : false,
            url : url,
            type : 'GET', 
            data : {"id" : key}, 
            async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다. 
            success : function(obj) {
                alert("정보가 삭제되었습니다.");
                if ($(location).attr("pathname").indexOf("form") != -1){
                    $(location).attr('href',listUrl);
                } else {
                    location.reload();
                }
                
            }, 
            error: function(xhr, status, error){
                ajaxError(xhr);
            }
        });
    }
}

/*****************************************************************
description : id별 상세정보
parameter description
- url : action url (데이터 추출이 실행되는 server path)
- key : 추출할 data id
*****************************************************************/
function ajaxDetail(url, key){
    var result = "";
    $.ajax({
        cache : false,
        url : url,
        type : 'GET', 
        data : {"key" : key},
        dataType : 'json', 
        async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다. 
        success : function(obj) {
            result = obj.data;
        }, 
        error: function(xhr, status, error){
            ajaxError("ajaxDetail ERROR :: "+xhr);
            result = false;
        }
    });

    return result;
}

/*****************************************************************
description : parameter 조건별 정보
parameter description
- url : action url (데이터 추출이 실행되는 server path)
- keyArray : parameter 조건배열 (형식) {key:value}
*****************************************************************/
function ajaxDetailParamArray(url, keyArray){
    var result = "";
    $.ajax({
        cache : false,
        url : url,
        type : 'GET', 
        data : keyArray,
        dataType : 'json', 
        async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다. 
        success : function(obj) {
            result = obj.data;
        }, 
        error: function(xhr, status, error){
            ajaxError("ajaxDetailParamArray ERROR :: "+xhr);
            result = false;
        }
    });

    return result;
}

/*****************************************************************
description : parameter 조건별 업데이트
parameter description
- url : action url (데이터 추출이 실행되는 server path)
- keyArray : parameter 조건배열 (형식) {key:value}
*****************************************************************/
function ajaxCommonModifyParamArray(url, keyArray){
    var result = "";
    $.ajax({
        cache : false,
        url : url,
        type : 'GET', 
        data : keyArray,
        dataType : 'json', 
        async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다. 
        success : function(obj) {
            result = obj.data;
        }, 
        error: function(xhr, status, error){
            ajaxError("ajaxCommonModifyParamArray ERROR :: "+xhr);
            result = false;
        }
    });

    return result;
}

/*****************************************************************
description : 저장, 수정 ajax
parameter description
- url : action url (저장, 수정이 실행되는 server path)
- formName : submit할 form id
- listUlr : 저장, 수정 후 이동할 목록 url (listUlr은 form.ftl, modifyForm.ftl 페이지내 Right sidebar component include 위에 정의.)
*****************************************************************/
function ajaxCommonSaveOrModify(url, formName){
    var result = "";
    $.ajax({
        cache : false,
        url : url,
        type : 'POST', 
        data : $("#"+formName).serializeArray(), 
        async: false, // async: false로 선언해주면 ajax결과값이 끝난 다음에 함수가 진행된다. 
        success : function(obj) {
            result = obj.data;
        }, 
        error: function(xhr, status, error){
            ajaxError(xhr);
            result = false;
        }
    });

    return result;
}
