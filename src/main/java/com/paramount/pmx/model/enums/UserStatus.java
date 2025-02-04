package com.paramount.pmx.model.enums;

import java.util.Arrays;

import com.paramount.pmx.exception.ServiceException;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum UserStatus {
    NORMAL("1", "정상", "정상회원"),
    WAITING("2", "승인대기", "승인대기 - 기업회원용"),
    QUIT("0", "탈퇴완료", "탈퇴완료")
    ;

    private String code;
    private String title;
    private String description;

    public static UserStatus ofCode(String code){
        return Arrays.stream(UserStatus.values())
                .filter(v -> v.getCode().equals(code))
                .findAny()
                .orElseThrow(() -> new ServiceException(String.format("UserStatus의 상태코드에 '[%s]'가 존재하지 않습니다.", code)));
    }
}
