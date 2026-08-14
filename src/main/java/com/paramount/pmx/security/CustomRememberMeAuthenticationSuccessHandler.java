package com.paramount.pmx.security;

import com.paramount.pmx.config.SecurityConfig;
import com.paramount.pmx.utils.HttpServletUtils;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;

import java.io.IOException;

@Slf4j
public class CustomRememberMeAuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private final CustomAuthenticationSuccessHandler authenticationSuccessHandler;

    public CustomRememberMeAuthenticationSuccessHandler(CustomAuthenticationSuccessHandler authenticationSuccessHandler) {
        this.authenticationSuccessHandler = authenticationSuccessHandler;
        setDefaultTargetUrl(SecurityConfig.LOGIN_SUCCESS_URL);
        setAlwaysUseDefaultTargetUrl(false);
    }

    @Override
    public void onAuthenticationSuccess(
            jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response,
            Authentication authentication
    ) throws IOException, jakarta.servlet.ServletException {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        HttpSession currentSession = request.getSession(false);
        String currentSessionId = currentSession == null ? null : currentSession.getId();
        authenticationSuccessHandler.destroyRedisSession(userDetails.getUserId(), currentSessionId);

        log.info("[REMEMBER-ME SUCCESS] ip={}, user={}", HttpServletUtils.getClientIp(request), userDetails.getUserId());
        getRedirectStrategy().sendRedirect(request, response, currentRequestUrl(request));
    }

    static String currentRequestUrl(jakarta.servlet.http.HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        String queryString = request.getQueryString();

        if (queryString == null || queryString.isBlank()) {
            return requestUri;
        }

        return requestUri + "?" + queryString;
    }
}