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
public class PaymentCardDto {

    private Long id;
    private Long memberId;
    private String memberName;
    private String billingKey;
    private String cardCompany;
    private String cardBin;
    private String cardLast4;
    private String cardType;
    private Integer isDefault;
    private Integer isDeleted;
    private String registeredAt;
    private String deletedAt;
    private String createdAt;
    private String updatedAt;
    private List<String> btnActions;

    public static PaymentCardDto toDto(PaymentCard card) {
        return from(card, false);
    }

    public static PaymentCardDto toDetailDto(PaymentCard card) {
        return from(card, false);
    }

    public static PaymentCardDto toListDto(PaymentCard card) {
        return from(card, true);
    }

    private static PaymentCardDto from(PaymentCard card, boolean includeActions) {
        if (card == null) {
            return null;
        }

        List<String> btnActions = new ArrayList<>();
        if (includeActions && !Integer.valueOf(1).equals(card.getIsDeleted())) {
            if (!Integer.valueOf(1).equals(card.getIsDefault())) {
                btnActions.add("SET_DEFAULT");
            }
            btnActions.add("DELETE");
        }

        return PaymentCardDto.builder()
                .id(card.getId())
                .memberId(card.getMemberId())
                .memberName(card.getMember() == null ? null : card.getMember().getName())
                .billingKey(card.getBillingKey())
                .cardCompany(card.getCardCompany())
                .cardBin(card.getCardBin())
                .cardLast4(card.getCardLast4())
                .cardType(card.getCardType())
                .isDefault(card.getIsDefault())
                .isDeleted(card.getIsDeleted())
                .registeredAt(formatDateTime(card.getRegisteredAt()))
                .deletedAt(formatDateTime(card.getDeletedAt()))
                .createdAt(formatDateTime(card.getCreatedAt()))
                .updatedAt(formatDateTime(card.getUpdatedAt()))
                .btnActions(btnActions)
                .build();
    }

    private static String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.toLocalDate() + " " + value.toLocalTime();
    }
}
