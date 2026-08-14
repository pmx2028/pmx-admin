package com.paramount.pmx.controller.view;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class ApartController {

    @GetMapping("/apart/apart")
    public String apart(Model model) {
        return "apart/apart";
    }
    
}
