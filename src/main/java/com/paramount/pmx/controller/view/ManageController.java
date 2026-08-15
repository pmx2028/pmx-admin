package com.paramount.pmx.controller.view;


import com.paramount.pmx.model.category.Category;
import com.paramount.pmx.model.enums.BoardAnon;
import com.paramount.pmx.model.enums.BoardKindOf;
import com.paramount.pmx.service.category.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ManageController {
    private final CategoryService categoryService;

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

    // ----------------------------- 강습 카테고리 관리-----------------------------------
    @GetMapping("/manage/categories")
    public String ownCategories(Model model) {
        List<Category> topCategories = categoryService.getTopCategories();
        //model.addAttribute("topCategories", topCategories);
        return "management/manage-categories";
    }

}
