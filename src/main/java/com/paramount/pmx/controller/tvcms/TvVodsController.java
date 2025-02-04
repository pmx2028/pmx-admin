package com.paramount.pmx.controller.tvcms;

import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.model.tvcms.TvVodsDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.tvcms.TvVodsService;
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
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/tvcms")
public class TvVodsController {

    @Value("${PAGE_LIST_SIZE_DEFAULT}") //config.properites에 정의
    private int PAGE_LIST_SIZE;

    @Value("${PAGE_BLOCK_COUNT_DEFAULT}") //config.properites에 정의
    private int PAGE_BLOCK_COUNT;

    @Value("${SYSTEM_CODE}")  //config.properites에 정의 (서비스 사이트 코드)
    private String SYSTEM_CODE;


    @Autowired
    private TvVodsService tvVodsService;

    //VOD 목록(전체)
    @GetMapping(value = {"/tvVods", "tvVods/"})
    public String tvVodsMain(
          Model model
        , HttpServletRequest request
        , @PageableDefault Pageable pageable
        , @RequestParam(required = false) Map<String, Object> searchRequest
    ) {
        Page<TvVodsDto> tvVodsList = tvVodsService.getTvVodsList(pageable, searchRequest);

        int nowPage = pageable.getPageNumber() == 0 ? 1 : pageable.getPageNumber();

        model.addAttribute("tvVodsList", tvVodsList);
        model.addAttribute("searchRequest", searchRequest);
        model.addAttribute("paging", PagingUtils.pageList(nowPage, tvVodsList.getTotalElements(), PAGE_LIST_SIZE, PAGE_BLOCK_COUNT));
        return "/tvcms/vod/main";
    }

    // VOD 등록/수정
    @GetMapping("/tvVods/form")
    public String tvVodForm(
            Model model
            , HttpServletRequest request
            , @RequestParam(required = false) Long vodId
            , @AuthenticationPrincipal CustomUserDetails userDetails
            , @RequestParam(required = false) Map<String, Object> searchRequest) {

        String returnPath = "/tvcms/vod/form";
        TvVodsDto tvVodsDto = new TvVodsDto();

        //수정일 경우 (paramId가 있을 경우)
        if (vodId != null){
            tvVodsDto = tvVodsService.getTvVodsDetail(vodId);
        }
        model.addAttribute("detail", tvVodsDto);
        //검색 parameter 정보
        model.addAttribute("searchRequest", searchRequest.keySet().stream().filter(key -> !key.equals("paramId")).map(key -> key + "=" + searchRequest.get(key)).collect(Collectors.joining("&")));
        return returnPath;
    }



    //VOD - 저장
    @PostMapping(value = "/tvVods/create", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> tvVodsCreate(TvVodsDto tvVodsDto, @AuthenticationPrincipal CustomUserDetails userDetails){
        ResponseDto responseDto = tvVodsService.tvVodsCreate(tvVodsDto, userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    //VOD - 수정
    @PostMapping(value = "/tvVods/update", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> tvVodsUpdate(TvVodsDto tvVodsDto, @AuthenticationPrincipal CustomUserDetails userDetails){
        ResponseDto responseDto = tvVodsService.tvVodsUpdate(tvVodsDto, userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }
    //VOD -완전삭제
    @GetMapping(value = "/tvVods/destroy", produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<ResponseDto> destroy(Long id , @AuthenticationPrincipal CustomUserDetails userDetails ) {
        ResponseDto responseDto = tvVodsService.getTvVodsDestrory(id , userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    //VOD - 삭제구분 UPDATE
    @GetMapping(value = "/tvVods/delete", produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<ResponseDto> delete(Long id , @AuthenticationPrincipal CustomUserDetails userDetails ) {
        ResponseDto responseDto = tvVodsService.getTvVodsDelete(id , userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }


    //VOD - 상세
    @GetMapping(value = "/tvVods/detail", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> tvVodsDetail(@RequestParam Long key) {
        ResponseDto responseDto = tvVodsService.getTvVodsDetailAjax(key);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }
}
