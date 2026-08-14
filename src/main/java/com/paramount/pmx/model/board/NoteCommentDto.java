package com.paramount.pmx.model.board;

import com.paramount.pmx.security.CustomUserDetails;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Objects;

@Data
@Builder
public class NoteCommentDto {

    private Long id;
    private Long noteId;
    private Long parentId;
    private Long userId;
    private String userName;
    private Long writer;
    private String content;
    private boolean editable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NoteCommentDto from(NoteComment entity, CustomUserDetails userDetails) {
        boolean editable = userDetails != null
                && (Objects.equals(userDetails.getId(), entity.getUserId()) || userDetails.hasAdminRole());

        return NoteCommentDto.builder()
                .id(entity.getId())
                .noteId(entity.getNoteId())
                .parentId(entity.getParentId())
                .userId(entity.getUserId())
                .userName(entity.getUser() == null ? "-" : entity.getUser().getName())
                .writer(entity.getWriter())
                .content(entity.getContent())
                .editable(editable)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
