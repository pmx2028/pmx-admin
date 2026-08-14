package com.paramount.pmx.model.board;

import java.time.LocalDateTime;

public record BoardQueryListDto(
        Long id,
        String name,
        String code,
        Integer kindof,
        Integer anon,
        Integer commented,
        Integer activated,
        Long noteCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
