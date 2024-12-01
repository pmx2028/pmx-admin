package com.paramount.pmx.controller.setting;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.WebUtils;

import com.paramount.pmx.security.CustomUserDetails;

@Controller
public class AuthController {

    @GetMapping(value = {"/login/success","","/"})
    public ModelAndView main(HttpServletRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        System.out.println(userDetails.toString());
        //main이 없으므로 채권으로 redirect 처리
        ModelAndView mav = new ModelAndView();
        RedirectView redirectView = new RedirectView(); // redyoirect url 설정

        redirectView.setUrl("/tvcms/tvPrograms/");
        redirectView.setExposeModelAttributes(false);

        mav.setView(redirectView);

        return mav;
	}


    @GetMapping(value = {"/login", "/login/"})
    public String login(
        Model model,
        @RequestParam(value = "code", required = false) String code,
        HttpServletRequest request,
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Cookie saveidCookie = WebUtils.getCookie(request, "SAVEID_DC");
        String saveid = (saveidCookie != null) ? saveidCookie.getValue() : null;
        model.addAttribute("saveid", saveid);
        model.addAttribute("code", code);

        return "/auth/login";
    }
}
