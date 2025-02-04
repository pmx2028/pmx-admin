package com.paramount.pmx.controller.common;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;

@Controller
public class CustomErrorController implements ErrorController{
    // HTML 접근시의 오류 처리
    @GetMapping("/error")
    @PostMapping("/error")
    public String handleError(HttpServletRequest request, Model model) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE) == null ? "500" : request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
        Object exceptionType = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION_TYPE);
        Object requestUrl = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);

        HttpStatus httpStatus = HttpStatus.valueOf(Integer.valueOf(status.toString()));
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy.MM.dd HH:mm:ss", new Locale("ko", "KR"));

        model.addAttribute("status", status.toString());
        model.addAttribute("exception", exception == null ? httpStatus.getReasonPhrase() : exception.toString());
        model.addAttribute("exceptionType", exceptionType == null ? status.toString() : exceptionType.toString());
        model.addAttribute("requestUrl", requestUrl == null ? "" : requestUrl.toString());
        model.addAttribute("timestamp", simpleDateFormat.format(new Date()).toString());

        return "error/error";
    }

    // AJAX 접근시의 오류 처리
    @GetMapping(value = "/error", produces = { MediaType.APPLICATION_JSON_VALUE })
    @PostMapping(value = "/error", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> handleRestError(HttpServletRequest request) {

        Object status  = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);

        HttpStatus httpStatus = null;
        String messageStr = (message == null) ? "" : message.toString();

        if(status == null) {
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        } else {
            httpStatus = HttpStatus.valueOf(Integer.parseInt(status.toString()));
        }

        return new ResponseEntity<>(
            Response.error(messageStr),
            httpStatus
        );
    }

    // @GetMapping(value = "/error/auth_mail_fail")
    // public String authMailFail(){
    //     return "/error/auth_mail_fail";
    // }

    // @GetMapping(value = "/error/register_fail")
    // public String registerFail(){
    //     return "/error/register_fail";
    // }

    // @GetMapping(value = "/error/login_duplicated_fail")
    // public String loginDuplicatedFail(){
    //     return "/error/login_duplicated_fail";
    // }

    // @GetMapping(value = "/error/mail_expired")
    // public String mail_expired(Model model, @RequestParam(value = "code", required = false) String code){
    //     model.addAttribute("code", code);
    //     return "/error/mail_expired";
    // }

    // @GetMapping(value = "/error/fail")
    // public String getFailPath(){
    //     return "/error/fail";
    // }

    //@Override
    public String getErrorPath() {
        return "/error/error";
    }
}

