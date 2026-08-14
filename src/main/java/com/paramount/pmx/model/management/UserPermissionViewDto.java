package com.paramount.pmx.model.management;

public record UserPermissionViewDto(
        Long permissionId,
        String code,
        String name,
        boolean defaultAllow,
        String userEffect,   // "ALLOW" | "DENY" | null
        boolean effective
) {}
