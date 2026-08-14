package com.paramount.pmx.model.management;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoleDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private boolean activated;

    public static RoleDto from(Role role) {
        return RoleDto.builder()
                .id(role.getId())
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .activated(role.isActivated())
                .build();
    }
}
