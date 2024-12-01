package com.paramount.pmx.service.tvcms;

import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.model.tvcms.TvProgramsDto;
import com.paramount.pmx.model.tvcms.TvPrograms;
import com.paramount.pmx.repository.tvcms.TvProgramsRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.specs.tvcms.SearchTvProgramsSpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TvProgramsService {

    //logging
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Value("${PAGE_LIST_SIZE_DEFAULT}") //config.properites에 정의
    private int PAGE_LIST_SIZE;

    @Autowired
    private TvProgramsRepository tvProgramsRepository;

    //프로그램 검색 목록
    public Page<TvProgramsDto> getTvProgramsList(
        Pageable pageable
        ,@RequestParam(required = false) Map<String, Object> searchRequest
    ){
        int nowPage = pageable.getPageNumber() == 0 ? 0 : pageable.getPageNumber()-1;

        //기본 정렬값
        List<Order> orderList = new ArrayList<Order>();
        orderList.add(new Order(Sort.Direction.DESC, "BROAD_FLAG"));
        orderList.add(new Order(Sort.Direction.DESC, "VIEW_FLAG"));
        orderList.add(new Order(Sort.Direction.ASC, "SEQ"));
//        if (searchRequest.get("order") == null || searchRequest.get("order").equals("GROUPNAME")) {
//            orderList.add(new Sort.Order(Sort.Direction.ASC, "GROUPNAME"));
//        } else if (searchRequest.get("order").equals("GROUPCOUNT")){
//            orderList.add(new Sort.Order(Sort.Direction.DESC, "GROUPCOUNT"));
//        }
        Sort defaultSort = Sort.by(orderList);

        //기본 검색 조건값
        List<String> defaultSearchParam = new ArrayList<>();
        //defaultSearchParam.add("VIEW_FLAG=1");
        PageRequest pageRequest = PageRequest.of(nowPage, PAGE_LIST_SIZE, SearchTvProgramsSpec.getValidSortKey(defaultSort));

        return tvProgramsRepository.findAll(
                        SearchTvProgramsSpec.createSpecification(searchRequest, defaultSearchParam),
            pageRequest
        )
        .map(e -> TvProgramsDto.toDto(e));
    }


    //프로그램 정보 저장
    @Transactional
    public ResponseDto tvProgramsCreate(TvProgramsDto tvProgramsDto, CustomUserDetails userDetails){
        TvPrograms tvPrograms = TvPrograms.builder()
                .majorFlag(tvProgramsDto.getMajorFlag() == null ? null : tvProgramsDto.getMajorFlag().trim())
                .programLevel(tvProgramsDto.getProgramLevel())
                .programName(tvProgramsDto.getProgramName() == null ? null : tvProgramsDto.getProgramName().trim())
                .broadStartDt(tvProgramsDto.getBroadStartDt())
                .broadTime(tvProgramsDto.getBroadTime() == null ? null : tvProgramsDto.getBroadTime().trim())
                .content(tvProgramsDto.getContent() == null ? null : tvProgramsDto.getContent().trim())
                .director(tvProgramsDto.getDirector() == null ? null : tvProgramsDto.getDirector().trim())
                .assistantDirector(tvProgramsDto.getAssistantDirector() == null ? null : tvProgramsDto.getAssistantDirector().trim())
                .author(tvProgramsDto.getAuthor() == null ? null : tvProgramsDto.getAuthor().trim())
                .programHost(tvProgramsDto.getProgramHost() == null ? null : tvProgramsDto.getProgramHost().trim())
                .contentEtc(tvProgramsDto.getContentEtc() == null ? null : tvProgramsDto.getContentEtc().trim())
                .fileName(tvProgramsDto.getFileName() == null ? null : tvProgramsDto.getFileName().trim())
                .saveFileName(tvProgramsDto.getSaveFileName() == null ? null : tvProgramsDto.getSaveFileName().trim())
                .filePath(tvProgramsDto.getFilePath() == null ? null : tvProgramsDto.getFilePath().trim())
                .seq(tvProgramsDto.getSeq() == null ? 1 : tvProgramsDto.getSeq())
                .viewFlag(tvProgramsDto.getViewFlag())
                .broadFlag(tvProgramsDto.getBroadFlag())
                .createdBy(userDetails.getId())
                .build();
        Boolean result = false;
        try {
            tvProgramsRepository.save(tvPrograms);
            result = true;
        } catch (Exception e) {
            logger.error("프로그램 정보 등록 오류 : " + e.getMessage());
            logger.error(tvPrograms.toString());
            result = false;
        }
        return Response.ok(result);
    }

    //프로그램 정보 수정
    @Transactional
    public ResponseDto tvProgramsUpdate(TvProgramsDto tvProgramsDto, CustomUserDetails userDetails){
        Boolean result = false;
        try {
            tvProgramsRepository.getById(tvProgramsDto.getId())
                    .updateTvPrograms(
                            tvProgramsDto.getMajorFlag() == null ? null : tvProgramsDto.getMajorFlag().trim()
                            ,tvProgramsDto.getProgramLevel()
                            ,tvProgramsDto.getProgramName() == null ? null : tvProgramsDto.getProgramName().trim()
                            ,tvProgramsDto.getBroadStartDt()
                            ,tvProgramsDto.getBroadTime() == null ? null : tvProgramsDto.getBroadTime().trim()
                            ,tvProgramsDto.getContent() == null ? null : tvProgramsDto.getContent().trim()
                            ,tvProgramsDto.getDirector() == null ? null : tvProgramsDto.getDirector().trim()
                            ,tvProgramsDto.getAssistantDirector() == null ? null : tvProgramsDto.getAssistantDirector().trim()
                            ,tvProgramsDto.getAuthor() == null ? null : tvProgramsDto.getAuthor().trim()
                            ,tvProgramsDto.getProgramHost() == null ? null : tvProgramsDto.getProgramHost().trim()
                            ,tvProgramsDto.getContentEtc() == null ? null : tvProgramsDto.getContentEtc().trim()
                            ,tvProgramsDto.getFileName() == null ? null : tvProgramsDto.getFileName().trim()
                            ,tvProgramsDto.getSaveFileName() == null ? null : tvProgramsDto.getSaveFileName().trim()
                            ,tvProgramsDto.getFilePath() == null ? null : tvProgramsDto.getFilePath().trim()
                            ,tvProgramsDto.getSeq() == null ? null : tvProgramsDto.getSeq()
                            ,tvProgramsDto.getViewFlag()
                            ,tvProgramsDto.getBroadFlag()
                            ,userDetails.getId()
                    );
            result = true;
        } catch (Exception e) {
            logger.error("프로그램 수정 오류 : " + e.getMessage());
            logger.error(tvProgramsDto.toString());
            result = false;
        }

        return Response.ok(result);
    }

    //프로그램 상세정보(responseDto 전송 - ajax용)
    public TvProgramsDto getTvProgramsDetail(Long id){
        return TvProgramsDto.toDto(tvProgramsRepository.findById(id).orElse(null));

    }
    //프로그램 상세정보(responseDto 전송 - ajax용)
    public List<TvProgramsDto> getTvProgramsList() {
        return tvProgramsRepository.findAllByBroadFlagAndViewFlagOrderBySeqAscCreatedAtDesc("1", "1")
                .stream()
                .map(e -> TvProgramsDto.toDto(e))
                .collect(Collectors.toList());
    }

    //프로그램 상세정보(responseDto 전송 - ajax용)
    public ResponseDto getTvProgramsDetailAjax(Long id){
        TvPrograms tvPrograms = tvProgramsRepository.getById(id);

        return Optional.ofNullable(tvPrograms)
                .map(e -> TvProgramsDto.toDto(e))
                .map(Response::ok)
                .orElseGet(() -> Response.error("해당 정보가 존재하지 않습니다."));
    }

    //프로그램 리스트(responseDto 전송 - ajax용)
    public ResponseDto getTvProgramsListAjax(){
        return Response.ok(
                tvProgramsRepository.findAllByBroadFlagAndViewFlagOrderBySeqAscCreatedAtDesc("1" , "1")
                        .stream()
                        .map(e-> TvProgramsDto.toDto(e))
                        .collect(Collectors.toList())
        );
    }

}
