package com.paramount.pmx.controller.api;

import com.paramount.pmx.model.pay.HectoPayRequestDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.pay.HectoPayService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pay/hecto")
@Slf4j
@AllArgsConstructor
public class HectoPayApiController {

    private final HectoPayService hectoPayService;

    // 결제창(SETTLE_PG.pay) 호출에 필요한 결제요청 정보 조회 (관리자 세션 필요)
    @GetMapping("/{paymentId}")
    public ResponseEntity<ResponseDto> getPayRequest(
            @PathVariable("paymentId") Long paymentId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        HectoPayRequestDto payRequest = hectoPayService.buildPayRequest(paymentId);
        return new ResponseEntity<>(Response.ok(payRequest), HttpStatus.OK);
    }

    // 헥토파이낸셜 서버 → 가맹점 서버 결제결과 통보(notiUrl). PG 서버가 직접 호출하므로 SecurityConfig에서 인증을 제외한다.
    @PostMapping("/notify")
    public ResponseEntity<String> notify(@RequestParam Map<String, String> params) {
        String result = hectoPayService.handleNotify(params);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
