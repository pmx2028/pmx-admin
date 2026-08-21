package com.paramount.pmx.controller.view;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("")
@RequiredArgsConstructor
public class PayController {

    @GetMapping("/pay/checkout/{paymentId}")
    public String checkout(@PathVariable("paymentId") Long paymentId, Model model) {

        model.addAttribute("paymentId", paymentId);     //nxca_jt_il: 인증 nxca_jt_bi: 비인증 nxca_ks_gu: 구인증 nxca_jt_hd: 인증 승인 분리
        return "pay/checkout";
    }

    @GetMapping("/pay/return/next")
    public String returnNext() {
        return "pay/return-next";
    }

    @GetMapping("/pay/return/cancel")
    public String returnCancel() {
        return "pay/return-cancel";
    }
}
