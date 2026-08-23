package com.paramount.pmx.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ApartActivated {
    LEVEL_0(0L, "미운영"),
    // 1: 직원 계정이 아닌 d, d+ 유저 (예전에 사용되고 지금은 paid_users를 사용하는 것으로 예상하나 데이터 구분하기 위해 일담 둠)
    LEVEL_1(1L, "운영"),
    ;

    private Long code;
    private String description;
}
