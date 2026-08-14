package com.paramount.pmx.controller.view;


import com.paramount.pmx.model.enums.BoardAnon;
import com.paramount.pmx.model.enums.BoardKindOf;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class ManageController {
    // ----------------------------- 게시판 관리 -----------------------------------
    @GetMapping("/manage/board")
    public String board(Model model) {
        model.addAttribute("boardKindOfList", BoardKindOf.values());
        model.addAttribute("boardAnonList", BoardAnon.values());
        return "management/manage-board";
    }

    // ----------------------------- 직원/ 관리 -----------------------------------
    @GetMapping("/manage/staff")
    public String staff() {
        return "management/manage-staff";
    }

    // ----------------------------- 권한 관리 -----------------------------------
    @GetMapping("/manage/auth")
    public String auth() {
        return "management/manage-auth";
    }

    @GetMapping("/manage/auth/role-permissions")
    public String authRolePermissions() {
        return "management/role-permissions";
    }

    @GetMapping("/manage/auth/user-permissions")
    public String authUserPermissions() {
        return "management/user-permissions";
    }

}
