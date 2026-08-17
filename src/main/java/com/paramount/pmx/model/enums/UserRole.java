package com.paramount.pmx.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum UserRole {
    TRAINER(1L, "강사" ),
    MANAGER(2L, "매니저"),
    EMPLOYEE(3L, "직원"),
    ADMIN(4L, "관리자"),
    ;
    private final Long code;
    private final String description;


    public static String getDescription(Long code) {
        if (code == null) {
            return "-";
        }

        for (UserRole role : UserRole.values()) {
            if (role.getCode().equals(code)) {
                return role.getDescription();
            }
        }

        return "-";
    }

}
