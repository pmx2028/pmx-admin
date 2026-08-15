package com.paramount.pmx.model.category;

public record OwnCategoryTreeDto(
        Long id,
        String name,
        Long parentId,
        String parentName,
        Integer depth,
        Integer position,
        Integer activated
) {
}
