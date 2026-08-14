package com.paramount.pmx.controller.api;

import com.paramount.pmx.model.apart.ApartDto;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.apart.ApartService;
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
@RequestMapping("/api/aparts")
@Slf4j
@AllArgsConstructor
public class ApartApiController {

    private final ApartService apartService;

    // 아파트 리스트 조회
    @GetMapping
    public ResponseEntity<ResponseDto> getApartList(
            @RequestParam Map<String, Object> requestParams,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = apartService.getAllApartList(requestParams, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    // 아파트명 중복 체크
    @GetMapping("/name-duplicate")
    public ResponseEntity<ResponseDto> checkDuplicateName(
            @RequestParam("name") String name,
            @RequestParam(value = "excludeId", required = false) Long excludeId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = apartService.checkDuplicateName(name, excludeId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    // 아파트 생성
    @PostMapping
    public ResponseEntity<ResponseDto> createApart(
            @RequestBody ApartDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = apartService.createApart(reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    // 아파트 상세
    @GetMapping("/{apartId}")
    public ResponseEntity<ResponseDto> getApartDetail(
            @PathVariable("apartId") Long apartId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = apartService.getApartDetail(apartId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    // 아파트 수정
    @PutMapping("/{apartId}")
    public ResponseEntity<ResponseDto> updateApart(
            @PathVariable("apartId") Long apartId,
            @RequestBody ApartDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = apartService.updateApart(apartId, reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    // 아파트 중지 처리
    @PutMapping("/{apartId}/resign")
    public ResponseEntity<ResponseDto> resignApart(
            @PathVariable("apartId") Long apartId,
            @RequestBody String date,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = apartService.resignApart(apartId, date, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }
}
