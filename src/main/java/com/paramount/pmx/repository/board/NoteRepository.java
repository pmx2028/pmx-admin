package com.paramount.pmx.repository.board;

import com.paramount.pmx.model.board.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;


public interface NoteRepository extends JpaRepository<Note, Long>, JpaSpecificationExecutor<Note> {

    Optional<Note> findByIdAndBoardId(Long id, Long boardId);

    void deleteByIdAndBoardId(Long id, Long boardId);
}
