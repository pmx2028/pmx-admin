package com.paramount.pmx.controller.tvcms;

import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.model.tvcms.TvProgramsDto;
import com.paramount.pmx.model.tvcms.TvSchedulesDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.tvcms.TvProgramsService;
import com.paramount.pmx.service.tvcms.TvSchedulesService;
import com.paramount.pmx.utils.PagingUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/tvcms")
public class TVScheduleController {

    @Value("${PAGE_LIST_SIZE_DEFAULT}") //config.properites에 정의
    private int PAGE_LIST_SIZE;

    @Value("${PAGE_BLOCK_COUNT_DEFAULT}") //config.properites에 정의
    private int PAGE_BLOCK_COUNT;

    @Autowired
    private TvSchedulesService tvSchedulesService;

    @Autowired
    private TvProgramsService tvProgramsService;


    @Autowired
    private TvSchedulesDto tvSchedulesDto;

    @GetMapping("/schedule/schedule")
    public String schedule(
            Model model
            , HttpServletRequest request
            , @RequestParam(required = false) Map<String, Object> searchRequest
    ) {

        TvSchedulesDto tvSchedule = new TvSchedulesDto();

        String  searchDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        if (searchRequest.containsKey("searchDate") == true && !searchRequest.get("searchDate").equals("")) {
            searchDate = searchRequest.get("searchDate").toString();
        }


//        if (searchRequest.containsKey("scheduleId") == true && !searchRequest.get("scheduleId").equals("")) {
//            tvSchedule = tvSchedulesService.getTvSchedulesDetail(Long.parseLong(searchRequest.get("scheduleId").toString()));
//        }

//        if ( tvSchedule != null && StringUtils.isNotBlank(tvSchedule.getScheduleDay())) {
//            searchDate = tvSchedule.getScheduleDay();
//        }

        LocalDate searchLacalDate = LocalDate.parse(searchDate , DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        int searchYear = searchLacalDate.getYear();
        int searchMonth = searchLacalDate.getMonthValue();

        if ( searchRequest.containsKey("searchYear") == true && !searchRequest.get("searchYear").equals("")
                && searchRequest.containsKey("searchMonth") == true && !searchRequest.get("searchMonth").equals("") ) {

            searchYear = Integer.parseInt(searchRequest.get("searchYear").toString());
            searchMonth = Integer.parseInt(searchRequest.get("searchMonth").toString());

        }

        List<Map<String, Object>> calendar  =  tvSchedulesService.getCalendar(searchYear , searchMonth);
        //List<TvSchedulesDto> tvSchedulesList = tvSchedulesService.getTvSchedulesMainList(searchDate);
        List<TvProgramsDto> tvProgramsList = tvProgramsService.getTvProgramsList();

        model.addAttribute("searchDate", searchDate);
        model.addAttribute("scheduleId", searchRequest.get("scheduleId"));
        model.addAttribute("calendar", calendar);
        //model.addAttribute("detail", tvSchedule);
        //model.addAttribute("tvSchedulesList", tvSchedulesList);
        model.addAttribute("tvProgramsList", tvProgramsList);


        return "/tvcms/schedule/schedule";
    }

    @GetMapping("/schedule/weekly")
    public String weekly(
            Model model
            , @RequestParam(required = false) Map<String, Object> searchRequest  ) {


        String  searchDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        if (searchRequest.containsKey("searchDate") == true && !searchRequest.get("searchDate").equals("")) {
            searchDate = searchRequest.get("searchDate").toString();
        }

        LocalDate searchLacalDate = LocalDate.parse(searchDate , DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        LocalDate sunday = searchLacalDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
        LocalDate monday = sunday.plusDays(6);
        String startDt = sunday.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String endDt = monday.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));


        List<Map<String, Object>> weekData = tvSchedulesService.getTvScheduleWeek(startDt , endDt);
        model.addAttribute("startDt", startDt);
        model.addAttribute("endDt", endDt);
        model.addAttribute("weekData", weekData);

        return "/tvcms/schedule/weekly";
    }

