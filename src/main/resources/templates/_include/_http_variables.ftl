<div style="font-size:12px;padding:5px;display:inline">
        <#--  현재페이지 URL: ${springMacroRequestContext.getRequestUri()}<br>
        페이지 Param:<#list RequestParameters?keys as key>${key} = "${RequestParameters[key]}" <#sep>, </#sep></#list><br>
        인증여부: ${_isAuthenticated?string("Yes", "No")}<br>
        자동로그인여부: ${_isRememberMe?string("Yes", "No")}<br>
        <#if _user??>
            사용자아이디: ${_user.userId!""}<br>
            사용자일련번호: ${_user.id?c!""}<br>
            사용자이름: ${_user.name!""}<br>
            사용자LEVEL: ${_user.level!""}<br>
            사용자직책: ${_user.title!""}<br>
            사용자접속권한: <#list _auth as auth>${auth}<#sep>,</#sep></#list><br>

             ${_user}
        </#if>  -->
</div>