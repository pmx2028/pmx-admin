package com.paramount.pmx.security;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.authentication.AccountExpiredException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.session.SessionAuthenticationException;

import com.paramount.pmx.config.WebSecurityConfig;
import com.paramount.pmx.utils.HttpServletUtils;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import lombok.extern.slf4j.Slf4j;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

//로그인 실패 핸들러
@Slf4j
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {
    @Autowired
    protected AuthenticationManager authenticationManager;

    @Autowired
    private MessageSource messageSource;

    //private RedirectStrategy redirectStrategy = null;

    public CustomAuthenticationFailureHandler() {
        //redirectStrategy = new DefaultRedirectStrategy();
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        String errormsg = null;

        if(exception instanceof BadCredentialsException) {
			errormsg = messageSource.getMessage("error.login.BadCredentials", null, "error", LocaleContextHolder.getLocale());
		} else if(exception instanceof UsernameNotFoundException) {
			errormsg = messageSource.getMessage("error.login.NotExist", null, "error", LocaleContextHolder.getLocale());
		} else if(exception instanceof DisabledException) {
			errormsg = messageSource.getMessage("error.login.Disabled", null, "error", LocaleContextHolder.getLocale());
		} else if(exception instanceof LockedException) {
			errormsg = messageSource.getMessage("error.login.Locked", null, "error", LocaleContextHolder.getLocale());
		} else if(exception instanceof AccountExpiredException) {
			errormsg = messageSource.getMessage("error.login.AccountExpired", null, "error", LocaleContextHolder.getLocale());
		} else if(exception instanceof CredentialsExpiredException) {
			errormsg = messageSource.getMessage("error.login.CredentialsExpired", null, "error", LocaleContextHolder.getLocale());
		} else if (exception instanceof SessionAuthenticationException){
            errormsg = messageSource.getMessage("error.security.SessionDoubleError", null, "error", LocaleContextHolder.getLocale());
        }
        log.info("[{}] {} 로그인 실패 - {}", HttpServletUtils.getClientIp(request), request.getParameter(WebSecurityConfig.USERNAME_PARAM), errormsg +" :: "+exception.toString());


        //ajax login fail
        response.setContentType("application/json");
   	    response.setCharacterEncoding("utf-8");
        response.setStatus(HttpServletResponse.SC_OK);
        PrintWriter out = response.getWriter();

        String data = StringUtils.join(new String[] { " { \"success\" : false , ", " \"message\" : \""+errormsg+"\" ,", " \"code\" : \""+WebSecurityConfig.LOGIN_FAILURE_CODE+"\" } " });
        out = response.getWriter();
        out.print(data);
        out.flush();
        out.close();


    }
}
