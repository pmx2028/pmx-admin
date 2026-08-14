package com.paramount.pmx.model.board;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BoardKindOf {

    COMMUNITY(0, "커뮤니티"),
    INTERNAL(1, "내부게시판"),
    SYSTEM(2, "시스템게시판");

    private final Integer code;
    private final String label;

    public static BoardKindOf fromCode(Integer code) {
        if (code == null) return null;
        for (BoardKindOf type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return null;
    }

    public static String getLabel(Integer code) {
        BoardKindOf type = fromCode(code);
        return type != null ? type.label : "";
    }
}
