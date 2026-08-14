package com.paramount.pmx.exception;

public class ServiceException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    public ServiceException() {
        super();
    }
    public ServiceException(String msg) {
        super(msg);
    }
} 