package com.paramount.pmx.controller.tvcms;

import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.model.tvcms.TvProgramsDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.tvcms.TvProgramsService;
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
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@RequestMapping("/tvcms")
public class TvProgramsController {

    @Value("${PAGE_LIST_SIZE_DEFAULT}") //config.properites에 정의
    private int PAGE_LIST_SIZE;

    @Value("${PAGE_BLOCK_COUNT_DEFAULT}") //config.properites에 정의
    private int PAGE_BLOCK_COUNT;


    @Autowired
    private TvProgramsService tvProgramsService;

    //TV프로그램 목록(전체)
    @GetMapping(value = {"/tvPrograms", "tvPrograms/"})
    public String tvProgramsMain(
          Model model
        , HttpServletRequest request
        , @PageableDefault Pageable pageable
        , @RequestParam(required = false) Map<String, Object> searchRequest
    ) {
        Page<TvProgramsDto> tvProgramsList = tvProgramsService.getTvProgramsList(pageable, searchRequest);

        int nowPage = pageable.getPageNumber() == 0 ? 1 : pageable.getPageNumber();

        model.addAttribute("tvProgramsList", tvProgramsList);
        model.addAttribute("searchRequest", searchRequest);
        model.addAttribute("paging", PagingUtils.pageList(nowPage, tvProgramsList.getTotalElements(), PAGE_LIST_SIZE, PAGE_BLOCK_COUNT));
        return "/tvcms/programe/main";
    }

    // 프로그램 등록 수정
    @GetMapping("/tvPrograms/form")
    public String tvProgramsForm(
            Model model
            , HttpServletRequest request
            , @RequestParam(required = false) Long paramId
            , @AuthenticationPrincipal CustomUserDetails userDetails
            , @RequestParam(required = false) Map<String, Object> searchRequest) {

        String returnPath = "/tvcms/programe/form";
        TvProgramsDto tvProgramsDto = new TvProgramsDto();

        //수정일 경우 (paramId가 있을 경우)
        if (paramId != null){
            tvProgramsDto = tvProgramsService.getTvProgramsDetail(paramId);
        }
        model.addAttribute("detail", tvProgramsDto);
        //검색 parameter 정보
        model.addAttribute("searchRequest", searchRequest.keySet().stream().filter(key -> !key.equals("paramId")).map(key -> key + "=" + searchRequest.get(key)).collect(Collectors.joining("&")));
        return returnPath;
    }

    //프로그램 - 저장
    @PostMapping(value = "/tvPrograms/create", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> tvProgramsCreate(TvProgramsDto tvProgramesDto, @AuthenticationPrincipal CustomUserDetails userDetails){
        ResponseDto responseDto = tvProgramsService.tvProgramsCreate(tvProgramesDto, userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    //프로그램 - 수정

    @PostMapping(value = "/tvPrograms/update", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> tvProgramsUpdate(TvProgramsDto tvProgramesDto, @AuthenticationPrincipal CustomUserDetails userDetails){
        ResponseDto responseDto = tvProgramsService.tvProgramsUpdate(tvProgramesDto, userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    //프로그램 - 상세
    @GetMapping(value = "/tvPrograms/detail", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> tvProgramsDetail(@RequestParam Long key) {
        ResponseDto responseDto = tvProgramsService.getTvProgramsDetailAjax(key);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    //프로그램 사용중 리스트
    @GetMapping(value = "/tvPrograms/list", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> tvProgramsListAjax() {
        ResponseDto responseDto = tvProgramsService.getTvProgramsListAjax();
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

}
