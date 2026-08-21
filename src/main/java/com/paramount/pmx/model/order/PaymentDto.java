package com.paramount.pmx.model.order;

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
public class PaymentDto {

    private Long id;
    private Long orderId;
    private String orderNo;
    private Long paymentMethodId;
    private String paymentMethodName;
    private Long paymentCardId;
    private String pgCompany;
    private String mchtId;
    private String mchtTrdNo;
    private String trdNo;
    private String paymentMethod;
    private String transactionType;
    private String paymentStatus;
    private Integer amount;
    private String vactBankCd;
    private String vactNo;
    private String vactInDt;
    private String pktHash;
    private String requestedAt;
    private String trdDt;
    private String trdTm;
    private String approvedAt;
    private String resultCode;
    private String resultMessage;
    private String rawResponse;
    private String createdAt;
    private String updatedAt;
    private List<String> btnActions;

    public static PaymentDto toDto(Payment payment) {
        return from(payment, false, false);
    }

    public static PaymentDto toDetailDto(Payment payment) {
        return from(payment, false, true);
    }

    public static PaymentDto toListDto(Payment payment) {
        return from(payment, true, false);
    }

    private static PaymentDto from(Payment payment, boolean includeActions, boolean includeRawResponse) {
        if (payment == null) {
            return null;
        }

        List<String> btnActions = new ArrayList<>();
        if (includeActions) {
            if ("READY".equals(payment.getPaymentStatus()) || "IN_PROGRESS".equals(payment.getPaymentStatus())) {
                btnActions.add("APPROVE");
                btnActions.add("FAIL");
            }
            if ("DONE".equals(payment.getPaymentStatus())) {
                btnActions.add("CANCEL");
            }
        }

        return PaymentDto.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .orderNo(payment.getOrder() == null ? null : payment.getOrder().getOrderNo())
                .paymentMethodId(payment.getPaymentMethodId())
                .paymentMethodName(payment.getMethod() == null ? null : payment.getMethod().getName())
                .paymentCardId(payment.getPaymentCardId())
                .pgCompany(payment.getPgCompany())
                .mchtId(payment.getMchtId())
                .mchtTrdNo(payment.getMchtTrdNo())
                .trdNo(payment.getTrdNo())
                .paymentMethod(payment.getPaymentMethod())
                .transactionType(payment.getTransactionType())
                .paymentStatus(payment.getPaymentStatus())
                .amount(payment.getAmount())
                .vactBankCd(payment.getVactBankCd())
                .vactNo(payment.getVactNo())
                .vactInDt(formatDateTime(payment.getVactInDt()))
                .pktHash(payment.getPktHash())
                .requestedAt(formatDateTime(payment.getRequestedAt()))
                .trdDt(payment.getTrdDt())
                .trdTm(payment.getTrdTm())
                .approvedAt(formatDateTime(payment.getApprovedAt()))
                .resultCode(payment.getResultCode())
                .resultMessage(payment.getResultMessage())
                .rawResponse(includeRawResponse ? payment.getRawResponse() : null)
                .createdAt(formatDateTime(payment.getCreatedAt()))
                .updatedAt(formatDateTime(payment.getUpdatedAt()))
                .btnActions(btnActions)
                .build();
    }

    private static String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.toLocalDate() + " " + value.toLocalTime();
    }
}
