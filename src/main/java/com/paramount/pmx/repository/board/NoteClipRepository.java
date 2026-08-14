package com.paramount.pmx.repository.board;

import com.paramount.pmx.model.board.NoteClip;
import org.springframework.data.jpa.repository.JpaRepository;


public interface NoteClipRepository extends JpaRepository<NoteClip, Long> {

    void deleteByNoteId(Long noteId);
}
