package com.paramount.pmx.security;

import com.paramount.pmx.config.SecurityConfig;
import com.paramount.pmx.utils.HttpServletUtils;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;

import java.io.IOException;
import java.util.List;

@Slf4j
public class CustomLogoutSuccessHandler implements LogoutSuccessHandler {

	private final SessionRegistry sessionRegistry;
	private final FindByIndexNameSessionRepository<? extends Session> sessionRepository;

	public CustomLogoutSuccessHandler(
			SessionRegistry sessionRegistry,
			FindByIndexNameSessionRepository<? extends Session> sessionRepository
	) {
		this.sessionRegistry = sessionRegistry;
		this.sessionRepository = sessionRepository;
	}

	@Override
	public void onLogoutSuccess(jakarta.servlet.http.HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response, Authentication authentication) throws IOException, jakarta.servlet.ServletException {

		String currentSessionId = request.getRequestedSessionId();

		if (authentication != null && authentication.getDetails() != null) {
			CustomUserDetails userDetails = (CustomUserDetails)authentication.getPrincipal();
			//max
			List<SessionInformation> sessionsInfo = sessionRegistry.getAllSessions(userDetails, false);
			if (null != sessionsInfo && sessionsInfo.size()> 0) {
				for (SessionInformation sessionInformation: sessionsInfo) {
					sessionInformation.expireNow();
					deleteRedisSession(sessionInformation.getSessionId());
				}
			}
			try {
				log.info("[{}] {}({}) 로그아웃 성공", HttpServletUtils.getClientIp(request), userDetails.getUserId());
			} catch (Exception e) {
				log.info("[{}] {}({}) 로그아웃 성공 (세션 삭제 실패)", HttpServletUtils.getClientIp(request), userDetails.getUserId());
			}
		}

		HttpSession session = request.getSession(false);
		if (session != null) {
			currentSessionId = session.getId();
			session.invalidate();
		}
		deleteRedisSession(currentSessionId);
		SecurityContext context = SecurityContextHolder.getContext();
		context.setAuthentication(null);
		SecurityContextHolder.clearContext();
		response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_OK);
		response.sendRedirect(SecurityConfig.LOGOUT_SUCCESS_URL);
	}

	private void deleteRedisSession(String sessionId) {
		if (sessionId == null || sessionId.isBlank()) {
			return;
		}

		try {
			sessionRepository.deleteById(sessionId);
		} catch (RuntimeException ex) {
			log.warn("Failed to delete logout session. sessionId={}", sessionId, ex);
		}
	}
}
