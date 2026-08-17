package com.paramount.pmx.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum TimeCode {
    TIME_06("0600", "06:00"),
    TIME_07("0700", "07:00"),
    TIME_08("0800", "08:00"),
    TIME_09("0900", "09:00"),
    TIME_10("1000", "10:00"),
    TIME_11("1100", "11:00"),
    TIME_12("1200", "12:00"),
    TIME_13("1300", "13:00"),
    TIME_14("1400", "14:00"),
    TIME_15("1500", "15:00"),
    TIME_16("1600", "16:00"),
    TIME_17("1700", "17:00"),
    TIME_18("1800", "18:00"),
    TIME_19("1900", "19:00"),
    TIME_20("2000", "20:00"),
    TIME_21("2100", "21:00"),
    TIME_22("2200", "22:00"),
    TIME_23("2300", "23:00"),
    TIME_24("2400", "24:00"),
    ;
    private final String code;
    private final String description;

    public static String getDescription(String code) {
        if (code == null) {
            return "-";
        }

        for (TimeCode timecode : TimeCode.values()) {
            if (timecode.getCode().equals(code)) {
                return timecode.getDescription();
            }
        }

        return "-";
    }

}
