package com.paramount.pmx.controller.api;

import com.paramount.pmx.model.order.PaymentCardDto;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.order.PaymentCardService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment-cards")
@Slf4j
@AllArgsConstructor
public class PaymentCardApiController {

    private final PaymentCardService paymentCardService;

    // 회원별 등록 카드 리스트 조회
    @GetMapping()
    public ResponseEntity<ResponseDto> getCardList(
            @RequestParam("memberId") Long memberId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentCardService.getCardListByMember(memberId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    // 카드(빌링키) 등록
    @PostMapping()
    public ResponseEntity<ResponseDto> createCard(
            @RequestBody PaymentCardDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentCardService.createCard(reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    /** 기본 카드 지정 */
    @PutMapping("/{cardId}/default")
    public ResponseEntity<ResponseDto> setDefaultCard(
            @PathVariable("cardId") Long cardId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentCardService.setDefaultCard(cardId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    /** 카드 삭제(비활성화) 처리 */
    @PutMapping("/{cardId}/delete")
    public ResponseEntity<ResponseDto> deleteCard(
            @PathVariable("cardId") Long cardId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = paymentCardService.deleteCard(cardId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }
}
