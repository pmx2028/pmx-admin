package com.paramount.pmx.security;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;

import com.paramount.pmx.utils.HttpServletUtils;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class CustomLoginUrlAuthenticationEntryPoint extends LoginUrlAuthenticationEntryPoint {

    @Autowired
    private MessageSource messageSource;

    public CustomLoginUrlAuthenticationEntryPoint(String loginFormUrl) {
        super(loginFormUrl);
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {

        if(HttpServletUtils.isAjax(request)){
            response.sendError(
                HttpServletResponse.SC_UNAUTHORIZED,
                messageSource.getMessage(
                    "error.security.Unauthorized",
                    null,
                    "error",
                    LocaleContextHolder.getLocale()
                )
            );
        }
        else{
            super.commence(request, response, exception);
        }
        log.info("[{}] 비인증 접근(인증없음 또는 인증파기) - {}", HttpServletUtils.getClientIp(request), request.getRequestURI());
    }
}
