package com.paramount.pmx.security;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class CustomAuthenticationProvider implements AuthenticationProvider{
    private final CustomUserDetailsService customUserDetailsService;

    public CustomAuthenticationProvider(
            CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }


    @Override
    public boolean supports(Class<?> authentication) {
        // 이 부분을 여기에 넣습니다!
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }

    //@SuppressWarnings("unchecked")
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {

        // 두 번째 호출(이미 인증된 토큰)이라면 그냥 넘기기
        if (authentication.isAuthenticated()) {
            return authentication;
        }
        // 1) 파라미터에서 아이디/패스워드
        String username = (String) authentication.getPrincipal();   //parameter userid
        String password = (String) authentication.getCredentials(); //parameter password


        // 2) 사용자 정보 로드
        CustomUserDetails user = (CustomUserDetails) customUserDetailsService.loadUserByUsername(username);

        // 3) 패스워드 검사
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
         boolean matches = passwordEncoder.matches(password, user.getPassword());

        if(!matches) {
            throw new BadCredentialsException(username);
        }

        return new UsernamePasswordAuthenticationToken(user, password, user.getAuthorities());
    }


}
