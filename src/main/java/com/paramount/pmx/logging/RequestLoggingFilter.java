package com.paramount.pmx.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.stream.Collectors;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        ContentCachingRequestWrapper wrappedRequest =
                new ContentCachingRequestWrapper(request);

        long start = System.currentTimeMillis();

        try {
            filterChain.doFilter(wrappedRequest, response);
        } finally {

            String contentType = request.getContentType();

            boolean isJson = contentType != null
                    && contentType.toLowerCase().contains("application/json");

            String params = getParams(wrappedRequest);

            String body = "";

            // JSON 요청일 때만 BODY 출력
            // form-urlencoded 는 PARAMS 와 BODY 가 중복되므로 BODY 출력 안 함
            if (isJson) {
                body = getBody(wrappedRequest);
            }

            log.info("""
                    
                    ==========================
                    REQUEST LOG
                    ==========================
                    METHOD  : {}
                    URI     : {}
                    PARAMS  : {}
                    BODY    : {}
                    STATUS  : {}
                    TIME(ms): {}
                    ==========================
                    """,
                    request.getMethod(),
                    request.getRequestURI(),
                    params,
                    body,
                    response.getStatus(),
                    (System.currentTimeMillis() - start)
            );
        }
    }

    private String getParams(HttpServletRequest request) {
        if (request.getParameterMap().isEmpty()) {
            return "";
        }

        return request.getParameterMap()
                .entrySet()
                .stream()
                .map(e -> e.getKey() + "=" + Arrays.toString(e.getValue()))
                .collect(Collectors.joining(", "));
    }

    private String getBody(ContentCachingRequestWrapper request) {
        byte[] content = request.getContentAsByteArray();

        if (content.length == 0) {
            return "";
        }

        return new String(content, StandardCharsets.UTF_8);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();

        return uri.startsWith("/static/")
                || uri.startsWith("/css/")
                || uri.startsWith("/js/")
                || uri.startsWith("/fonts/")  // 추가
                || uri.startsWith("/images/")
                || uri.startsWith("/assets/")
                || uri.startsWith("/data/")
                || uri.startsWith("/vendor/")
                || uri.startsWith("/webjars/")
                || uri.startsWith("/actuator/");
    }
}

