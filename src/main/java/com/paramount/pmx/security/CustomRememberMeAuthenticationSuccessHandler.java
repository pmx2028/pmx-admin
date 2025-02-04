package com.paramount.pmx.security;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

import com.paramount.pmx.utils.HttpServletUtils;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class CustomRememberMeAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler;

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException, ServletException {
        CustomUserDetails userDetails = (CustomUserDetails)authentication.getPrincipal();
        log.info("[{}] {}({}) 자동 로그인 성공", HttpServletUtils.getClientIp(request), userDetails.getUserId());

        //redis key 삭제
        customAuthenticationSuccessHandler.destroyRedisSession(userDetails.getUserId());

        super.setAlwaysUseDefaultTargetUrl(true);
        super.setDefaultTargetUrl(request.getRequestURL().toString());
        super.onAuthenticationSuccess(request, response, authentication);
    }
}
