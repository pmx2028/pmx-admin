package com.paramount.pmx.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AuthenticationDetailsSource;

public class CustomAuthenticationDetailsSource implements AuthenticationDetailsSource<HttpServletRequest, CustomWebAuthenticationDetails> {
    @Override
    public CustomWebAuthenticationDetails buildDetails(HttpServletRequest request) {
        return new CustomWebAuthenticationDetails(request);
    }
}
