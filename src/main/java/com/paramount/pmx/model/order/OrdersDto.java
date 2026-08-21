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
public class OrdersDto {

    private Long id;
    private String orderNo;
    private Long memberId;
    private String memberName;
    private Long apartId;
    private String apartName;
    private Long lessonId;
    private String lessonYear;
    private String lessonMonth;
    private String orderName;
    private Integer orderAmount;
    private Integer discountAmount;
    private Integer paymentAmount;
    private String orderStatus;
    private String orderedAt;
    private String createdAt;
    private String updatedAt;
    private List<String> btnActions;

    public static OrdersDto toDto(Orders order) {
        return from(order, false);
    }

    public static OrdersDto toDetailDto(Orders order) {
        return from(order, false);
    }

    public static OrdersDto toListDto(Orders order) {
        return from(order, true);
    }

    private static OrdersDto from(Orders order, boolean includeActions) {
        if (order == null) {
            return null;
        }

        List<String> btnActions = new ArrayList<>();
        if (includeActions) {
            if ("READY".equals(order.getOrderStatus()) || "PAYMENT_PENDING".equals(order.getOrderStatus())) {
                btnActions.add("EDIT");
                btnActions.add("CANCEL");
            }
        }

        return OrdersDto.builder()
                .id(order.getId())
                .orderNo(order.getOrderNo())
                .memberId(order.getMemberId())
                .memberName(order.getMember() == null ? null : order.getMember().getName())
                .apartId(order.getApartId())
                .apartName(order.getApart() == null ? null : order.getApart().getName())
                .lessonId(order.getLessonId())
                .lessonYear(order.getLesson() == null ? null : order.getLesson().getYear())
                .lessonMonth(order.getLesson() == null ? null : order.getLesson().getMonth())
                .orderName(order.getOrderName())
                .orderAmount(order.getOrderAmount())
                .discountAmount(order.getDiscountAmount())
                .paymentAmount(order.getPaymentAmount())
                .orderStatus(order.getOrderStatus())
                .orderedAt(formatDateTime(order.getOrderedAt()))
                .createdAt(formatDateTime(order.getCreatedAt()))
                .updatedAt(formatDateTime(order.getUpdatedAt()))
                .btnActions(btnActions)
                .build();
    }

    private static String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.toLocalDate() + " " + value.toLocalTime();
    }
}
