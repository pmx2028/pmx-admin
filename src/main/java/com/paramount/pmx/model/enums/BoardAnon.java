package com.paramount.pmx.model.enums;


import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BoardAnon {

    PUBLIC(0, "공개"),
    ANONYMOUS(1, "익명"),
    ADMIN(2, "관리자")
    ;

    private final Integer code;
    private final String label;

    public static BoardAnon fromCode(Integer code) {
        if (code == null) return null;
        for (BoardAnon type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return null;
    }

    public static String getLabel(Integer code) {
        BoardAnon type = fromCode(code);
        return type != null ? type.label : "";
    }
}
