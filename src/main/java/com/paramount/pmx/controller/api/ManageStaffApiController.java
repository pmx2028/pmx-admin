package com.paramount.pmx.controller.api;


import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.model.user.UserReqDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.user.UsersService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController()
@RequestMapping("/api/users")
@Slf4j
@AllArgsConstructor
public class ManageStaffApiController {

    private final UsersService usersService;

    // 사용자 리스트 조회
    @GetMapping()
    public ResponseEntity<ResponseDto> getUserList(
            @RequestParam Map<String, Object> requestParams,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        ResponseDto responseDto = usersService.getAllStaffList(requestParams, userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    // 사용자 생성
    @PostMapping()
    public ResponseEntity<ResponseDto> createUser(
            @RequestBody UserReqDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = usersService.createUser(reqDto, userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    // 비밀번호 변경
    @PutMapping("/password")
    public ResponseEntity<ResponseDto> changePassword(
            @RequestBody UserReqDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = usersService.changePassword(reqDto, userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ResponseDto> getUserDetail(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = usersService.getUserDetail(userId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    /** 사용자 정보 수정 */
    @PutMapping("/{userId}")
    public ResponseEntity<ResponseDto> updateUser(
            @PathVariable("userId") Long userId,
            @RequestBody UserReqDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = usersService.updateUser(userId, reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

   /** 사용자 퇴사 처리 */
   @PutMapping("/{userId}/resign")
   public ResponseEntity<ResponseDto> resignUser(
           @PathVariable("userId") Long userId,
           @RequestBody String date,
           @AuthenticationPrincipal CustomUserDetails userDetails
   ) {
       ResponseDto responseDto = usersService.resignUser(userId, date, userDetails);
       return new ResponseEntity<>(responseDto, HttpStatus.OK);
   }
}
