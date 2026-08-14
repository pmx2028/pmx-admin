package com.paramount.pmx.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paramount.pmx.config.SecurityConfig;
import com.paramount.pmx.exception.BadCompanyException;
import com.paramount.pmx.utils.HttpServletUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.session.SessionAuthenticationException;

import java.io.IOException;
import java.util.Map;

//로그인 실패 핸들러
@Slf4j
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Autowired
    private MessageSource messageSource;

    private static final Map<Class<? extends AuthenticationException>, String> ERROR_MESSAGES = Map.ofEntries(
            Map.entry(BadCompanyException.class, "error.login.BadCompany"),
            Map.entry(BadCredentialsException.class, "error.login.BadCredentials"),
            Map.entry(UsernameNotFoundException.class, "error.login.NotExist"),
            Map.entry(DisabledException.class, "error.login.Disabled"),
            Map.entry(LockedException.class, "error.login.Locked"),
            Map.entry(AccountExpiredException.class, "error.login.AccountExpired"),
            Map.entry(CredentialsExpiredException.class, "error.login.CredentialsExpired"),
            Map.entry(SessionAuthenticationException.class, "error.security.SessionDoubleError")
    );

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException ex)
            throws IOException {

        String msgKey = ERROR_MESSAGES.getOrDefault(ex.getClass(), "error");
        String errMsg = messageSource.getMessage(msgKey, null, "error", LocaleContextHolder.getLocale());

        log.warn("[LOGIN FAIL] user={}, ip={}, reason={}",
                request.getParameter(SecurityConfig.USERNAME_PARAM),
                HttpServletUtils.getClientIp(request),
                ex.getMessage());

        writeErrorResponse(response, errMsg);
    }

    private void writeErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        Map<String, Object> body = Map.of(
                "success", false,
                "message", message,
                "code", SecurityConfig.LOGIN_FAILURE_CODE
        );
        new ObjectMapper().writeValue(response.getWriter(), body);
    }
}
