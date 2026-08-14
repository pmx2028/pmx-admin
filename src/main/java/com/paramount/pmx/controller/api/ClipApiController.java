package com.paramount.pmx.controller.api;

import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.common.ClipService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/clip")
@Slf4j
@AllArgsConstructor
public class ClipApiController {

    private final ClipService clipService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ResponseDto> upload(
            @RequestParam("upload") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = clipService.create(file, userDetails);

        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }


}
