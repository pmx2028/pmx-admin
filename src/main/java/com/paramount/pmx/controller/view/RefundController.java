package com.paramount.pmx.controller.view;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("")
@RequiredArgsConstructor
public class RefundController {

    @GetMapping("/refund/refund")
    public String board(Model model) {
        return "refund/refund";
    }
}