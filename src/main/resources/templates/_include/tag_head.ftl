    <#assign pageUrl = springMacroRequestContext.getRequestUri() />
    <title>DealSiteTV - CMS</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <#--  <link rel="shortcut icon" href="https://dtd31o1ybbmk8.cloudfront.net/images/d_favicon_blue_6464.ico">  -->
    <#--  파비콘 수정 (2024-08-20)  -->
    <link rel="shortcut icon" href="/static/favicon/favicon_d_blue.svg">

    <!-- csrf Setting -->
    <meta name="_csrf_parameter" content="${(_csrf.parameterName)!}" />
    <meta name="_csrf_header" content="${(_csrf.headerName)!}" />
    <meta name="_csrf" content="${(_csrf.token)!}" />
    <script>
        var csrf_parameter = "${(_csrf.parameterName)!}";
        var csrf_header = "${(_csrf.headerName)!}";
        var csrf = "${(_csrf.token)!}";    
    </script>
    <!-- /csrf Setting -->

    <!-- explorer 접속시 edge로 변경 -->
    <script>
        if (typeof (navigator.msLaunchUri) === "function") {
            navigator.msLaunchUri('microsoft-edge:' + window.location.href,
                function () { window.location.href="https://go.microsoft.com/fwlink/?linkid=2151617" },
                function () {console.log('ie but no edge')}
            )
        }
    </script>
    <!-- /explorer 접속시 edge로 변경 -->

    <!-- Global stylesheets -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;500&display=swap" rel="stylesheet" type="text/css">
    <link href="/static/css/icons/fontawesome/styles.min.css" rel="stylesheet" type="text/css">
    <link href="/static/css/icons/icomoon/styles.min.css" rel="stylesheet" type="text/css">
    <link href="/static/css/bootstrap.min.css" rel="stylesheet" type="text/css">
    <link href="/static/css/bootstrap_limitless.min.css" rel="stylesheet" type="text/css">
    
<#--   
    <link href="/static/css/layout.min.css" rel="stylesheet" type="text/css">
    <link href="/static/css/components.min.css" rel="stylesheet" type="text/css">  -->

    <link href="/static/css/all.min.css" rel="stylesheet" type="text/css">
    <link href="/static/css/colors.min.css" rel="stylesheet" type="text/css">
    <link href="/static/css/custom.css" rel="stylesheet" type="text/css">
    <!-- /global stylesheets -->

    <!-- Core JS files -->
    <script src="/static/js/main/jquery.min.js"></script>
    <script src="/static/js/main/jquery.cookie.js"></script>
    <script src="/static/js/main/bootstrap.bundle.min.js"></script>
        <!-- tab menu -->
        <script src="/static/js/plugins/loaders/blockui.min.js"></script>
        <!-- /tab menu -->

    <!-- /core JS files -->

    <!-- Theme JS files -->
    <script src="/static/js/plugins/forms/styling/uniform.min.js"></script>
    <script src="/static/js/plugins/forms/validation/validate.min.js"></script>
    <script src="/static/js/plugins/ui/sticky.min.js"></script>
    
    <!--  bootstrap button  -->
    <#if _isAuthenticated!false >
    <!-- select box -->
    <script src="/static/js/plugins/forms/selects/select2.min.js"></script>
    <script src="/static/js/plugins/forms/selects/bootstrap_multiselect.js"></script>
    <!-- /select box -->
    <!-- date picker -->
    <script src="/static/js/plugins/ui/moment/moment.min.js"></script>
    <script src="/static/js/plugins/ui/moment/ko.js"></script>
    <script src="/static/js/plugins/pickers/daterangepicker.js"></script>
    <script src="/static/js/plugins/pickers/anytime.min.js"></script>
    <!-- /date picker -->

    <!-- uploader plupload -->
    <#--  <script src="/static/js/plugins/uploaders/plupload/plupload.full.min.js"></script>
    <script src="/static/js/plugins/uploaders/plupload/plupload.queue.min.js"></script>  -->
    <!-- /uploader plupload -->
    <!-- bootstrap upload -->
    <#--  <script src="/static/js/plugins/uploaders/fileinput/plugins/purify.min.js"></script>
    <script src="/static/js/plugins/uploaders/fileinput/plugins/sortable.min.js"></script>
    <script src="/static/js/plugins/uploaders/fileinput/fileinput.min.js"></script>  -->
    <!-- /bootstrap upload -->


    <!-- auto size & inputmask -->
    <script src="/static/js/plugins/forms/inputs/autosize.min.js"></script>
    <script src="/static/js/plugins/forms/inputs/inputmask.js"></script>
    <!-- /auto size & inputmask -->

    <!-- jquery print  -->
    <script src="/static/js/plugins/print/jQuery.print.js"></script>
    <!-- /jquery print -->

    <!-- jquery calculator -->
    <script src="/static/js/plugins/blackcalculator/jquery.blackcalculator-1.0.min.js"></script>
    <!-- /jquery calculator -->

    <script src="/static/js/pages/global/common_utils.js"></script><!--common function -->
    <script src="/static/js/pages/global/common_error.js"></script><!--common error function -->
    <script src="/static/js/pages/global/common_ajax.js"></script><!--common ajax function -->
    </#if>
    
    <script src="/static/js/main/app.js"></script><!--layout/darktheme-->
    <script src="/static/js/main/jquery-ui.js"></script>
    <!-- /theme JS files -->

    <!-- csrf Ajax setting -->
    <script>
        $(function(){
            self_uri = "${_selfUri!}";

            var token = $("meta[name='_csrf']").attr("content");
            var header = $("meta[name='_csrf_header']").attr("content");
            $(document).ajaxSend(function(e, xhr, options) {
                if(token && header) xhr.setRequestHeader(header, token);
            });
        }); 
        
    </script>
    <!-- /csrf Ajax Setting -->
    
    <link href="/static/css/schedule.css" rel="stylesheet" type="text/css">