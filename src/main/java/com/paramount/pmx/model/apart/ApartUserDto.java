package com.paramount.pmx.model.apart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@ToString
@Accessors(chain = true)
public class ApartUserDto {

    private Long id;
    private Long apartId;
    private String apartName;
    private Long userId;
    private String userLogin;
    private String userName;
    private Long userLevel;
    private Long roleId;
    private String roleName;
    private String mobile;
    private String email;
    private Long categoryId;
    private String categoryName;
    private Long categoryId1;
    private String categoryName1;
    private Integer commission;
    private Integer capacity;
    private Integer minCapacity;
    private Integer lessonPrice;
    private Integer lessonCnt;
    private String weekdayCodes;
    private String weekdayNames;
    private Integer activated;
    private String createdAt;
    private String updatedAt;
    private List<String> btnActions;

    public static ApartUserDto toDto(ApartUser apartUser) {
        return from(apartUser, false);
    }

    public static ApartUserDto toDetailDto(ApartUser apartUser) {
        return from(apartUser, false);
    }

    public static ApartUserDto toListDto(ApartUser apartUser) {
        return from(apartUser, true);
    }

    private static ApartUserDto from(ApartUser apartUser, boolean includeActions) {
        if (apartUser == null) {
            return null;
        }

        List<String> btnActions = new ArrayList<>();
        if (includeActions) {
            btnActions.add("EDIT");
            if (!Integer.valueOf(0).equals(apartUser.getActivated())) {
                btnActions.add("DELETE");
            }
        }

        return ApartUserDto.builder()
                .id(apartUser.getId())
                .apartId(apartUser.getApartId())
                .apartName(apartUser.getApart() == null ? null : apartUser.getApart().getName())
                .userId(apartUser.getUserId())
                .userLogin(apartUser.getUser() == null ? null : apartUser.getUser().getLogin())
                .userName(apartUser.getUser() == null ? null : apartUser.getUser().getName())
                .userLevel(apartUser.getUser() == null ? null : apartUser.getUser().getLevel())
                .roleId(apartUser.getUser() == null ? null : apartUser.getUser().getRoleId())
                .roleName(apartUser.getUser() == null || apartUser.getUser().getRole() == null ? null : apartUser.getUser().getRole().getName())
                .mobile(apartUser.getUser() == null ? null : apartUser.getUser().getMobile())
                .email(apartUser.getUser() == null ? null : apartUser.getUser().getEmail())
                .categoryId(apartUser.getCategoryId())
                .categoryName(apartUser.getCategory() == null ? null : apartUser.getCategory().getName())
                .categoryId1(apartUser.getCategoryId1())
                .categoryName1(apartUser.getCategory1() == null ? null : apartUser.getCategory1().getName())
                .commission(apartUser.getCommission())
                .capacity(apartUser.getCapacity())
                .minCapacity(apartUser.getMinCapacity())
                .lessonPrice(apartUser.getLessonPrice())
                .lessonCnt(apartUser.getLessonCnt())
                .weekdayCodes(apartUser.getWeekdayCodes())
                .weekdayNames(formatWeekdayNames(apartUser.getWeekdayCodes()))
                .activated(apartUser.getActivated())
                .createdAt(formatDateTime(apartUser.getCreatedAt()))
                .updatedAt(formatDateTime(apartUser.getUpdatedAt()))
                .btnActions(btnActions)
                .build();
    }

    private static String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.toLocalDate() + " " + value.toLocalTime();
    }

    private static String formatWeekdayNames(String weekdayCodes) {
        if (weekdayCodes == null || weekdayCodes.isBlank()) {
            return null;
        }
        return Arrays.stream(weekdayCodes.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(value -> {
                    try {
                        return com.paramount.pmx.model.enums.WeekdayCode.getDescription(Long.valueOf(value));
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toList()
                .stream()
                .reduce((left, right) -> left + "/ " + right)
                .orElse(null);
    }
}
