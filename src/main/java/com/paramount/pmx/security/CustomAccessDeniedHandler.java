package com.paramount.pmx.security;

import java.io.IOException;

import com.paramount.pmx.utils.HttpServletUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Autowired
    private MessageSource messageSource;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {

        if(accessDeniedException instanceof AccessDeniedException) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if(auth != null) {
                CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
                response.sendError(
                    HttpServletResponse.SC_FORBIDDEN,
                    messageSource.getMessage(
                        "error.security.Forbidden",
                        null,
                        "error",
                        LocaleContextHolder.getLocale()
                    )
                );
                log.info("[{}] {}({}) 해당 권한 없음 접근 - {}", HttpServletUtils.getClientIp(request), userDetails.getId(), request.getRequestURI());
            } else {
                response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    messageSource.getMessage(
                        "error.security.Unauthorized",
                        null,
                        "error",
                        LocaleContextHolder.getLocale()
                    )
                );
                log.info( "[{}] 비인증 접근(인증없음 또는 인증파기) - {}", HttpServletUtils.getClientIp(request), request.getRequestURI());
            }
        }
    }
}
