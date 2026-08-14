package com.paramount.pmx.controller.view;


import com.paramount.pmx.service.board.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@RequiredArgsConstructor
public class BoardViewController {

    private final BoardService boardService;

    @GetMapping(value = "/board/{id}")
    public String board(@PathVariable("id") Long id, Model model) {
        model.addAttribute("code", id);
        model.addAttribute("boardName", boardService.getBoardName(id));
        return "board/board";
    }

}
