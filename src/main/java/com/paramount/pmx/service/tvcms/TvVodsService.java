package com.paramount.pmx.service.tvcms;

import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.model.setting.Krxes;
import com.paramount.pmx.model.tvcms.*;
import com.paramount.pmx.repository.setting.KrxesRepository;
import com.paramount.pmx.repository.tvcms.TvVodsRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.specs.tvcms.SearchTvVodsSpec;
import org.apache.commons.lang3.StringUtils;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TvVodsService {

    //logging
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Value("${PAGE_LIST_SIZE_DEFAULT}") //config.properites에 정의
    private int PAGE_LIST_SIZE;

    @Autowired
    private TvVodsRepository tvVodsRepository;

    @Autowired
    private KrxesRepository krxesRepository;


    //vod 검색 목록
    public Page<TvVodsDto> getTvVodsList(
            Pageable pageable
            , @RequestParam(required = false) Map<String, Object> searchRequest
    ) {
        int nowPage = pageable.getPageNumber() == 0 ? 0 : pageable.getPageNumber() - 1;



        //기본 정렬값
        List<Order> orderList = new ArrayList<Order>();
        orderList.add(new Order(Sort.Direction.DESC, "CREATED_AT"));
        Sort defaultSort = Sort.by(orderList);

        //기본 검색 조건값
        List<String> defaultSearchParam = new ArrayList<>();
        defaultSearchParam.add("USE_FLAG=1");
        if ( "0".equals(searchRequest.get("searchTarget")) && ! ("").equals(searchRequest.get("searchName"))){
            defaultSearchParam.add("PROGRAM_LIKE="+searchRequest.get("searchName"));
        } else if ( "1".equals(searchRequest.get("searchTarget"))  && !("").equals(searchRequest.get("searchName"))) {
            defaultSearchParam.add("VOD_LIKE="+searchRequest.get("searchName"));
        } else if ("2".equals(searchRequest.get("searchTarget"))  && !("").equals(searchRequest.get("searchName"))) {
            defaultSearchParam.add("KREX_LIKE="+searchRequest.get("searchName"));
        }
        PageRequest pageRequest = PageRequest.of(nowPage, PAGE_LIST_SIZE, SearchTvVodsSpec.getValidSortKey(defaultSort));

        return tvVodsRepository.findAll(
                        SearchTvVodsSpec.createSpecification(searchRequest, defaultSearchParam),
                        pageRequest
                )
                .map(e -> TvVodsDto.toDto(e));
    }


    //vod 정보 저장
    @Transactional
    public ResponseDto tvVodsCreate(TvVodsDto tvVodsDto, CustomUserDetails userDetails) {

        //종목명 콤마 구분자(검색기능을 위해 제공)
        String krxeName = this.setkrxeName(tvVodsDto);

        TvVods tvVods = TvVods.builder()
                .programId(tvVodsDto.getProgramId())
                .programName(tvVodsDto.getProgramName())
                .vodName(tvVodsDto.getVodName())
                .youtubeUrl(tvVodsDto.getYoutubeUrl())
                .krxeName(krxeName)
                .fileName((tvVodsDto.getFileName()))
                .saveFileName((tvVodsDto.getSaveFileName()))
                .filePath((tvVodsDto.getFilePath()))
                .viewFlag(tvVodsDto.getViewFlag())
                .useFlag("1")
                .createdBy(userDetails.getId())
                .updatedBy(userDetails.getId())
                .build();

        //관련 종목 세팅
        setTvVodKrxes(tvVods , tvVodsDto ,userDetails);

        //tvVods.addTvVodKrxes(setTvVodKrxesDto(tvVodsDto, userDetails));

        Boolean result = false;
        try {
            tvVodsRepository.save(tvVods);
            result = true;
        } catch (Exception e) {
            logger.error("vod 정보 등록 오류 : " + e.getMessage());
            logger.error(tvVods.toString());
            result = false;
        }
        return Response.ok(result);
    }

    //vod 정보 수정
    @Transactional
    public ResponseDto tvVodsUpdate( TvVodsDto tvVodsDto, CustomUserDetails userDetails) {

        //종목명 콤마 구분자(검색기능을 위해 제공)
        String krxeName = this.setkrxeName(tvVodsDto);

        TvVods tvVods = TvVods.builder()
                .id(tvVodsDto.getId())
                .programId(tvVodsDto.getProgramId())
                .programName(tvVodsDto.getProgramName())
                .vodName(tvVodsDto.getVodName())
                .youtubeUrl(tvVodsDto.getYoutubeUrl())
                .krxeName(krxeName)
                .fileName((tvVodsDto.getFileName()))
                .saveFileName((tvVodsDto.getSaveFileName()))
                .filePath((tvVodsDto.getFilePath()))
                .viewFlag(tvVodsDto.getViewFlag())
                .useFlag("1")
                .createdBy(userDetails.getId())
                .updatedBy(userDetails.getId())
                .build();

        tvVods.clearTvVodKrxes();

        //관련 종목 세팅
        setTvVodKrxes(tvVods , tvVodsDto ,userDetails);

        //this.dealsCreditRateList.clear();
        Boolean result = false;
        try {
            tvVodsRepository.save(tvVods);
            result = true;
        } catch (Exception e) {
            logger.error("vod 정보 등록 오류 : " + e.getMessage());
            logger.error(tvVods.toString());
            result = false;
        }
        return Response.ok(result);

        /**
        try {
            //종목명 콤마 구분자(검색기능을 위해 제공)
            String krxeName = this.setkrxeName(tvVodsDto);

            tvVodsRepository.getById(tvVodsDto.getId())
                    .updateTvVods(
                            tvVodsDto.getProgramId()
                            , tvVodsDto.getProgramName() == null ? null : tvVodsDto.getProgramName().trim()
                            , tvVodsDto.getVodName() == null ? null : tvVodsDto.getVodName().trim()
                            , tvVodsDto.getYoutubeUrl() == null ? null : tvVodsDto.getYoutubeUrl().trim()
                            , tvVodsDto.getKrxeName() == null ? null : tvVodsDto.getKrxeName().trim()
                            , tvVodsDto.getFileName() == null ? null : tvVodsDto.getFileName().trim()
                            , tvVodsDto.getSaveFileName() == null ? null : tvVodsDto.getSaveFileName().trim()
                            , tvVodsDto.getFilePath() == null ? null : tvVodsDto.getFilePath().trim()
                            , tvVodsDto.getViewFlag()
                            , userDetails.getId()
                    );
            result = true;
        } catch (Exception e) {
            logger.error("vod 수정 오류 : " + e.getMessage());
            logger.error(tvVodsDto.toString());
            result = false;
        }
         */

    }
    //삭제(완전 삭제)
    public ResponseDto getTvVodsDestrory (Long vodId  , CustomUserDetails userDetails) {
        Boolean result = false;
        try {
            tvVodsRepository.delete(tvVodsRepository.getById(vodId));
            result = true;
        } catch (Exception e) {
            logger.error("VOD 정보 삭제 오류 : " + e.getMessage());
            logger.error("id : " + vodId.toString());
            result = false;
        }

        return result == true ? Response.ok(result) : Response.error(result.toString());

    }
    //사용여부 구분자 UPDATE
    @Transactional
    public ResponseDto getTvVodsDelete(Long vodId , CustomUserDetails userDetails) {
        Boolean result = false;
        try {
            tvVodsRepository.getById(vodId)
                    .updateTvVods(
                            "0"
                            ,userDetails.getId()
                    );

            result = true;
        } catch (Exception e) {
            logger.error("VOD 정보 삭제 오류 : " + e.getMessage());
            logger.error("id : " + vodId.toString());
            result = false;
        }
        return result == true ? Response.ok(result) : Response.error(result.toString());

    }
    // vod상세정보(responseDto 전송 - ajax용)
    public TvVodsDto getTvVodsDetail(Long id) {

        return TvVodsDto.toDto(tvVodsRepository.findById(id).orElse(null));

    }

    // vod상세정보(responseDto 전송 - ajax용)
    public ResponseDto getTvVodsDetailAjax(Long id) {
        TvVods tvVods = tvVodsRepository.getById(id);

        return Optional.ofNullable(tvVods)
                .map(e -> TvVodsDto.toDto(e))
                .map(Response::ok)
                .orElseGet(() -> Response.error("해당 정보가 존재하지 않습니다."));
    }
    //관련종목 생성
    public String setkrxeName(TvVodsDto tvVodsDto) {
         String krxeIds = tvVodsDto.getVodKrxIds();
         ArrayList<String> strArr = new ArrayList<>();
         Krxes krxes = null;
         if (krxeIds != null && !krxeIds.isEmpty()) {
            String[] result = StringUtils.split(krxeIds, ',');
            for (String krxeId : result) {
                krxes = krxesRepository.getById(Long.parseLong(krxeId));
                if (krxes != null) {
                    strArr.add(krxes.getName());
                }
            }
        }
        return StringUtils.join(strArr , ',');

    }
    public void setTvVodKrxes(TvVods tvVods , TvVodsDto tvVodsDto, CustomUserDetails userDetails) {
        String krxeIds = tvVodsDto.getVodKrxIds();
        if (krxeIds != null && !krxeIds.isEmpty()) {
            String[] result = StringUtils.split(krxeIds, ',');
            for (String krxeId : result) {
                TvVodKrxes tvVodKrxes = TvVodKrxes.builder()
                        .tvVods(tvVods)
                        .krxes(Krxes.builder()
                                .id(Long.parseLong(krxeId))
                                .build())
                        .createdBy(userDetails.getId())
                        .build();
                tvVods.addTvVodKrxes(tvVodKrxes);
            }
        }
    }

}
