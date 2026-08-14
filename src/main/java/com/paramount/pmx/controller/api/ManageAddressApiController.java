package com.paramount.pmx.controller.api;


import com.paramount.pmx.model.management.AddressDto;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.model.user.UserReqDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.management.AddressService;
import com.paramount.pmx.service.user.UsersService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController()
@RequestMapping("/api")
@Slf4j
@AllArgsConstructor
public class ManageAddressApiController {

    private final AddressService addressService;
    // 지역 조회
    @GetMapping("/address")
    public ResponseEntity<ResponseDto> getAddressList(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        ResponseDto responseDto = addressService.getaAddressList(userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }
    // 하위 시도군 조회
    @GetMapping("/address/{addressId}/")
    public ResponseEntity<ResponseDto> getAddressDepthList(
            @PathVariable("addressId") Long addressId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        ResponseDto responseDto = addressService.getaAddressDepthList(addressId, userDetails);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

}
