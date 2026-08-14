package com.paramount.pmx.controller.view;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class MainViewController {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    @GetMapping(value = "/index")
    public String index() {
        return "main/index";
    }



}
