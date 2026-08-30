package com.paramount.pmx.service.management;


import com.paramount.pmx.model.management.*;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.model.user.Users;
import com.paramount.pmx.model.user.UsersDto;
import com.paramount.pmx.repository.management.*;
import com.paramount.pmx.repository.user.UsersRepository;
import com.paramount.pmx.security.CustomUserDetails;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddressService {
  private final AddressRepository addressRepository;


    // 지역 리스트
    public ResponseDto getaAddressList(CustomUserDetails userDetails) {
        List<Address> address = addressRepository.findDepthOne();
        List<AddressDto> addressDtoList = address.stream()
                .map(AddressDto::from)
                .toList();

        return Response.ok(addressDtoList);
    }
    // 시/군/구 조회
    public ResponseDto getaAddressDepthList(Long addressId , CustomUserDetails userDetails) {
        List<Address> address = addressRepository.findDepthTwo(addressId);
        List<AddressDto> addressDtoList = address.stream()
                .map(AddressDto::from)
                .toList();
        return Response.ok(addressDtoList);
    }

}
