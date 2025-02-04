package com.paramount.pmx.advice;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalControllerAdvice { dddd
    @Value("${spring.profiles.active}")
    private String env;

    @ModelAttribute
    public void handleRequest(
        HttpServletRequest request
        , HttpServletResponse response
        , Model model
    ){
        model.addAttribute("_env", env);
    }
}
