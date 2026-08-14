package com.paramount.pmx.advice;

import com.paramount.pmx.service.board.BoardService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;


@Slf4j
@ControllerAdvice()
@RequiredArgsConstructor
public class GlobalControllerAdvice {

    @Value("${spring.profiles.active}")
    private String activeProfile;

    private final BoardService boardService;

    @ModelAttribute
    public void handleRequest(
            HttpServletRequest request
            , HttpServletResponse response
            , Model model
    ){
        model.addAttribute("activeProfile", activeProfile);
        model.addAttribute("requestURI", request.getRequestURI()); // 타임리프 경로 조건에 사용됨
        model.addAttribute("boardList", boardService.getBoardSideMenu());

    }
}