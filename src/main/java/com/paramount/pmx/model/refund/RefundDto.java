package com.paramount.pmx.model.refund;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@ToString
@Accessors(chain = true)
public class RefundDto {

    private Long id;
    private String refundNo;
    private Long paymentId;
    private Long orderId;
    private String orderNo;
    private Long memberId;
    private String memberName;
    private Integer refundAmount;
    private String refundReasonCode;
    private String refundReason;
    private String refundStatus;
    private String pgCancelId;
    private String resultCode;
    private String resultMessage;
    private String requestedAt;
    private String completedAt;
    private Long requestedBy;
    private String createdAt;
    private String updatedAt;
    private List<String> btnActions;

    public static RefundDto toDto(Refund refund) {
        return from(refund, false);
    }

    public static RefundDto toDetailDto(Refund refund) {
        return from(refund, false);
    }

    public static RefundDto toListDto(Refund refund) {
        return from(refund, true);
    }

    private static RefundDto from(Refund refund, boolean includeActions) {
        if (refund == null) {
            return null;
        }

        List<String> btnActions = new ArrayList<>();
        if (includeActions) {
            if ("REQUESTED".equals(refund.getRefundStatus())) {
                btnActions.add("PROCESS");
                btnActions.add("FAIL");
            }
            if ("PROCESSING".equals(refund.getRefundStatus())) {
                btnActions.add("COMPLETE");
                btnActions.add("FAIL");
            }
        }

        return RefundDto.builder()
                .id(refund.getId())
                .refundNo(refund.getRefundNo())
                .paymentId(refund.getPaymentId())
                .orderId(refund.getOrderId())
                .orderNo(refund.getOrder() == null ? null : refund.getOrder().getOrderNo())
                .memberId(refund.getMemberId())
                .memberName(refund.getMember() == null ? null : refund.getMember().getName())
                .refundAmount(refund.getRefundAmount())
                .refundReasonCode(refund.getRefundReasonCode())
                .refundReason(refund.getRefundReason())
                .refundStatus(refund.getRefundStatus())
                .pgCancelId(refund.getPgCancelId())
                .resultCode(refund.getResultCode())
                .resultMessage(refund.getResultMessage())
                .requestedAt(formatDateTime(refund.getRequestedAt()))
                .completedAt(formatDateTime(refund.getCompletedAt()))
                .requestedBy(refund.getRequestedBy())
                .createdAt(formatDateTime(refund.getCreatedAt()))
                .updatedAt(formatDateTime(refund.getUpdatedAt()))
                .btnActions(btnActions)
                .build();
    }

    private static String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.toLocalDate() + " " + value.toLocalTime();
    }
}
