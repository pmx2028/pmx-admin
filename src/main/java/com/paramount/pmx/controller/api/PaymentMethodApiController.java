package com.paramount.pmx.controller.api;

import com.paramount.pmx.model.order.PaymentMethodDto;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.order.PaymentMethodService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment-methods")
@Slf4j
@AllArgsConstructor
public class PaymentMethodApiController {

    private final PaymentMethodService paymentMethodService;

    // 사용 가능한 결제수단 코드 리스트 조회 (CARD, VBANK 등)
    @GetMapping()
    public ResponseEntity<ResponseDto> getActiveMethodList(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentMethodService.getActiveMethodList(userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    // 결제수단 코드 등록
    @PostMapping()
    public ResponseEntity<ResponseDto> createMethod(
            @RequestBody PaymentMethodDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentMethodService.createMethod(reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @PutMapping("/{methodId}")
    public ResponseEntity<ResponseDto> updateMethod(
            @PathVariable("methodId") Long methodId,
            @RequestBody PaymentMethodDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentMethodService.updateMethod(methodId, reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }
}
