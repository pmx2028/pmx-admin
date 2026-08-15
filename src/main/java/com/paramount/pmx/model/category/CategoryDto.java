package com.paramount.pmx.model.category;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CategoryDto {

    private Long id;
    private String name;
    private Long parentId;
    private String parentName;
    private Integer activated;
    private Integer position;
    private Integer depth;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CategoryDto from(Category entity) {

        return CategoryDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .activated(entity.getActivated())
                .position(entity.getPosition())
                .depth(entity.getDepth())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
