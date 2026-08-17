package com.paramount.pmx.controller.view;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ApartUserController {

    @GetMapping({"/apart/apart-user"})
    public String apartUsers(Model model) {
        return "apart/apart-user";
    }


    @GetMapping({"/apart/apart-user/trainer"})
    public String apartUsersTrainer(Model model) {
        return "apart/apart-user";
    }
}