    @GetMapping("/schedule/monthly")
    public String monthly(  Model model
            , @RequestParam(required = false) Map<String, Object> searchRequest  ) {


        String searchDate = "";
        int searchYear;
        int searchMonth;
        if ( searchRequest.containsKey("searchDate") == true && !searchRequest.get("searchDate").equals("")) {
            searchYear = Integer.parseInt(searchRequest.get("searchDate").toString().substring(0, 4));
            searchMonth = Integer.parseInt(searchRequest.get("searchDate").toString().substring(5));
            searchDate = searchRequest.get("searchDate").toString();

        } else {
            searchDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            LocalDate currentDate = LocalDate.now();            // 현재 날짜
            searchYear = currentDate.getYear();             // 년도 가져오기
            searchMonth = currentDate.getMonthValue();      // 월도 가져오기
        }

        YearMonth yearMonth = YearMonth.of(searchYear, searchMonth);
        String startDate = yearMonth.atDay(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String endDate = yearMonth.atEndOfMonth().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        List<Map<String, Object>> monthData = tvSchedulesService.getTvScheduleMonth(searchYear , searchMonth);
        model.addAttribute("startDate", startDate);
        model.addAttribute("endDate", endDate);
        model.addAttribute("searchDate", searchDate);
        model.addAttribute("monthData", monthData);

        return "/tvcms/schedule/monthly";
    }

    @GetMapping("/schedule/search")
    public String search(
        Model model
        , HttpServletRequest request
        , @PageableDefault Pageable pageable
        , @RequestParam(required = false) Map<String, Object> searchRequest  ) {


            Page<TvSchedulesDto> tvSchedulesList = tvSchedulesService.getTvSchedulesList(pageable, searchRequest);

            int nowPage = pageable.getPageNumber() == 0 ? 1 : pageable.getPageNumber();

            model.addAttribute("tvSchedulesList", tvSchedulesList);
            model.addAttribute("searchRequest", searchRequest);
            model.addAttribute("paging", PagingUtils.pageList(nowPage, tvSchedulesList.getTotalElements(), PAGE_LIST_SIZE, PAGE_BLOCK_COUNT));
        return "/tvcms/schedule/search";
    }

    @GetMapping("/schedule/programform")
    public String programform() {
        return "/tvcms/schedule/programform";
    }

    @GetMapping("/schedule/form")
    public String scheduleform(
        Model model
            , @RequestParam(required = false) Map<String, Object> searchRequest  ) {


        String  searchDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        if (searchRequest.containsKey("searchDate") == true && !searchRequest.get("searchDate").equals("")) {
            searchDate = searchRequest.get("searchDate").toString();
        }

        LocalDate searchLacalDate = LocalDate.parse(searchDate , DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        LocalDate sunday = searchLacalDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
        LocalDate monday = sunday.plusDays(6);
        String startDt = sunday.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String endDt = monday.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));


        List<Map<String, Object>> weekData = tvSchedulesService.getTvScheduleWeek(startDt , endDt);
        model.addAttribute("startDt", startDt);
        model.addAttribute("endDt", endDt);
        model.addAttribute("weekData", weekData);
        return "/tvcms/schedule/scheduleform";
    }

    @GetMapping("/schedule/schedulemodify")
    public String schedulemodify() {
        return "/tvcms/schedule/schedulemodify";
    }

    //편성표 정보 조회 (메인)
    @GetMapping(value = "/schedule/list", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> tvSchedulesList(@RequestParam String searchDate, @AuthenticationPrincipal CustomUserDetails userDetails){
        ResponseDto responseDto = tvSchedulesService.tvSchedulesList(searchDate);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    //편성표 정보 조회 (메인)
    @GetMapping(value = "/schedule/detail", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> tvSchedulesDetail(@RequestParam Long key){
        ResponseDto responseDto = tvSchedulesService.getTvSchedulesDetailAjax(key);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    //신규 편성표  - 저장
    @PostMapping(value = "/schedule/create", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> tvSchedulesCreate(TvSchedulesDto tvSchedulesDto, @AuthenticationPrincipal CustomUserDetails userDetails){
        ResponseDto responseDto = tvSchedulesService.tvSchedulesCreate(tvSchedulesDto , userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    //신규 편성표  - 저장
    @PostMapping(value = "/schedule/update", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> tvSchedulesUpdate(TvSchedulesDto tvSchedulesDto, @AuthenticationPrincipal CustomUserDetails userDetails){
        ResponseDto responseDto = tvSchedulesService.tvSchedulesUpdate(tvSchedulesDto , userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    //VOD -완전삭제
    @GetMapping(value = "/schedule/destroy", produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<ResponseDto> destroy(Long id , @AuthenticationPrincipal CustomUserDetails userDetails ) {
        ResponseDto responseDto = tvSchedulesService.getTvSchedulesDestrory(id , userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }



}
