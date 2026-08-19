package com.paramount.pmx.model.member;

public record MemberReqDto(
        String login,
        String password,
        String name,
        String email,
        String mobile,
        Long apartId,
        String address,
        String zipcode,
        String sex,
        String birthday,
        Integer confirmed,
        Integer activated,
        String currentPassword,
        String newPassword
) {}
