package com.paramount.pmx.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum OrderStatus {
    READY,              // 주문 생성
    PAYMENT_PENDING,    // 결제 대기
    PAID,               // 결제 완료
    CANCELLED,          // 주문 취소
    REFUNDED            // 환불 완료
}
