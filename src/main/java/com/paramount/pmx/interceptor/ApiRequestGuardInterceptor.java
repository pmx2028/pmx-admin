package com.paramount.pmx.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.net.IDN;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public class ApiRequestGuardInterceptor implements HandlerInterceptor {

    private static final String XML_HTTP_REQUEST = "XMLHttpRequest";
    private static final String FETCH_MODE_NAVIGATE = "navigate";
    private static final String FETCH_DEST_EMPTY = "empty";
    private static final String FETCH_SITE_CROSS_SITE = "cross-site";
    private static final String FETCH_SITE_SAME_ORIGIN = "same-origin";
    private static final String FETCH_SITE_SAME_SITE = "same-site";
    private static final String FETCH_SITE_NONE = "none";

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler
    ) throws Exception {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }

        if (isExplicitlyCrossSite(request)) {
            deny(response);
            return false;
        }

        if (isAjaxRequest(request) || isProgrammaticRequest(request) || isSameOriginNavigation(request)) {
            return true;
        }

        deny(response);
        return false;
    }

    private boolean isAjaxRequest(HttpServletRequest request) {
        return XML_HTTP_REQUEST.equalsIgnoreCase(request.getHeader("X-Requested-With"));
    }

    private boolean isProgrammaticRequest(HttpServletRequest request) {
        String fetchMode = request.getHeader("Sec-Fetch-Mode");
        String fetchDest = request.getHeader("Sec-Fetch-Dest");

        if (hasText(fetchMode) && !FETCH_MODE_NAVIGATE.equalsIgnoreCase(fetchMode)) {
            return true;
        }

        return FETCH_DEST_EMPTY.equalsIgnoreCase(fetchDest);
    }

    private boolean isSameOriginNavigation(HttpServletRequest request) {
        return isNavigateRequest(request)
                && isTrustedNavigationSite(request)
                && (isSameOriginHeader(request, HttpHeaders.ORIGIN) || isSameOriginHeader(request, HttpHeaders.REFERER));
    }

    private boolean isExplicitlyCrossSite(HttpServletRequest request) {
        return FETCH_SITE_CROSS_SITE.equalsIgnoreCase(request.getHeader("Sec-Fetch-Site"));
    }

    private boolean isTrustedNavigationSite(HttpServletRequest request) {
        String fetchSite = request.getHeader("Sec-Fetch-Site");
        return !hasText(fetchSite)
                || FETCH_SITE_SAME_ORIGIN.equalsIgnoreCase(fetchSite)
                || FETCH_SITE_SAME_SITE.equalsIgnoreCase(fetchSite)
                || FETCH_SITE_NONE.equalsIgnoreCase(fetchSite);
    }

    private boolean isNavigateRequest(HttpServletRequest request) {
        String fetchMode = request.getHeader("Sec-Fetch-Mode");
        return !hasText(fetchMode) || FETCH_MODE_NAVIGATE.equalsIgnoreCase(fetchMode);
    }

    private boolean isSameOriginHeader(HttpServletRequest request, String headerName) {
        String headerValue = request.getHeader(headerName);
        if (!hasText(headerValue) || "null".equalsIgnoreCase(headerValue.trim())) {
            return false;
        }

        try {
            RequestOrigin requestOrigin = RequestOrigin.fromRequest(request);
            RequestOrigin headerOrigin = RequestOrigin.fromUri(new URI(headerValue));
            return requestOrigin != null && requestOrigin.equals(headerOrigin);
        } catch (URISyntaxException ignored) {
            return false;
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static String normalizeScheme(String rawScheme) {
        if (rawScheme == null || rawScheme.isBlank()) {
            return null;
        }
        return rawScheme.trim().toLowerCase(Locale.ROOT);
    }

    private static String normalizeHost(String rawHost) {
        if (rawHost == null || rawHost.isBlank()) {
            return null;
        }

        String host = rawHost.trim();
        if (host.startsWith("[") && host.endsWith("]")) {
            host = host.substring(1, host.length() - 1);
        }

        try {
            host = IDN.toASCII(host, IDN.ALLOW_UNASSIGNED);
        } catch (IllegalArgumentException ignored) {
            return null;
        }

        host = host.toLowerCase(Locale.ROOT);
        return host.isEmpty() ? null : host;
    }

    private static int normalizePort(String scheme, int port) {
        if (port > 0) {
            return port;
        }

        if ("http".equalsIgnoreCase(scheme)) {
            return 80;
        }

        if ("https".equalsIgnoreCase(scheme)) {
            return 443;
        }

        return port;
    }

    private void deny(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\":\"Forbidden\"}");
    }

    private record RequestOrigin(String scheme, String host, int port) {

        private static RequestOrigin fromRequest(HttpServletRequest request) {
            String scheme = normalizeScheme(request.getScheme());
            String host = normalizeHost(request.getServerName());
            if (scheme == null || host == null) {
                return null;
            }

            return new RequestOrigin(scheme, host, normalizePort(scheme, request.getServerPort()));
        }

        private static RequestOrigin fromUri(URI uri) {
            String scheme = normalizeScheme(uri.getScheme());
            String host = normalizeHost(uri.getHost());
            if (scheme == null || host == null) {
                return null;
            }

            return new RequestOrigin(scheme, host, normalizePort(scheme, uri.getPort()));
        }
    }
}