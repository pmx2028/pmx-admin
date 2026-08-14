package com.paramount.pmx.controller.api;


import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.common.CoverService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/cover")
@Slf4j
@AllArgsConstructor
public class CoverApiController {

    private final CoverService coverService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ResponseDto> upload(
            @RequestParam("upload") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = coverService.create(file, userDetails);

        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    @GetMapping(value = "/{coverId}")
    public ResponseEntity<ResponseDto> getCoverDetail(
            @PathVariable("coverId") Long coverId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = coverService.getCoverDetail(coverId, userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }


}
