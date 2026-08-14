package com.paramount.pmx.controller.auth;

import com.paramount.pmx.security.CustomUserDetails;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.WebUtils;


@Controller 
public class AuthController {

    // 로그인 성공시 리다이렉트 조건
    @GetMapping(value = {"/login/success","","/"})
    public ModelAndView main(HttpServletRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return new ModelAndView("redirect:/login?code=L02");
        }
        ModelAndView mav = new ModelAndView();
        RedirectView redirectView = new RedirectView();

        String redirectUrl;
        redirectUrl = "/index";
        redirectView.setUrl(redirectUrl);
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
        Cookie autologinCookie = WebUtils.getCookie(request, "AUTO_LOGIN");
        String saveid = (saveidCookie != null) ? saveidCookie.getValue() : null;
        String autologin = (autologinCookie != null) ? autologinCookie.getValue() : null;
        model.addAttribute("saveid", saveid);
        model.addAttribute("autologin", autologin);
        model.addAttribute("code", code);

        return "auth/login";
    }

    //aws health check
    @GetMapping(value = "/health", produces={MediaType.APPLICATION_JSON_VALUE})
    @ResponseBody
    public ResponseEntity<String> health(){
        return new ResponseEntity<>(
            "200",
            HttpStatus.OK
        );
    }
}
