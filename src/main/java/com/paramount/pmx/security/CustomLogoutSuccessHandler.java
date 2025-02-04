package com.paramount.pmx.security;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.paramount.pmx.config.WebSecurityConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

import com.paramount.pmx.utils.HttpServletUtils;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class CustomLogoutSuccessHandler implements LogoutSuccessHandler {

    @Autowired
	private SessionRegistry sessionRegistry;

	@Override
	public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

		if (authentication != null && authentication.getDetails() != null) {
			CustomUserDetails userDetails = (CustomUserDetails)authentication.getPrincipal();
            //max
            List<SessionInformation> sessionsInfo = sessionRegistry.getAllSessions(userDetails, false);
            if (null != sessionsInfo && sessionsInfo.size()> 0) {
                for (SessionInformation sessionInformation: sessionsInfo) {
                    sessionInformation.expireNow();
                }
            }
			try {
				log.info("[{}] {}({}) 로그아웃 성공", HttpServletUtils.getClientIp(request), userDetails.getUserId());
			} catch (Exception e) {
				log.info("[{}] {}({}) 로그아웃 성공 (세션 삭제 실패)", HttpServletUtils.getClientIp(request), userDetails.getUserId());
			}
		}

        request.getSession().invalidate();
        SecurityContext context = SecurityContextHolder.getContext();
        context.setAuthentication(null);
        SecurityContextHolder.clearContext();
		response.setStatus(HttpServletResponse.SC_OK);
		response.sendRedirect(WebSecurityConfig.LOGOUT_SUCCESS_URL);
	}

}
