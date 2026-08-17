package com.paramount.pmx.service.apart;

import com.paramount.pmx.model.DatatableDto;
import com.paramount.pmx.model.apart.ApartUser;
import com.paramount.pmx.model.apart.ApartUserDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.apart.ApartUserRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.specs.apart.SearchApartUserSpec;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApartUserService {

    private final ApartUserRepository apartUserRepository;

    public ResponseDto getAllApartUserList(Map<String, Object> requestParams, CustomUserDetails userDetails) {
        Sort defaultSort = Sort.by(
                Sort.Order.desc("activated"),
                Sort.Order.asc("categoryId"),
                Sort.Order.asc("categoryId1"),
                Sort.Order.desc("id")
        );
        DatatableDto datatableDto = new DatatableDto(requestParams, defaultSort, SearchApartUserSpec::getValidSortKey);

        Specification<ApartUser> spec = SearchApartUserSpec.createSpecification(datatableDto.getSearch(), List.of());
        Page<ApartUser> page = apartUserRepository.findAll(spec, datatableDto.getPageable());

        List<ApartUserDto> result = page.getContent().stream()
                .map(ApartUserDto::toListDto)
                .toList();

        long recordsTotal = apartUserRepository.count(SearchApartUserSpec.createSpecification(new HashMap<>(), List.of()));

        return Response.ok(
                result,
                datatableDto.getDraw(),
                recordsTotal,
                page.getTotalElements()
        );
    }

    @Transactional
    public ResponseDto createApartUser(ApartUserDto reqDto, CustomUserDetails userDetails) {
        validateRequiredIds(reqDto);
        validateDuplicate(reqDto.getApartId(), reqDto.getUserId(), reqDto.getCategoryId1(), reqDto.getRoleId(), null);

        ApartUser apartUser = ApartUser.builder()
                .apartId(reqDto.getApartId())
                .userId(reqDto.getUserId())
                .categoryId(reqDto.getCategoryId())
                .categoryId1(reqDto.getCategoryId1())
                .commission(reqDto.getCommission())
                .capacity(reqDto.getCapacity())
                .minCapacity(reqDto.getMinCapacity())
                .LessonPrice(reqDto.getLessonPrice())
                .LessonCnt(reqDto.getLessonCnt())
                .weekdayCodes(reqDto.getWeekdayCodes())
                .activated(reqDto.getActivated() == null ? 1 : reqDto.getActivated())
                .build();

        apartUserRepository.save(apartUser);

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto updateApartUser(Long apartUserId, ApartUserDto reqDto, CustomUserDetails userDetails) {
        validateRequiredIds(reqDto);
        validateDuplicate(reqDto.getApartId(), reqDto.getUserId(), reqDto.getCategoryId1(), reqDto.getRoleId(), apartUserId);

        ApartUser apartUser = apartUserRepository.findById(apartUserId)
                .orElseThrow(() -> new IllegalArgumentException("해당 아파트 사용자가 존재하지 않습니다."));

        apartUser.setApartId(reqDto.getApartId());
        apartUser.setUserId(reqDto.getUserId());
        apartUser.setCategoryId(reqDto.getCategoryId());
        apartUser.setCategoryId1(reqDto.getCategoryId1());
        apartUser.setCommission(reqDto.getCommission());
        apartUser.setCapacity(reqDto.getCapacity());
        apartUser.setMinCapacity(reqDto.getMinCapacity());
        apartUser.setLessonPrice(reqDto.getLessonPrice());
        apartUser.setLessonCnt(reqDto.getLessonCnt());
        apartUser.setWeekdayCodes(reqDto.getWeekdayCodes());
        apartUser.setActivated(reqDto.getActivated() == null ? apartUser.getActivated() : reqDto.getActivated());
        apartUserRepository.save(apartUser);

        return Response.ok(true);
    }

    public ResponseDto checkDuplicateApartUser(Long apartId, Long userId, Long categoryId1, Long excludeId, CustomUserDetails userDetails) {
        if (apartId == null) {
            throw new IllegalArgumentException("아파트 선택해 주세요.");
        }
        if (userId == null) {
            throw new IllegalArgumentException("사용자 선택해 주세요.");
        }

        boolean duplicated;
        if (categoryId1 == null) {
            duplicated = excludeId == null
                    ? apartUserRepository.existsByApartIdAndUserId(apartId, userId)
                    : apartUserRepository.existsByApartIdAndUserIdAndIdNot(apartId, userId, excludeId);
        } else {
            duplicated = excludeId == null
                    ? apartUserRepository.existsByApartIdAndUserIdAndCategoryId1(apartId, userId, categoryId1)
                    : apartUserRepository.existsByApartIdAndUserIdAndCategoryId1AndIdNot(apartId, userId, categoryId1, excludeId);
        }

        return Response.ok(Map.of("duplicated", duplicated));
    }

    public ResponseDto getApartUserDetail(Long apartUserId, CustomUserDetails userDetails) {
        ApartUser apartUser = apartUserRepository.findById(apartUserId)
                .orElseThrow(() -> new NoSuchElementException("해당 아파트 사용자를 찾을 수 없습니다."));

        return Response.ok(ApartUserDto.toDetailDto(apartUser));
    }

    @Transactional
    public ResponseDto resignApartUser(Long apartUserId, String resignDate, CustomUserDetails userDetails) {
        ApartUser apartUser = apartUserRepository.findById(apartUserId)
                .orElseThrow(() -> new NoSuchElementException("해당 아파트 사용자를 찾을 수 없습니다."));
        apartUser.setActivated(0);
        apartUserRepository.save(apartUser);
        return Response.ok(true);
    }

    private void validateRequiredIds(ApartUserDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("요청 정보가 없습니다.");
        }
        validateRequiredIds(reqDto.getApartId(), reqDto.getUserId(), reqDto.getCategoryId1(), reqDto.getRoleId());
    }

    private void validateRequiredIds(Long apartId, Long userId, Long categoryId1, Long roleId) {
        if (apartId == null) {
            throw new IllegalArgumentException("아파트 선택해 주세요.");
        }
        if (userId == null) {
            throw new IllegalArgumentException("사용자 선택해 주세요.");
        }
        if (!isManagerRole(roleId) && categoryId1 == null) {
            throw new IllegalArgumentException("카테고리를 선택해 주세요.");
        }
    }

    private void validateDuplicate(Long apartId, Long userId, Long categoryId1, Long roleId, Long excludeId) {
        boolean duplicated;
        if (isManagerRole(roleId)) {
            duplicated = excludeId == null
                    ? apartUserRepository.existsByApartIdAndUserId(apartId, userId)
                    : apartUserRepository.existsByApartIdAndUserIdAndIdNot(apartId, userId, excludeId);
        } else {
            duplicated = excludeId == null
                    ? apartUserRepository.existsByApartIdAndUserIdAndCategoryId1(apartId, userId, categoryId1)
                    : apartUserRepository.existsByApartIdAndUserIdAndCategoryId1AndIdNot(apartId, userId, categoryId1, excludeId);
        }

        if (duplicated) {
            throw new IllegalArgumentException("이미 등록된 아파트 사용자입니다.");
        }
    }

    private boolean isManagerRole(Long roleId) {
        return Long.valueOf(2L).equals(roleId);
    }
}
