package com.paramount.pmx.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.authentication.WebAuthenticationDetails;

public class CustomWebAuthenticationDetails extends WebAuthenticationDetails  {
    public CustomWebAuthenticationDetails(HttpServletRequest request) {
        super(request);

    }
}

