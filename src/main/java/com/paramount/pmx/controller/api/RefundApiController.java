package com.paramount.pmx.controller.api;

import com.paramount.pmx.model.refund.RefundDto;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.refund.RefundService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/refunds")
@Slf4j
@AllArgsConstructor
public class RefundApiController {

    private final RefundService refundService;

    // 환불 리스트 조회
    @GetMapping()
    public ResponseEntity<ResponseDto> getRefundList(
            @RequestParam Map<String, Object> requestParams,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = refundService.getAllRefundList(requestParams, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    // 환불 요청 생성
    @PostMapping()
    public ResponseEntity<ResponseDto> createRefund(
            @RequestBody RefundDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = refundService.createRefund(reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @GetMapping("/{refundId}")
    public ResponseEntity<ResponseDto> getRefundDetail(
            @PathVariable("refundId") Long refundId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = refundService.getRefundDetail(refundId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    /** 환불 처리중 상태 변경 */
    @PutMapping("/{refundId}/process")
    public ResponseEntity<ResponseDto> processRefund(
            @PathVariable("refundId") Long refundId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = refundService.processRefund(refundId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    /** 환불 완료 처리 */
    @PutMapping("/{refundId}/complete")
    public ResponseEntity<ResponseDto> completeRefund(
            @PathVariable("refundId") Long refundId,
            @RequestBody RefundDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = refundService.completeRefund(refundId, reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    /** 환불 실패 처리 */
    @PutMapping("/{refundId}/fail")
    public ResponseEntity<ResponseDto> failRefund(
            @PathVariable("refundId") Long refundId,
            @RequestBody RefundDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = refundService.failRefund(refundId, reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }
}
