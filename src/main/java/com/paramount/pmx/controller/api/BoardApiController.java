package com.paramount.pmx.controller.api;


import com.paramount.pmx.model.board.BoardDto;
import com.paramount.pmx.model.board.NoteCommentDto;
import com.paramount.pmx.model.board.NoteDto;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.board.BoardService;
import com.paramount.pmx.service.board.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/boards")
public class BoardApiController {

    private final BoardService boardService;
    private final NoteService noteService;

    // 게시판 리스트
    @GetMapping
    public ResponseEntity<ResponseDto> getBoardList(
            @RequestParam Map<String, Object> requestParams,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(boardService.getBoardList(requestParams));
    }

    // 게시판 생성
    @PostMapping
    public ResponseEntity<ResponseDto> createBoard(@RequestBody BoardDto dto, @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(boardService.create(dto));
    }

    // 게시판 상세
    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto> getBoardDetail(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(boardService.getDetail(id));
    }

    // 게시판 수정
    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> updateBoard(@PathVariable Long id, @RequestBody BoardDto dto, @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(boardService.update(id, dto));
    }

    // 게시판 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> deleteBoard(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(boardService.delete(id));
    }

    // =======================================================================================================================

    // 게시글 리스트
    @GetMapping("/{boardId}/notes")
    public ResponseEntity<ResponseDto> getNoteList(
            @PathVariable("boardId") Long boardId,
            @RequestParam Map<String, Object> requestParams,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(noteService.getNoteList(boardId, requestParams, user));
    }

    // 게시글 작성
    @PostMapping("/{boardId}/notes")
    public ResponseEntity<ResponseDto> createNote(
            @PathVariable("boardId") Long boardId,
            @RequestBody NoteDto dto,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(noteService.create(boardId, dto, user));
    }

    // 게시글 상세
    @GetMapping("/{boardId}/notes/{noteId}")
    public ResponseEntity<ResponseDto> getNoteDetail(
            @PathVariable("boardId") Long boardId,
            @PathVariable("noteId") Long noteId,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(noteService.getDetail(boardId, noteId, user));
    }

    // 게시글 수정
    @PutMapping("/{boardId}/notes/{noteId}")
    public ResponseEntity<ResponseDto> updateNote(
            @PathVariable("boardId") Long boardId,
            @PathVariable("noteId") Long noteId,
            @RequestBody NoteDto dto,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(noteService.update(boardId, noteId, dto));
    }

    // 게시글 삭제
    @DeleteMapping("/{boardId}/notes/{noteId}")
    public ResponseEntity<ResponseDto> deleteNote(
            @PathVariable("boardId") Long boardId,
            @PathVariable("noteId") Long noteId,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(noteService.delete(boardId, noteId));
    }

    // 댓글 작성
    @PostMapping("/{boardId}/notes/{noteId}/comments")
    public ResponseEntity<ResponseDto> createNoteComment(
            @PathVariable("boardId") Long boardId,
            @PathVariable("noteId") Long noteId,
            @RequestBody NoteCommentDto dto,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(noteService.createComment(boardId, noteId, dto, user));
    }

    // 댓글 수정
    @PutMapping("/{boardId}/notes/{noteId}/comments/{commentId}")
    public ResponseEntity<ResponseDto> updateNoteComment(
            @PathVariable("boardId") Long boardId,
            @PathVariable("noteId") Long noteId,
            @PathVariable("commentId") Long commentId,
            @RequestBody NoteCommentDto dto,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(noteService.updateComment(boardId, noteId, commentId, dto, user));
    }

    // 댓글 삭제
    @DeleteMapping("/{boardId}/notes/{noteId}/comments/{commentId}")
    public ResponseEntity<ResponseDto> deleteNoteComment(
            @PathVariable("boardId") Long boardId,
            @PathVariable("noteId") Long noteId,
            @PathVariable("commentId") Long commentId,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(noteService.deleteComment(boardId, noteId, commentId, user));
    }


}
