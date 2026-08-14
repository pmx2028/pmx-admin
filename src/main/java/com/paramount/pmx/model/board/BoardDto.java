package com.paramount.pmx.model.board;

import com.paramount.pmx.model.enums.BoardAnon;
import com.paramount.pmx.model.enums.BoardKindOf;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BoardDto {

    private Long id;
    private String name;
    private String code;
    private Long userId;
    private Integer kindof;
    private String kindofLabel;
    private Integer activated;
    private Integer commented;
    private Integer anon;
    private String anonLabel;
    private Long noteCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BoardDto from(BoardQueryListDto entity) {
        return BoardDto.builder()
                .id(entity.id())
                .name(entity.name())
                .code(entity.code())
                .kindofLabel(BoardKindOf.getLabel(entity.kindof()))
                .activated(entity.activated())
                .commented(entity.commented())
                .anonLabel(BoardAnon.getLabel(entity.anon()))
                .noteCount(entity.noteCount())
                .createdAt(entity.createdAt())
                .updatedAt(entity.updatedAt())
                .build();
    }

    public static BoardDto toDetailDto(Board entity) {
        return BoardDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .kindof(entity.getKindof())
                .kindofLabel(BoardKindOf.getLabel(entity.getKindof()))
                .activated(entity.getActivated())
                .commented(entity.getCommented())
                .anon(entity.getAnon())
                .anonLabel(BoardAnon.getLabel(entity.getAnon()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static BoardDto toSideMenuDto(Board entity){
        return BoardDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .kindof(entity.getKindof())
                .kindofLabel(BoardKindOf.getLabel(entity.getKindof()))
                .build();
    }


}
