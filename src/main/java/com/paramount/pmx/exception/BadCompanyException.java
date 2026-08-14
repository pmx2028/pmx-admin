package com.paramount.pmx.exception;

import org.springframework.security.core.AuthenticationException;

/**
 * 로그인 시 전달된 회사코드(compCode)가 유효하지 않을 때 발생.
 */
public class BadCompanyException extends AuthenticationException {

    public BadCompanyException(String msg) {
        super(msg);            // 예외 메시지
    }

    public BadCompanyException(String msg, Throwable cause) {
        super(msg, cause);
    }
}