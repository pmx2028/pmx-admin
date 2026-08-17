package com.paramount.pmx.controller.api;

import com.paramount.pmx.model.apart.ApartUserDto;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.apart.ApartUserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/apart-user")
@Slf4j
@AllArgsConstructor
public class ApartUserApiController {

    private final ApartUserService apartUserService;

    @GetMapping
    public ResponseEntity<ResponseDto> getApartUserList(
            @RequestParam Map<String, Object> requestParams,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = apartUserService.getAllApartUserList(requestParams, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @GetMapping("/duplicate")
    public ResponseEntity<ResponseDto> checkDuplicateApartUser(
            @RequestParam("apartId") Long apartId,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "categoryId1", required = false) Long categoryId1,
            @RequestParam(value = "excludeId", required = false) Long excludeId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = apartUserService.checkDuplicateApartUser(apartId, userId, categoryId1, excludeId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ResponseDto> createApartUser(
            @RequestBody ApartUserDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = apartUserService.createApartUser(reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @GetMapping("/{apartUserId}")
    public ResponseEntity<ResponseDto> getApartUserDetail(
            @PathVariable("apartUserId") Long apartUserId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = apartUserService.getApartUserDetail(apartUserId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @PutMapping("/{apartUserId}")
    public ResponseEntity<ResponseDto> updateApartUser(
            @PathVariable("apartUserId") Long apartUserId,
            @RequestBody ApartUserDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = apartUserService.updateApartUser(apartUserId, reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @PutMapping("/{apartUserId}/resign")
    public ResponseEntity<ResponseDto> resignApartUser(
            @PathVariable("apartUserId") Long apartUserId,
            @RequestBody String date,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = apartUserService.resignApartUser(apartUserId, date, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }
}
