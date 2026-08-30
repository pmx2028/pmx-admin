package com.paramount.pmx.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public enum Confirmed {
    CONFIRMED_NULL( " " , "미등록"),
    CONFIRMED_0("0", "등록"),
    CONFIRMED_1("1", "확정"),
    CONFIRMED_2("2", "마감"),
    ;

    private final String code;
    private final String description;

    public static Confirmed fromCode(String code) {
        if (code == null) return null;
        for (Confirmed type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return null;
    }

    public static String getDescription(String code) {
        Confirmed type = fromCode(code);
        return type != null ? type.description : "";
    }

}
