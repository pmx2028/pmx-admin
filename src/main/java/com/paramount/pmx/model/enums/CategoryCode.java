package com.paramount.pmx.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

@Getter
@AllArgsConstructor
public enum CategoryCode {
    GX(1L, "GX"  ),
    HEALTH(2L, "헬스"),
    GOLF(3L, "골프"),
    TUNI(4L, "트니트니");

    private final Long code;
    private final String description;
    public static CategoryCode fromCode(Long code) {
        if (code == null) {
            return null;
        }

        return Arrays.stream(values())
                .filter(v -> v.getCode().equals(code))
                .findFirst()
                .orElse(null);
    }

}
