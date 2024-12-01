function ajaxError(xhr, type){
    if(xhr.status == 401){
        alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
        $(location).attr('href',"/login?status=L04");
    }
    else{
        alert(xhr.status + ": " + xhr.statusText);
    }
}

function ajaxError(xhr){
    if(xhr.status == 401){
        alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
        $(location).attr('href',"/login?status=L04");
        
    }
    else{
        alert(xhr.status + ": " + xhr.statusText);
    }
}

function ajaxError(xhr){
    if(xhr.status == 500 || xhr.status == 403){
        alert("ERROR CODE : " + xhr.status + " \n오류가 발생했습니다. 관리자에게 문의하거나 다시 시도해주십시다.");
        // location.reload();
        //.comma-type 콤마 넣기
        $(".comma-type").each(function(index, element){
            $(element).val(comma($(element).val()));
        });

        //.comma-dot-type 콤마 넣기
        $(".comma-dot-type").each(function(index, element){
            $(element).val(comma($(element).val()));
        });

        //버튼 disabled 복원
        $(".submit-form-btn").attr("disabled", false);
        $(".submit-form-btn").html(submitText);
    }
    else{
        alert(xhr.status + ": " + xhr.statusText);
    }
}