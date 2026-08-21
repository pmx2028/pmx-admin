package com.paramount.pmx.controller.api;

import com.paramount.pmx.model.order.PaymentDto;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.refund.PaymentService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Slf4j
@AllArgsConstructor
public class PaymentApiController {

    private final PaymentService paymentService;

    // 결제 리스트 조회
    @GetMapping()
    public ResponseEntity<ResponseDto> getPaymentList(
            @RequestParam Map<String, Object> requestParams,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentService.getAllPaymentList(requestParams, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    // 주문별 결제 리스트 조회
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ResponseDto> getPaymentListByOrder(
            @PathVariable("orderId") Long orderId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentService.getPaymentListByOrder(orderId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    // 결제 생성(요청)
    @PostMapping()
    public ResponseEntity<ResponseDto> createPayment(
            @RequestBody PaymentDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentService.createPayment(reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<ResponseDto> getPaymentDetail(
            @PathVariable("paymentId") Long paymentId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentService.getPaymentDetail(paymentId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    /** 결제 승인 처리 */
    @PutMapping("/{paymentId}/approve")
    public ResponseEntity<ResponseDto> approvePayment(
            @PathVariable("paymentId") Long paymentId,
            @RequestBody PaymentDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentService.approvePayment(paymentId, reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    /** 결제 실패 처리 */
    @PutMapping("/{paymentId}/fail")
    public ResponseEntity<ResponseDto> failPayment(
            @PathVariable("paymentId") Long paymentId,
            @RequestBody PaymentDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentService.failPayment(paymentId, reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    /** 결제 취소 처리 */
    @PutMapping("/{paymentId}/cancel")
    public ResponseEntity<ResponseDto> cancelPayment(
            @PathVariable("paymentId") Long paymentId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentService.cancelPayment(paymentId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }
}
