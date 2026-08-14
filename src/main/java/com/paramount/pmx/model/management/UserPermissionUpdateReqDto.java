package com.paramount.pmx.model.management;

public record UserPermissionUpdateReqDto(
        Long permissionId,
        UserPermission.Mode effect
) {
}
