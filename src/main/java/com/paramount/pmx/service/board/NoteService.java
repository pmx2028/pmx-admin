package com.paramount.pmx.service.board;


import com.paramount.pmx.model.DatatableDto;
import com.paramount.pmx.model.board.Note;
import com.paramount.pmx.model.board.NoteClip;
import com.paramount.pmx.model.board.NoteComment;
import com.paramount.pmx.model.board.NoteCommentDto;
import com.paramount.pmx.model.board.NoteDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.board.NoteClipRepository;
import com.paramount.pmx.repository.board.NoteCommentRepository;
import com.paramount.pmx.repository.board.NoteRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.specs.board.SearchNoteSpec;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoteService {

    /**
     * boards : 게시판 종류 테이블 (관리 > 게시판관리 메뉴)
     * notes : 각 게시판의 작성글 테이블 (게시판 메뉴)
     */

    private final NoteRepository noteRepository;
    private final NoteClipRepository noteClipRepository;
    private final NoteCommentRepository noteCommentRepository;

    // 게시글 리스트 조회
    public ResponseDto getNoteList(Long boardId, Map<String, Object> requestParams, CustomUserDetails userDetails){
        Sort defaultSort = Sort.by(Sort.Direction.DESC, "createdAt");
        DatatableDto datatableDto = new DatatableDto(requestParams, defaultSort, SearchNoteSpec::getValidSortKey);

        // ✨ 공통 조건 동적 주입
        Map<String, Object> extraSearch = new HashMap<>();
        extraSearch.put("BOARD_ID_EQUAL", boardId);
        datatableDto.getSearch().putAll(extraSearch);

        Specification<Note> spec = SearchNoteSpec.createSpecification(datatableDto.getSearch());

        Page<Note> page = noteRepository.findAll(spec, datatableDto.getPageable());
        List<NoteDto> result = page.getContent().stream()
                .map(n -> NoteDto.toListDto(n, userDetails))
                .toList();

        long recordsTotal = noteRepository.count(SearchNoteSpec.createSpecification(new HashMap<>()));        // 전체 개수

        // 3) DataTables 형식으로 응답
        return Response.ok(
                result,
                datatableDto.getDraw(),
                recordsTotal,
                page.getTotalElements()
        );
    }

    @Transactional
    public ResponseDto getDetail(Long boardId, Long noteId, CustomUserDetails userDetails) {
        Note note = noteRepository.findByIdAndBoardId(noteId, boardId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 ID 입니다."));

        return Response.ok(NoteDto.toDetailDto(note, userDetails));
    }

    @Transactional
    public ResponseDto create(Long boardId, NoteDto reqDto, CustomUserDetails userDetails) {
        Note note = Note.builder()
                .boardId(boardId)
                .userId(userDetails.getId())
                .title(reqDto.getTitle())
                .content(reqDto.getContent())
                .hitsCount(0)
                .build();
        Note savedNote = noteRepository.save(note);

        if (!reqDto.getClipIds().isEmpty()) {
            List<NoteClip> noteClips = reqDto.getClipIds().stream()
                    .map(clipId -> NoteClip.builder()
                            .noteId(savedNote.getId())   // 방금 저장한 Note ID
                            .clipId(clipId)
                            .build()
                    )
                    .toList();
            noteClipRepository.saveAll(noteClips);
        }

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto update(Long boardId, Long noteId, NoteDto reqDto) {
        Note note = noteRepository.findByIdAndBoardId(noteId, boardId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 ID 입니다."));

        note.setTitle(reqDto.getTitle());
        note.setContent(reqDto.getContent());
        noteRepository.save(note);

        // note_clip 수정
        noteClipRepository.deleteByNoteId(note.getId());

        if (reqDto.getClipIds() != null && !reqDto.getClipIds().isEmpty()) {
            List<NoteClip> noteClips = reqDto.getClipIds().stream()
                    .map(clipId -> NoteClip.builder()
                            .noteId(note.getId())
                            .clipId(clipId)
                            .build()
                    )
                    .toList();
            noteClipRepository.saveAll(noteClips);
        }

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto delete(Long boardId, Long noteId) {
        noteCommentRepository.deleteByNoteId(noteId);
        noteRepository.deleteByIdAndBoardId(noteId, boardId);
        return Response.ok(true);
    }

    @Transactional
    public ResponseDto createComment(Long boardId, Long noteId, NoteCommentDto reqDto, CustomUserDetails userDetails) {
        Note note = getCommentableNote(boardId, noteId);
        validateCommentContent(reqDto);

        NoteComment comment = NoteComment.builder()
                .noteId(note.getId())
                .parentId(reqDto.getParentId())
                .userId(userDetails.getId())
                .writer(userDetails.getId())
                .content(reqDto.getContent().trim())
                .build();

        NoteComment savedComment = noteCommentRepository.save(comment);
        return Response.ok(NoteCommentDto.from(savedComment, userDetails));
    }

    @Transactional
    public ResponseDto updateComment(Long boardId, Long noteId, Long commentId, NoteCommentDto reqDto, CustomUserDetails userDetails) {
        getCommentableNote(boardId, noteId);
        validateCommentContent(reqDto);

        NoteComment comment = noteCommentRepository.findByIdAndNoteId(commentId, noteId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));
        validateCommentOwner(comment, userDetails);

        comment.setContent(reqDto.getContent().trim());
        return Response.ok(NoteCommentDto.from(noteCommentRepository.save(comment), userDetails));
    }

    @Transactional
    public ResponseDto deleteComment(Long boardId, Long noteId, Long commentId, CustomUserDetails userDetails) {
        getCommentableNote(boardId, noteId);

        NoteComment comment = noteCommentRepository.findByIdAndNoteId(commentId, noteId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));
        validateCommentOwner(comment, userDetails);

        noteCommentRepository.deleteByIdAndNoteId(commentId, noteId);
        return Response.ok(true);
    }

    private Note getCommentableNote(Long boardId, Long noteId) {
        Note note = noteRepository.findByIdAndBoardId(noteId, boardId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 ID 입니다."));

        if (note.getBoard() == null || !Integer.valueOf(1).equals(note.getBoard().getCommented())) {
            throw new IllegalArgumentException("댓글을 사용할 수 없는 게시글입니다.");
        }
        return note;
    }

    private void validateCommentContent(NoteCommentDto reqDto) {
        if (reqDto == null || reqDto.getContent() == null || reqDto.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("댓글 내용을 입력해주세요.");
        }
    }

    private void validateCommentOwner(NoteComment comment, CustomUserDetails userDetails) {
        if (userDetails == null
                || (!Objects.equals(userDetails.getId(), comment.getUserId()) && !userDetails.hasAdminRole())) {
            throw new IllegalArgumentException("댓글을 수정하거나 삭제할 권한이 없습니다.");
        }
    }



}
