package com.paramount.pmx.repository.board;

import com.paramount.pmx.model.board.Board;
import com.paramount.pmx.model.board.BoardQueryListDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface BoardRepository extends JpaRepository<Board, Long> {
    @Query(value = """
        SELECT new com.paramount.pmx.model.board.BoardQueryListDto(
            b.id,
            b.name,
            b.code,
            b.kindof,
            b.anon,
            b.commented,
            b.activated,
            COUNT(n.id),
            b.createdAt,
            b.updatedAt
        )
        FROM Board b
        LEFT JOIN Note n ON n.boardId = b.id
        GROUP BY b.id, b.name, b.code, b.kindof, b.anon, b.commented , b.activated, b.createdAt, b.updatedAt
        """,
        countQuery = """
        SELECT COUNT(b)
        FROM Board b
        """
    )
    Page<BoardQueryListDto> findAllWithNoteCount(Pageable pageable);

    List<Board> findByActivated(Integer activated);

    String findNameById(Long id);
}
