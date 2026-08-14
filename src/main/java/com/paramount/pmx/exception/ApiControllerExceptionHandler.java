package com.paramount.pmx.exception;


import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice(basePackages = {
        "com.dealsite.cms.controller.api", // api 컨트롤러 따로 exception 처리
})
public class ApiControllerExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ResponseDto> handleBusinessException(HttpServletRequest request, BusinessException e) {
        log.info("API BUSINESS ERROR :: {} :: {}", request.getRequestURI(), e.getMessage());

        return ResponseEntity
                .status(e.getStatus())
                .body(Response.error(e.getMessage()));
    }

    /**
     * 잘못된 요청 (예: IllegalArgumentException)
     */
    @ExceptionHandler({
            IllegalArgumentException.class,
            IndexOutOfBoundsException.class
    })
    public ResponseEntity<ResponseDto> handleBadRequestExceptions(HttpServletRequest request, Exception e) {
        log.error("API 400 ERROR :: {} :: {}", request.getRequestURI(), e.getMessage(), e);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Response.error(e.getMessage()));
    }

    /**
     * 그 외 런타임 예외
     */
    @ExceptionHandler({
            RuntimeException.class,
    })
    public ResponseEntity<ResponseDto> handleRuntimeExceptions(HttpServletRequest request, RuntimeException e) {
        log.error("API 500 ERROR :: {} :: {}", request.getRequestURI(), e.getMessage(), e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Response.error(e.getMessage()));
    }
}
