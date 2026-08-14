package com.paramount.pmx.model.user;


public record UserReqDto(
        String login,
        String password,
        String name,
        Long roleId, // 직책
        String roleName, // 직책명
        String email, // 이메일
        String mobile, // 휴대폰
        Long level, // 0인 경우 로그인은 가능하지만 내기사 영역만 볼수있음
        String zipcode,
        String address,
        String sex,
        String birthday,
        Long coverId,
        Long coverId1,
        // 비밀번호 변경시 사용됨
        String currentPassword,
        String newPassword
) {}
