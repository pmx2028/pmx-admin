package com.paramount.pmx.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum WeekdayCode {
    MONDAY(1L, "화.목"),
    TUESDAY(2L, "수.금"),
    WEDNESDAY(3L, "토.일"),
    THURSDAY(4L, "월.수.금"),
    FRIDAY(5L, "토"),
    MONDAY_WEDNESDAY(6L, "일"),
    ;


    private final Long code;
    private final String description;

    public static String getDescription(Long code) {
        if (code == null) {
            return null;
        }
        for (WeekdayCode weekdayCode : WeekdayCode.values()) {
            if (weekdayCode.code.equals(code)) {
                return weekdayCode.description;
            }
        }
        return null;
    }
}
