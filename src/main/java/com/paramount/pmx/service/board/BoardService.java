package com.paramount.pmx.service.board;


import com.paramount.pmx.model.DatatableDto;
import com.paramount.pmx.model.board.Board;
import com.paramount.pmx.model.board.BoardDto;
import com.paramount.pmx.model.board.BoardQueryListDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.board.BoardRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardService {

    /**
     * boards : 게시판 종류 테이블 (관리 > 게시판관리 메뉴)
     * notes : 각 게시판의 작성글 테이블 (게시판 메뉴)
     */

    private final BoardRepository boardRepository;

    // =========================================
    // View 컨트롤러에서 활용되는 메서드
    // =========================================

    //사이드 바에 뿌릴 게시판들 가져오기
    public Map<Integer, List<BoardDto>> getBoardSideMenu(){
        return boardRepository.findByActivated(1)
                .stream()
                .map(BoardDto::toSideMenuDto)
                .collect(Collectors.groupingBy(
                        BoardDto::getKindof,
                        () -> new TreeMap<>(Comparator.reverseOrder()),  // 키를 내림차순 정렬
                        Collectors.toList()
                ));
    }

    public String getBoardName(Long boardId){
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시판을 찾을 수 없습니다."));

        return board.getName();
    }


    // =========================================
    // 게시판 관리
    // =========================================

    // 게시판 리스트 조회
    public ResponseDto getBoardList(Map<String, Object> requestParams){

        // 1. DatatableDto 생성 (기본 정렬 기준: createdAt desc )
        Sort defaultSort = Sort.by(Sort.Direction.DESC, "createdAt");
        DatatableDto datatableDto = new DatatableDto(requestParams, defaultSort);

        // 2. 데이터 조회
        Page<BoardQueryListDto> page = boardRepository.findAllWithNoteCount(datatableDto.getPageable());

        // 3. DTO 변환
        List<BoardDto> resultData = page.getContent().stream()
                .map(BoardDto::from)
                .toList();

        return Response.ok(
                resultData,
                datatableDto.getDraw(),
                boardRepository.count(),
                page.getTotalElements()
        );
    }

    public ResponseDto getDetail(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 ID 입니다."));

        return Response.ok(BoardDto.toDetailDto(board));
    }

    @Transactional
    public ResponseDto create(BoardDto reqDto) {
        Board board = Board.builder()
                .name(reqDto.getName())
                .code(reqDto.getCode())
                .kindof(reqDto.getKindof())
                .anon(reqDto.getAnon())
                .activated(reqDto.getActivated())
                .commented(reqDto.getCommented())
                .build();

        boardRepository.save(board);
        return Response.ok(true);
    }

    @Transactional
    public ResponseDto update(Long id, BoardDto reqDto) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 ID 입니다."));

        board.setName(reqDto.getName());
        board.setCode(reqDto.getCode());
        board.setKindof(reqDto.getKindof());
        board.setCommented(reqDto.getCommented());
        board.setAnon(reqDto.getAnon());
        board.setActivated(reqDto.getActivated());

        boardRepository.save(board);

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto delete(Long id) {
        boardRepository.deleteById(id);
        return Response.ok(true);
    }




}
