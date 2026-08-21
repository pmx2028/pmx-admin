package com.paramount.pmx.model.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@ToString
@Accessors(chain = true)
public class PaymentMethodDto {

    private Long id;
    private String code;
    private String name;
    private Integer isActive;
    private Integer sortOrder;
    private String createdAt;
    private String updatedAt;

    public static PaymentMethodDto toDto(PaymentMethod method) {
        return from(method);
    }

    public static PaymentMethodDto toDetailDto(PaymentMethod method) {
        return from(method);
    }

    public static PaymentMethodDto toListDto(PaymentMethod method) {
        return from(method);
    }

    private static PaymentMethodDto from(PaymentMethod method) {
        if (method == null) {
            return null;
        }

        return PaymentMethodDto.builder()
                .id(method.getId())
                .code(method.getCode())
                .name(method.getName())
                .isActive(method.getIsActive())
                .sortOrder(method.getSortOrder())
                .createdAt(formatDateTime(method.getCreatedAt()))
                .updatedAt(formatDateTime(method.getUpdatedAt()))
                .build();
    }

    private static String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.toLocalDate() + " " + value.toLocalTime();
    }
}
