package com.paramount.pmx.exception;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.firewall.RequestRejectedException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class ControllerExceptionHandler {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler({BindException.class, IllegalArgumentException.class, NullPointerException.class, ClassCastException.class, IndexOutOfBoundsException.class, RequestRejectedException.class, UnsupportedOperationException.class})
    public String handleExceptions(HttpServletResponse response, HttpServletRequest request, Exception e) {
        response.setStatus(HttpStatus.BAD_REQUEST.value());
        logger.warn("EXCEPTION :: "+ HttpStatus.BAD_REQUEST.value()+" :: "+ request.getServletPath() + " :: " +e);
        return "forward:/error";
        // Nothing to do ..
    }
}
