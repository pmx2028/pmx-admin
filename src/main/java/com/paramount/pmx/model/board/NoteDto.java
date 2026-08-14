package com.paramount.pmx.model.board;


import com.paramount.pmx.model.management.ClipDto;
import com.paramount.pmx.security.CustomUserDetails;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Data
@Builder
public class NoteDto {

    private Long id;
    private Long userId;
    private String userName;
    private String title;
    private String content;
    private Long boardId;
    private Integer commented;
    private boolean editable;
    private List<Long> clipIds;
    private List<ClipDto> clipInfoList;
    private List<NoteCommentDto> commentInfoList;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NoteDto toListDto(Note entity, CustomUserDetails userDetails) {
        // 글 작성한 본인 또는 관리자 권한 있는 경우 수정 가능
        boolean editable = userDetails != null
                && (Objects.equals(userDetails.getId(), entity.getUserId()) || userDetails.hasAdminRole());

        List<ClipDto> clipDtoList = entity.getNoteClipList().stream()
                .map(noteClip -> ClipDto.from(noteClip.getClip()))
                .toList();

        return NoteDto.builder()
                .id(entity.getId())
                .userName(entity.getUser()==null ? "-" : entity.getUser().getName())
                .title(entity.getTitle())
                .editable(editable)
                .clipInfoList(clipDtoList)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static NoteDto toDetailDto(Note entity, CustomUserDetails userDetails) {

        List<ClipDto> clipDtoList = entity.getNoteClipList().stream()
                .map(noteClip -> ClipDto.from(noteClip.getClip()))
                .toList();

        List<NoteCommentDto> commentDtoList = entity.getNoteCommentList().stream()
                .map(comment -> NoteCommentDto.from(comment, userDetails))
                .toList();

        return NoteDto.builder()
                .id(entity.getId())
                .userName(entity.getUser()==null ? "-" : entity.getUser().getName())
                .title(entity.getTitle())
                .content(entity.getContent())
                .commented(entity.getBoard().getCommented())            //댓글 가능여부
                .clipInfoList(clipDtoList)
                .commentInfoList(commentDtoList)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
