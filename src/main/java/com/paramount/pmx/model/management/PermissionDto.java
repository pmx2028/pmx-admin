package com.paramount.pmx.model.management;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PermissionDto {

    private Long id;
    private String code;
    private String name;
    private String type;
    private String description;

    public static PermissionDto from(Permission permission) {
        return PermissionDto.builder()
                .id(permission.getId())
                .code(permission.getCode())
                .name(permission.getName())
                .type(permission.getType())
                .description(permission.getDescription())
                .build();
    }
}
