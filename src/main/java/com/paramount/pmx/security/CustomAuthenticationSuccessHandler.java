package com.paramount.pmx.security;

import com.paramount.pmx.config.WebSecurityConfig;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;

import com.paramount.pmx.model.setting.PersistentLogins;
import com.paramount.pmx.repository.setting.PersistentLoginsRepository;
import com.paramount.pmx.utils.HttpServletUtils;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
//import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
//import org.springframework.security.web.savedrequest.RequestCache;
//import org.springframework.security.web.savedrequest.SavedRequest;

import lombok.extern.slf4j.Slf4j;

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
//import javax.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

//로그인 성공 핸들러
@Slf4j
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    @Autowired
    protected AuthenticationManager authenticationManager;

    //private RequestCache requestCache = null;
    private RedirectStrategy redirectStrategy = null;

    @Resource(name = "sessionRepository")
    private FindByIndexNameSessionRepository<Session> findByIndexNameSessionRepository;

    @Autowired
    RedisTemplate<String, String> redisTemplate;

    @Autowired
    private PersistentLoginsRepository persistentLoginsRepository;

    public CustomAuthenticationSuccessHandler(){
        //requestCache        = new HttpSessionRequestCache();
        redirectStrategy    = new DefaultRedirectStrategy();
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        CustomUserDetails userDetails = (CustomUserDetails)authentication.getPrincipal();

        // a 기기에서 자동로그인이 설정되어있는데 b기기에서 자동로그인 설정을 새로 한 경우: persistent_logins 테이블에서 가장 최신 자동로그인 기록만 남기고 나머지는 삭제해버리기.
//        List<PersistentLogins> persistentLogins = persistentLoginsRepository.findByUsernameOrderByLastUsedDesc(userDetails.getUserId());
//        if(persistentLogins.size() > 1){
//            Integer i = 0;
//            for(PersistentLogins persistentLogin : persistentLogins){
//                if(i > 0){
//                    persistentLoginsRepository.delete(persistentLogin);
//                }
//                i += 1;
//            }
//        }
//
//        //redis key 삭제
//        destroyRedisSession(userDetails.getUserId());

        log.info("[{}] {}({}) 로그인 성공", HttpServletUtils.getClientIp(request), userDetails.getUserId());

        //ajax login success
        String message = "로그인 되었습니다.";

        response.setContentType("application/json");
   	    response.setCharacterEncoding("utf-8");
        response.setStatus(HttpServletResponse.SC_OK);
        PrintWriter out = response.getWriter();

        String data = StringUtils.join(new String[] { " { \"success\" : true , ", " \"message\" : \""+message+"\" ,", " \"code\" : \""+ WebSecurityConfig.LOGIN_SUCCESS_CODE+"\" } " });

        out = response.getWriter();
        out.print(data);
        out.flush();
        out.close();


        /*
        //page login success
        HttpSession session = request.getSession();

        if (session.getAttribute("prevPage") != null){
            sessionRequestURL = session.getAttribute("prevPage").toString();

        //session time 설정(초)
        //request.getSession(false).setMaxInactiveInterval(10);

        if(sessionRequestURL.indexOf(WebSecurityConfig.LOGIN_PAGE) != -1){
            // 기본 url로 가도록 함
            sendRedirectDefaultUrl(request,response);
        }else{
            // 인증 받기 전 url로 이동하기
            sendRedirectSessionUrl(request,response, sessionRequestURL);
        }
        */
    }

    public void sendRedirectSessionUrl(HttpServletRequest request, HttpServletResponse response, String sessionRequestURL) throws IOException {
        redirectStrategy.sendRedirect(request, response, sessionRequestURL);
    }

    public void sendRedirectRefererUrl(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String targetUrl = request.getHeader("REFERER");
        redirectStrategy.sendRedirect(request, response, targetUrl);
    }

    public void sendRedirectDefaultUrl(HttpServletRequest request, HttpServletResponse response) throws IOException {
        redirectStrategy.sendRedirect(request, response, WebSecurityConfig.LOGIN_SUCCESS_URL);
    }

    //redis key 삭제
    public void destroyRedisSession(String targetUsername) {
        Map<String, Session> sessionMap = findByIndexNameSessionRepository.findByIndexNameAndIndexValue(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, targetUsername);
        for (Map.Entry<String, Session> entry : sessionMap.entrySet()) {

            redisTemplate.delete("spring:session:sessions:" + entry.getKey());
            redisTemplate.delete("spring:session:sessions:expires:" + entry.getKey());
            redisTemplate.delete("spring:session:index:org.springframework.session.FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME:" + targetUsername);
        }
    }
}
