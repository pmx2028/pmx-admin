package com.paramount.pmx.service.apart;

import com.paramount.pmx.model.DatatableDto;
import com.paramount.pmx.model.apart.Apart;
import com.paramount.pmx.model.apart.ApartDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.model.user.UserReqDto;
import com.paramount.pmx.model.user.Users;
import com.paramount.pmx.repository.apart.ApartRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.specs.apart.SearchApartSpec;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApartService {

    private final ApartRepository apartRepository;

    // 아파트 리스트 조회
    public ResponseDto getAllApartList(Map<String, Object> requestParams, CustomUserDetails userDetails) {
        // 1. DatatableDto 생성
        Sort defaultSort = Sort.by(
                Sort.Order.desc("activated"),
                Sort.Order.desc("id")
        );
        DatatableDto datatableDto = new DatatableDto(requestParams, defaultSort, SearchApartSpec::getValidSortKey);

        // 2. Specification 생성 (DatatableDto에서 추출한 search 파라미터 사용)
//        Map<String, Object> extraSearch = new HashMap<>();
//        extraSearch.put("LEVEL_NOT", 1); // level 1인 경우 일반 회원 데이터기때문에 제외함
//        datatableDto.getSearch().putAll(extraSearch);

        Specification<Apart> spec = SearchApartSpec.createSpecification(datatableDto.getSearch(), List.of());

        // 3. 데이터 조회
        Page<Apart> page = apartRepository.findAll(spec, datatableDto.getPageable());
        List<Apart> apart = page.getContent();

        List<ApartDto> result = apart.stream()
                .map(ApartDto :: toListDto)
                .toList();

        long recordsTotal = apartRepository.count(SearchApartSpec.createSpecification(new HashMap<>(), List.of()));        // 전체 개수
        // 4. 결과 반환
        return Response.ok(
                result, // data
                datatableDto.getDraw(), // draw
                recordsTotal, // recordsTotal
                page.getTotalElements() // recordsFiltered
        );
    };

    // 아파트 추가
    @Transactional
    public ResponseDto createApart(ApartDto reqDto, CustomUserDetails userDetails) {
        String name = normalizeName(reqDto.getName());
        validateDuplicateName(name, null);

        Apart apart = Apart.builder()
                .addressId(reqDto.getAddressId())
                .addressId1(reqDto.getAddressId1())
                .name(name)
                .hosCnt(reqDto.getHosCnt())
                .gxCnt(reqDto.getGxCnt())
                .runCnt(reqDto.getRunCnt())
                .wetCnt(reqDto.getWetCnt())
                .inbyYn(reqDto.getInbyYn())
                .golfCnt(reqDto.getGolfCnt())
                .scrCnt(reqDto.getScrCnt())
                .scrGolfCnt(reqDto.getScrGolfCnt())
                .userId(userDetails == null ? reqDto.getUserId() : userDetails.getId())
                .activated(reqDto.getActivated() == null ? 1 : reqDto.getActivated())
                .build();

        apartRepository.save(apart);

        return Response.ok(true);
    }

    // 아파트 업데이트
    @Transactional
    public ResponseDto updateApart(Long apartId, ApartDto reqDto, CustomUserDetails userDetails) {
        String name = normalizeName(reqDto.getName());
        validateDuplicateName(name, apartId);

        Apart apart = apartRepository.findById(apartId)
                .orElseThrow(() -> new IllegalArgumentException("해당 아파트가 존재하지 않습니다."));

        apart.setAddressId(reqDto.getAddressId());
        apart.setAddressId1(reqDto.getAddressId1());
        apart.setName(name);
        apart.setHosCnt(reqDto.getHosCnt());
        apart.setGxCnt(reqDto.getGxCnt());
        apart.setRunCnt(reqDto.getRunCnt());
        apart.setWetCnt(reqDto.getWetCnt());
        apart.setInbyYn(reqDto.getInbyYn() == null ? apart.getInbyYn() : reqDto.getInbyYn());
        apart.setGolfCnt(reqDto.getGolfCnt());
        apart.setScrCnt(reqDto.getScrCnt());
        apart.setScrGolfCnt(reqDto.getScrGolfCnt());
        apart.setUserId(userDetails == null ? reqDto.getUserId() : userDetails.getId());
        apart.setActivated(reqDto.getActivated() == null ? apart.getActivated() : reqDto.getActivated());
        apartRepository.save(apart);

        return Response.ok(true);
    }

    public ResponseDto checkDuplicateName(String name, Long excludeId, CustomUserDetails userDetails) {
        String normalizedName = normalizeName(name);
        boolean duplicated = excludeId == null
                ? apartRepository.existsByName(normalizedName)
                : apartRepository.existsByNameAndIdNot(normalizedName, excludeId);

        return Response.ok(Map.of("duplicated", duplicated));
    }

    public ResponseDto getApartDetail(Long userId, CustomUserDetails userDetails) {
        Apart apart = apartRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("해당 사용자를 찾을 수 없습니다."));

        ApartDto dto = ApartDto.toDetailDto(apart);

        return Response.ok(dto);
    }

    private String normalizeName(String name) {
        return name == null ? "" : name.trim();
    }

    private void validateDuplicateName(String name, Long excludeId) {
        if (name.isBlank()) {
            throw new IllegalArgumentException("아파트명을 입력해 주세요.");
        }

        boolean duplicated = excludeId == null
                ? apartRepository.existsByName(name)
                : apartRepository.existsByNameAndIdNot(name, excludeId);

        if (duplicated) {
            throw new IllegalArgumentException("이미 등록된 아파트명입니다.");
        }
    }

    // 아파트 중지 처리
    @Transactional
    public ResponseDto resignApart(Long apartId, String resignDate, CustomUserDetails userDetails) {
        Apart apart = apartRepository.findById(apartId)
                .orElseThrow(() -> new NoSuchElementException("해당 아파트를 찾을 수 없습니다."));
        apart.setActivated(0);
        apartRepository.save(apart);
        return Response.ok(true);
    }

}
