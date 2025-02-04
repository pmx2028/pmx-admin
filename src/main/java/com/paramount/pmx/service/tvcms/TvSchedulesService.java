package com.paramount.pmx.service.tvcms;

import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.model.tvcms.TvSchedules;
import com.paramount.pmx.model.tvcms.TvSchedulesDto;
import com.paramount.pmx.repository.tvcms.TvSchedulesRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.specs.tvcms.SearchTvSchedulesSpec;
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
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TvSchedulesService {

    //logging
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Value("${PAGE_LIST_SIZE_DEFAULT}") //config.properites에 정의
    private int PAGE_LIST_SIZE;

    @Autowired
    private TvSchedulesRepository tvSchedulesRepository;



    //스케줄 검색 목록
    public List<TvSchedulesDto> getTvSchedulesMainList(String searchDate ) {
        String searchDt = StringUtils.isNotBlank(searchDate) ? searchDate : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        // 월간 일정 조회
        return tvSchedulesRepository.findAllByScheduleDayOrderByScheduleStTimeDesc(searchDt)
                .stream()
                .map(e -> TvSchedulesDto.toDto(e))
                .collect(Collectors.toList());
    }

    //스케줄 검색 목록
    public Page<TvSchedulesDto> getTvSchedulesList(
        Pageable pageable
        ,@RequestParam(required = false) Map<String, Object> searchRequest
    ){
        int nowPage = pageable.getPageNumber() == 0 ? 0 : pageable.getPageNumber()-1;

        //기본 정렬값
        List<Order> orderList = new ArrayList<Order>();
        orderList.add(new Order(Sort.Direction.DESC, "SCHEDULE_DAY"));
        orderList.add(new Order(Sort.Direction.DESC, "SCHEDULE_ST_TIME"));
        Sort defaultSort = Sort.by(orderList);

        List<String> defaultSearchParam = new ArrayList<>();


        if (searchRequest.containsKey("scheduleId") == true && !searchRequest.get("scheduleId").equals("")) {
            defaultSearchParam.add("SCHEDULE_ID="+searchRequest.get("scheduleId"));
        }

        //방송구분 검색(1 본방송 , 2: 생방송, 3: 재방송   , 9 :( 본방송 + 생방송)
        if (searchRequest.containsKey("scheduleGubn") == true && !searchRequest.get("scheduleGubn").equals("")) {
                defaultSearchParam.add("SCHEDULE_GUBN="+searchRequest.get("scheduleGubn"));
        }
        //기간 검색
        if ( (searchRequest.containsKey("searchStartDt") == true && StringUtils.isNotBlank(searchRequest.get("searchStartDt").toString()))
                &&  (searchRequest.containsKey("searchEndDt") == false || StringUtils.isBlank(searchRequest.get("searchEndDt").toString())) ) {
            defaultSearchParam.add("SCHEDULE_DAY_BETWEEN="+searchRequest.get("searchStartDt")+"~"+searchRequest.get("searchStartDt"));
        } else if ( (searchRequest.containsKey("searchStartDt") == true && StringUtils.isNotBlank(searchRequest.get("searchStartDt").toString()))
                    && (searchRequest.containsKey("searchEndDt") == true && StringUtils.isNotBlank(searchRequest.get("searchEndDt").toString())) ) {
            defaultSearchParam.add("SCHEDULE_DAY_BETWEEN="+searchRequest.get("searchStartDt")+"~"+searchRequest.get("searchEndDt"));
        }
        //검색대상 LIKE 검색
        if ( "0".equals(searchRequest.get("searchTarget")) && ! ("").equals(searchRequest.get("searchName"))){                  //프로그램명 검색
            defaultSearchParam.add("SCHEDULE_LIKE="+searchRequest.get("searchName"));
        } else if ( "1".equals(searchRequest.get("searchTarget"))  && !("").equals(searchRequest.get("searchName"))) {          //내용검색
            defaultSearchParam.add("CONTENT_LIKE="+searchRequest.get("searchName"));
        } else if ("9".equals(searchRequest.get("searchTarget"))  && !("").equals(searchRequest.get("searchName"))) {           //프로그램명 + 내용
            defaultSearchParam.add("SCHEDULE_CONTENT_LIKE="+searchRequest.get("searchName"));
        }


        PageRequest pageRequest = PageRequest.of(nowPage, PAGE_LIST_SIZE, SearchTvSchedulesSpec.getValidSortKey(defaultSort));

        return tvSchedulesRepository.findAll(
                        SearchTvSchedulesSpec.createSpecification(searchRequest, defaultSearchParam), pageRequest)
        .map(e -> TvSchedulesDto.toDto(e));
    }

    public List<Map<String, Object>> getTvScheduleWeek(String startDt , String endDt) {

        LocalDate sunday = LocalDate.parse(startDt , DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        // 주간일정 조회
        List<TvSchedulesDto> tvSchedulesList = tvSchedulesRepository.findTvSchedulesByStartDtEndDt(startDt, endDt)
                                                            .stream()
                                                            .map(e -> TvSchedulesDto.toDto(e))
                                                            .collect(Collectors.toList());
        ;
        // 달력 생성
        List<Map<String, Object>> weekData = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            String currentDay = sunday.plusDays(i).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            List<TvSchedulesDto> dayTvSchedules = new ArrayList<>();
            for (TvSchedulesDto tvScheduleDto : tvSchedulesList) {
                if (tvScheduleDto.getScheduleDay().equals(currentDay)) {
                    dayTvSchedules.add(tvScheduleDto);
                }
            }

            weekData.add(Map.of(
                    "date", currentDay,
                    "tvSchedules", dayTvSchedules
            ));
        }

        return weekData;
    }

    public List<Map<String, Object>> getTvScheduleMonth(int year, int month) {


        YearMonth yearMonth = YearMonth.of(year, month);
        String startDt = yearMonth.atDay(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String endDt = yearMonth.atEndOfMonth().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        // 월간 일정 조회
        List<TvSchedulesDto> tvSchedulesLists = tvSchedulesRepository.findTvSchedulesByStartDtEndDt(startDt, endDt)
                                                        .stream()
                                                        .map(e -> TvSchedulesDto.toDto(e))
                                                        .collect(Collectors.toList());

        LocalDate startDate = yearMonth.atDay(1);

        // 달력 생성
        List<Map<String, Object>> monthData = new ArrayList<>();
        int dayOfWeekOffset = startDate.getDayOfWeek().getValue() % 7; // 일요일 시작: 0

        // 이전 달 공백
        for (int i = 0; i < dayOfWeekOffset; i++) {
            monthData.add(Map.of("day", "", "tvSchedules", new ArrayList<>()));
        }

        // 이번 달 날짜
        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            String currentDate = startDate.plusDays(day - 1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            List<TvSchedulesDto> dayTvSchedules = new ArrayList<>();
            for (TvSchedulesDto tvScheduleDto : tvSchedulesLists) {
                if (tvScheduleDto.getScheduleDay().equals(currentDate)) {
                    dayTvSchedules.add(tvScheduleDto);
                }
            }
            monthData.add(Map.of("day", day, "tvSchedules", dayTvSchedules));
        }

        // 다음 달 공백
        while (monthData.size() % 7 != 0) {
            monthData.add(Map.of("day", "", "tvSchedules", new ArrayList<>()));
        }
        return monthData;
    }
    //스케줄 상세정보(responseDto 전송 - ajax용)
    public ResponseDto tvSchedulesList(String searchDate){

        String searchDt = StringUtils.isNotBlank(searchDate) ? searchDate : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        // 월간 일정 조회
        return Response.ok( tvSchedulesRepository.findAllByScheduleDayOrderByScheduleStTimeDesc(searchDt)
                .stream()
                .map(e -> TvSchedulesDto.toDto(e))
                .collect(Collectors.toList()));
    }

    //스케줄 정보 저장
    @Transactional
    public ResponseDto tvSchedulesCreate(TvSchedulesDto tvSchedulesDto, CustomUserDetails userDetails){
        TvSchedules tvSchedules = TvSchedules.builder()
                .scheduleDay(tvSchedulesDto.getScheduleDay()== null ? null : tvSchedulesDto.getScheduleDay().trim())
                .programId(tvSchedulesDto.getProgramId())
                .scheduleName(tvSchedulesDto.getScheduleName()== null ? null : tvSchedulesDto.getScheduleName().trim())
                .scheduleSeq(tvSchedulesDto.getScheduleSeq()== null ? null : tvSchedulesDto.getScheduleSeq().trim())
                .scheduleStTime(tvSchedulesDto.getScheduleStTime()== null ? null : tvSchedulesDto.getScheduleStTime().trim())
                .scheduleEdTime(tvSchedulesDto.getScheduleEdTime()== null ? null : tvSchedulesDto.getScheduleEdTime().trim())
                .scheduleLongTime(tvSchedulesDto.getScheduleLongTime()== null ? null : tvSchedulesDto.getScheduleLongTime().trim())
                .scheduleLevel(tvSchedulesDto.getScheduleLevel()== null ? null : tvSchedulesDto.getScheduleLevel().trim())
                .scheduleGubn(tvSchedulesDto.getScheduleGubn()== null ? null : tvSchedulesDto.getScheduleGubn().trim())
                .content(tvSchedulesDto.getContent()== null ? null : tvSchedulesDto.getContent().trim())
                .viewFlag((tvSchedulesDto.getViewFlag()))
                .createdBy(userDetails.getId())
                .build();
        Boolean result = false;
        try {
            tvSchedulesRepository.save(tvSchedules);
            result = true;
        } catch (Exception e) {
            logger.error("스케줄 정보 등록 오류 : " + e.getMessage());
            logger.error(tvSchedules.toString());
            result = false;
        }
        return Response.ok(result);
    }

    //스케줄 정보 수정
    @Transactional
    public ResponseDto tvSchedulesUpdate(TvSchedulesDto tvSchedulesDto, CustomUserDetails userDetails){
        Boolean result = false;
        try {
            tvSchedulesRepository.getById(tvSchedulesDto.getId())
                    .updateTvSchedules(
                            tvSchedulesDto.getScheduleDay() == null ? null : tvSchedulesDto.getScheduleDay().trim()
                            ,tvSchedulesDto.getProgramId()
                            ,tvSchedulesDto.getScheduleName() == null ? null : tvSchedulesDto.getScheduleName().trim()
                            ,tvSchedulesDto.getScheduleSeq() == null ? null : tvSchedulesDto.getScheduleSeq().trim()
                            ,tvSchedulesDto.getScheduleStTime() == null ? null : tvSchedulesDto.getScheduleStTime().trim()
                            ,tvSchedulesDto.getScheduleEdTime() == null ? null : tvSchedulesDto.getScheduleEdTime().trim()
                            ,tvSchedulesDto.getScheduleLongTime() == null ? null : tvSchedulesDto.getScheduleLongTime().trim()
                            ,tvSchedulesDto.getScheduleLevel() == null ? null : tvSchedulesDto.getScheduleLevel().trim()
                            ,tvSchedulesDto.getScheduleGubn() == null ? null : tvSchedulesDto.getScheduleGubn().trim()
                            ,tvSchedulesDto.getContent() == null ? null : tvSchedulesDto.getContent().trim()
                            ,tvSchedulesDto.getViewFlag()
                            ,userDetails.getId()
                    );
            result = true;
        } catch (Exception e) {
            logger.error("스케줄 수정 오류 : " + e.getMessage());
            logger.error(tvSchedulesDto.toString());
            result = false;
        }

        return Response.ok(result);
    }

    //삭제(완전 삭제)
    public ResponseDto getTvSchedulesDestrory (Long vodId  , CustomUserDetails userDetails) {
        Boolean result = false;
        try {
            tvSchedulesRepository.delete(tvSchedulesRepository.getById(vodId));
            result = true;
        } catch (Exception e) {
            logger.error("VOD 정보 삭제 오류 : " + e.getMessage());
            logger.error("id : " + vodId.toString());
            result = false;
        }

        return result == true ? Response.ok(result) : Response.error(result.toString());

    }




    //스케줄 상세정보(responseDto 전송 )
    public TvSchedulesDto getTvSchedulesDetail(Long id){
        return TvSchedulesDto.toDto(tvSchedulesRepository.findById(id).orElse(null));

    }

    //스케줄 상세정보(responseDto 전송 - ajax용)
    public ResponseDto getTvSchedulesDetailAjax(Long id){
        TvSchedules tvSchedules = tvSchedulesRepository.getById(id);

        return Optional.ofNullable(tvSchedules)
                .map(e -> TvSchedulesDto.toDto(e))
                .map(Response::ok)
                .orElseGet(() -> Response.error("해당 정보가 존재하지 않습니다."));
    }
    //달력조회
    public List<Map<String, Object>> getCalendar(int year, int month) {


        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);

        // 달력 생성
        List<Map<String, Object>> calendar = new ArrayList<>();
        int dayOfWeekOffset = startDate.getDayOfWeek().getValue() % 7; // 일요일 시작: 0

        // 이전 달 공백
        for (int i = 0; i < dayOfWeekOffset; i++) {
            calendar.add(Map.of("day", ""));
        }

        // 이번 달 날짜
        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            calendar.add(Map.of("day", day));
        }

        // 다음 달 공백
        while (calendar.size() % 7 != 0) {
            calendar.add(Map.of("day", ""));
        }
        return calendar;
    }

}
