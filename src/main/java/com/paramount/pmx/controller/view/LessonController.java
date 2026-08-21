package com.paramount.pmx.controller.view;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class LessonController {

    @GetMapping("/lesson/lesson")
    public String lesson(Model model) {
        return "lesson/lesson";
    }


    @GetMapping("/lesson/confirmed")
    public String lessonConfirmed(Model model) {
        return "lesson/confirmed";
    }
    
}
