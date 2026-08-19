package com.paramount.pmx.controller.api;


import com.paramount.pmx.model.member.MemberReqDto;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.member.MembersService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController()
@RequestMapping("/api/member")
@Slf4j
@AllArgsConstructor
public class MemberApiController {

    private final MembersService membersService;

    // 회원 리스트 조회
    @GetMapping()
    public ResponseEntity<ResponseDto> getMemberList(
            @RequestParam Map<String, Object> requestParams,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        ResponseDto responseDto = membersService.getAllMemberList(requestParams, userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    // 회원 생성
    @PostMapping()
    public ResponseEntity<ResponseDto> createMember(
            @RequestBody MemberReqDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = membersService.createMember(reqDto, userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    // 비밀번호 변경
    @PutMapping("/password")
    public ResponseEntity<ResponseDto> changePassword(
            @RequestBody MemberReqDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = membersService.changePassword(reqDto, userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    @GetMapping("/{memberId}")
    public ResponseEntity<ResponseDto> getMemberDetail(
            @PathVariable("memberId") Long memberId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = membersService.getMemberDetail(memberId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    /** 사용자 정보 수정 */
    @PutMapping("/{memberId}")
    public ResponseEntity<ResponseDto> updateMember(
            @PathVariable("memberId") Long memberId,
            @RequestBody MemberReqDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = membersService.updateMemberConfirmed(memberId, reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    /** 사용자 승인 처리 */
    @PutMapping("/{memberId}/confirmed")
    public ResponseEntity<ResponseDto> confirmMember(
            @PathVariable("memberId") Long memberId,
            @RequestBody String date,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = membersService.confirmMember(memberId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

   /** 사용자 퇴사 처리 */
   @PutMapping("/{memberId}/resign")
   public ResponseEntity<ResponseDto> resignMember(
           @PathVariable("memberId") Long memberId,
           @RequestBody String date,
           @AuthenticationPrincipal CustomUserDetails userDetails
   ) {
       ResponseDto responseDto = membersService.resignMember(memberId, date, userDetails);
       return new ResponseEntity<>(responseDto, HttpStatus.OK);
   }
}
