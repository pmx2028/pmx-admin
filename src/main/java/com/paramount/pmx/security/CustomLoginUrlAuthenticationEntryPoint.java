package com.paramount.pmx.security;

import java.io.IOException;

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
    public void commence(jakarta.servlet.http.HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response,
                         AuthenticationException exception) throws IOException, jakarta.servlet.ServletException {

        if(HttpServletUtils.isAjax(request)){
            response.sendError(
                    jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED,
                    messageSource.getMessage(
                            "error.security.Unauthorized",
                            null,
                            "error",
                            LocaleContextHolder.getLocale()
                    )
            );
        }
        else{
            // ✅ 302 리다이렉트 로그 추가
            log.warn("[302 REDIRECT] 비인증 접근 → 로그인 페이지로 리다이렉트 " +
                            "| URI: {} | IP: {} | X-Forwarded-Proto: {} | isAjax: {}",
                    request.getRequestURI(),
                    HttpServletUtils.getClientIp(request),
                    request.getHeader("X-Forwarded-Proto"),  // http인지 https인지 확인
                    HttpServletUtils.isAjax(request)
            );
            super.commence(request, response, exception);
        }
        log.info("[{}] 비인증 접근(인증없음 또는 인증파기) - {}", HttpServletUtils.getClientIp(request), request.getRequestURI());
    }
}
