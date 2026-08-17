package com.paramount.pmx.controller.api;

import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.service.common.CodeService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/code")
@Slf4j
@AllArgsConstructor
public class CodeApiController {

    private final CodeService codeService;

    @GetMapping("/weekday-codes")
    public ResponseEntity<ResponseDto> getWeekdayCodes() {
        return ResponseEntity.ok(codeService.getWeekdayCodes());
    }

    @GetMapping("/user-roles")
    public ResponseEntity<ResponseDto> getUserRoles() {
        return ResponseEntity.ok(codeService.getUserRoles());
    }

    @GetMapping("/category-codes")
    public ResponseEntity<ResponseDto> getCategoryCodes() {
        return ResponseEntity.ok(codeService.getCategoryCodes());
    }

}
