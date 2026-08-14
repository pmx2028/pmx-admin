package com.paramount.pmx.repository.board;

import com.paramount.pmx.model.board.NoteComment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NoteCommentRepository extends JpaRepository<NoteComment, Long> {

    List<NoteComment> findByNoteIdOrderByCreatedAtAscIdAsc(Long noteId);

    Optional<NoteComment> findByIdAndNoteId(Long id, Long noteId);

    void deleteByIdAndNoteId(Long id, Long noteId);

    void deleteByNoteId(Long noteId);
}
