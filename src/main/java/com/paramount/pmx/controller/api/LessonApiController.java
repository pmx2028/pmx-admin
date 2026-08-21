package com.paramount.pmx.controller.api;

import com.paramount.pmx.model.apart.ApartDto;
import com.paramount.pmx.model.apart.ApartUserDto;
import com.paramount.pmx.model.lesson.LessonConfirmedDto;
import com.paramount.pmx.model.lesson.LessonDto;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.apart.ApartService;
import com.paramount.pmx.service.apart.ApartUserService;
import com.paramount.pmx.service.lesson.LessonService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lessons")
@Slf4j
@AllArgsConstructor
public class LessonApiController {

    private final LessonService lessonService;

    @GetMapping("gxtuni")
    public ResponseEntity<ResponseDto> getGxtuniLessonList(
            @RequestParam Map<String, Object> requestParams,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = lessonService.getGxtuniLessonList(requestParams, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @GetMapping("healthgolf")
    public ResponseEntity<ResponseDto> getHealthGolfLessonList(
            @RequestParam Map<String, Object> requestParams,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = lessonService.getHealthGolfLessonList(requestParams, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @PostMapping("healthgolf/bulk")
    public ResponseEntity<ResponseDto> saveHealthGolfLessonList(
            @RequestBody List<LessonDto> reqDtos,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = lessonService.saveHealthGolfLessonList(reqDtos, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @PostMapping("gxtuni/bulk")
    public ResponseEntity<ResponseDto> saveGxtuniLessonList(
            @RequestBody List<LessonDto> reqDtos,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = lessonService.saveGxtuniLessonList(reqDtos, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ResponseDto> createLesson(
            @RequestBody LessonDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = lessonService.createLesson(reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<ResponseDto> getLessonDetail(
            @PathVariable("lessonId") Long lessonId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = lessonService.getLessonDetail(lessonId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @PutMapping("/{lessonId}")
    public ResponseEntity<ResponseDto> updateLesson(
            @PathVariable("lessonId") Long lessonId,
            @RequestBody LessonDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = lessonService.updateLesson(lessonId, reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @GetMapping("/confirmed")
    public ResponseEntity<ResponseDto> getLessonConfirmedDetail(
            @RequestParam Map<String, Object> requestParams,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = lessonService.getLessonConfirmedDetail( requestParams , userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    /** 아파트 정보 + 해당 연월 강습확정 정보 조회 (LEFT JOIN) */
    @GetMapping("/confirmed/lesson")
    public ResponseEntity<ResponseDto> getApartLessonConfirmedList(
            @RequestParam Map<String, Object> requestParams,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = lessonService.getApartLessonConfirmedList(requestParams, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @PostMapping("/confirmed")
    public ResponseEntity<ResponseDto> createLessonConfirmed(
            @RequestBody LessonConfirmedDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = lessonService.createLessonConfirmed(reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @PutMapping("/{lessonConfirmedId}/confirmed")
    public ResponseEntity<ResponseDto> updateLessonConfirmed(
            @PathVariable("lessonConfirmedId") Long lessonConfirmedId,
            @RequestBody LessonConfirmedDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = lessonService.updateLessonConfirmed(lessonConfirmedId, reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @PutMapping("/{lessonId}/resign")
    public ResponseEntity<ResponseDto> resignLesson(
            @PathVariable("lessonId") Long lessonId,
            @RequestBody String date,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = lessonService.resignApartUser(lessonId, date, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }
}
