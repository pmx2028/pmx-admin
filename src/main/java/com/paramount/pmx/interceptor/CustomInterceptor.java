package com.paramount.pmx.interceptor;

import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.util.WebUtils;

import com.paramount.pmx.security.CustomUserDetails;

@Component
public class CustomInterceptor implements HandlerInterceptor  {

    private Map<String,String> appConfig;

    public CustomInterceptor(Map<String,String> interceptorConfig) {
        this.appConfig = interceptorConfig;
    }

    // 맵핑되기 전 처리를 해주면 된다.
    @Override
    public boolean preHandle(
        HttpServletRequest servletRequest,
        HttpServletResponse servletResponse,
        Object objectHandler
    ) throws Exception {
        return true;
    }

    // 맵핑되고난 후 처리를 해주면 된다.
    @Override
    public void postHandle(
        HttpServletRequest servletRequest,
        HttpServletResponse servletResponse,
        Object objectHandler,
        ModelAndView modelAndView
        // @Nullable ModelAndView modelAndView
    ) throws Exception {
        if(modelAndView != null) {
            Authentication auth = (Authentication)servletRequest.getUserPrincipal();
            if(auth != null && auth.isAuthenticated()) {

                Object principal = auth.getPrincipal();
                CustomUserDetails userDetails = (CustomUserDetails) principal;
                userDetails.setPassword("");

                boolean isRememberMe = (WebUtils.getCookie(servletRequest, appConfig.get("remembermeCookiename")) != null);
                Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
                Iterator<? extends GrantedAuthority> iter = authorities.iterator();
                Set<String> authSet = new HashSet<>();
                while (iter.hasNext()) {
                    GrantedAuthority authority = iter.next();
                    authSet.add(authority.getAuthority());
                }

                modelAndView.addObject("_user", ((CustomUserDetails) principal));
                modelAndView.addObject("_auth", authSet);
                modelAndView.addObject("_isAuthenticated", auth.isAuthenticated());
                modelAndView.addObject("_isRememberMe", isRememberMe);
            } else {
                modelAndView.addObject("_user", null);
                modelAndView.addObject("_auth", null);
                modelAndView.addObject("_isAuthenticated", false);
                modelAndView.addObject("_isRememberMe", false);
            }
            modelAndView.addObject("_selfUri", servletRequest.getRequestURI());
            modelAndView.addObject("_appConfig", appConfig);
        }
    }
}
