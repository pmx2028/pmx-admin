package com.paramount.pmx.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.firewall.RequestRejectedException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;


@ControllerAdvice
@Slf4j
public class ControllerExceptionHandler {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler({BindException.class, IllegalArgumentException.class, NullPointerException.class, ClassCastException.class, IndexOutOfBoundsException.class, RequestRejectedException.class, UnsupportedOperationException.class})
    public String handleExceptions(HttpServletResponse response, HttpServletRequest request, Exception e) {
        response.setStatus(HttpStatus.BAD_REQUEST.value());
        log.error("EXCEPTION :: {} :: {}", request.getServletPath(), e.getMessage(), e);
        return "forward:/error";
        // Nothing to do ..
    }

}
