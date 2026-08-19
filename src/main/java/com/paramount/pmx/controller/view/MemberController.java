package com.paramount.pmx.controller.view;

import com.paramount.pmx.model.enums.BoardAnon;
import com.paramount.pmx.model.enums.BoardKindOf;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("")
@RequiredArgsConstructor
public class MemberController {

    @GetMapping("/member/member")
    public String board(Model model) {
        return "member/member";
    }

}
