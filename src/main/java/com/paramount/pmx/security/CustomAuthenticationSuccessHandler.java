package com.paramount.pmx.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paramount.pmx.config.SecurityConfig;
import com.paramount.pmx.model.user.PersistentLogins;
import com.paramount.pmx.repository.user.PersistentLoginsRepository;
import com.paramount.pmx.utils.HttpServletUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;


//로그인 성공 핸들러
@Slf4j
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final FindByIndexNameSessionRepository<? extends Session> sessionRepository;
    private final PersistentLoginsRepository persistentLoginsRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    public CustomAuthenticationSuccessHandler(
            FindByIndexNameSessionRepository<? extends Session> sessionRepository,
            PersistentLoginsRepository persistentLoginsRepository
    ) {
        this.sessionRepository = sessionRepository;
        this.persistentLoginsRepository = persistentLoginsRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        trimPersistentLogins(userDetails.getUserId());

        HttpSession currentSession = request.getSession(false);
        String currentSessionId = currentSession == null ? null : currentSession.getId();
        destroyRedisSession(userDetails.getUserId(), currentSessionId);

        log.info("[로그인 성공] ip={}, user={}", HttpServletUtils.getClientIp(request), userDetails.getUserId());
        writeSuccessJson(response, "로그인 되었습니다.");
    }

    public void sendRedirectSessionUrl(HttpServletRequest request, HttpServletResponse response, String sessionRequestURL) throws IOException {
        redirectStrategy.sendRedirect(request, response, sessionRequestURL);
    }

    public void sendRedirectRefererUrl(HttpServletRequest request, HttpServletResponse response) throws IOException {
        redirectStrategy.sendRedirect(request, response, request.getHeader("REFERER"));
    }

    public void sendRedirectDefaultUrl(HttpServletRequest request, HttpServletResponse response) throws IOException {
        redirectStrategy.sendRedirect(request, response, SecurityConfig.LOGIN_SUCCESS_URL);
    }

    public void destroyRedisSession(String targetUsername, String currentSessionId) {
        if (targetUsername == null || targetUsername.isBlank()) {
            return;
        }

        Map<String, ? extends Session> sessions = sessionRepository.findByIndexNameAndIndexValue(
                FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME,
                targetUsername
        );
        sessions = Objects.requireNonNullElse(sessions, Collections.emptyMap());

        sessions.keySet().stream()
                .filter(sessionId -> !Objects.equals(sessionId, currentSessionId))
                .forEach(sessionId -> {
                    try {
                        sessionRepository.deleteById(sessionId);
                    } catch (RuntimeException ex) {
                        log.warn("Failed to delete duplicated session. user={}, sessionId={}", targetUsername, sessionId, ex);
                    }
                });
    }

    private void trimPersistentLogins(String username) {
        List<PersistentLogins> persistentLogins = persistentLoginsRepository.findByUsernameOrderByLastUsedDesc(username);
        for (int i = 1; i < persistentLogins.size(); i++) {
            persistentLoginsRepository.delete(persistentLogins.get(i));
        }
    }

    private void writeSuccessJson(HttpServletResponse response, String message) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);
        objectMapper.writeValue(response.getWriter(), Map.of(
                "success", true,
                "message", message,
                "code", SecurityConfig.LOGIN_SUCCESS_CODE
        ));
    }
}
