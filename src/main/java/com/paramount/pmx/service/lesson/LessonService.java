package com.paramount.pmx.service.lesson;

import com.paramount.pmx.model.DatatableDto;
import com.paramount.pmx.model.apart.ApartUser;
import com.paramount.pmx.model.apart.ApartUserDto;
import com.paramount.pmx.model.enums.TimeCode;
import com.paramount.pmx.model.lesson.Lesson;
import com.paramount.pmx.model.lesson.LessonDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.apart.ApartUserRepository;
import com.paramount.pmx.repository.lesson.LessonRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.specs.apart.SearchApartUserSpec;
import com.paramount.pmx.specs.lesson.SearchLessonSpec;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.paramount.pmx.model.lesson.LessonDto.tohealthGolfList;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ApartUserRepository apartUserRepository;

    //GX , 트리트니 리스트 조회
    public ResponseDto getGxtuniLessonList(Map<String, Object> requestParams, CustomUserDetails userDetails) {
        Sort defaultSort = Sort.by(
                Sort.Order.desc("year"),
                Sort.Order.desc("month"),
                Sort.Order.asc("weekdayCode"),
                Sort.Order.asc("timeCode"),
                Sort.Order.desc("id")
        );
        DatatableDto datatableDto = new DatatableDto(requestParams, defaultSort, SearchLessonSpec::getValidSortKey);

        Specification<Lesson> spec = SearchLessonSpec.createSpecification(datatableDto.getSearch(), List.of());
        Page<Lesson> page = lessonRepository.findAll(spec, datatableDto.getPageable());

        Long apartId = parseLong(datatableDto.getSearch().get("APART_ID_IS"));
        List<Map<String, Object>> baseList = getLessonWeekdayTimeList(apartId, userDetails);
        List<LessonDto> result = LessonDto.tolessonList(baseList, page.getContent(), true);

        long recordsTotal = lessonRepository.count(SearchLessonSpec.createSpecification(new HashMap<>(), List.of()));

        return Response.ok(
                result,
                datatableDto.getDraw(),
                recordsTotal,
                page.getTotalElements()
        );
    }

    //GX , 트리트니 리스트 조회
    public ResponseDto getHealthGolfLessonList(Map<String, Object> requestParams, CustomUserDetails userDetails) {
        DatatableDto datatableDto = new DatatableDto(requestParams, Sort.unsorted(), SearchLessonSpec::getValidSortKey);

        Long apartId = parseLong(getRequestValue(requestParams, "APART_ID_IS", "apartId"));
        Long categoryId = parseLong(getRequestValue(requestParams, "CATEGORY_ID_IS", "categoryId"));
        String year = parseString(getRequestValue(requestParams, "YEAR_IS", "year"));
        String month = parseString(getRequestValue(requestParams, "MONTH_IS", "month"));

        List<Map<String, Object>> result = lessonRepository.findLessonApartUserRows(
                year,
                month,
                apartId,
                categoryId
        );

        List<LessonDto> limitedResult = result.stream()
                .map(row -> tohealthGolfList(row))
                .limit(200)
                .toList();

        return Response.ok(
                limitedResult,
                datatableDto.getDraw(),
                limitedResult.size(),
                limitedResult.size()
        );
    }

    @Transactional
    public ResponseDto saveHealthGolfLessonList(List<LessonDto> reqDtos, CustomUserDetails userDetails) {
        if (reqDtos == null || reqDtos.isEmpty()) {
            return Response.ok(Map.of("created", 0, "updated", 0, "deleted", 0));
        }

        LessonDto first = reqDtos.get(0);
        String year = first.getYear();
        String month = first.getMonth();
        Long apartId = first.getApartId();
        Long categoryId = first.getCategoryId();

        if (year == null || month == null || apartId == null || categoryId == null) {
            throw new IllegalArgumentException("연도, 월, 아파트, 카테고리 정보가 필요합니다.");
        }

        Map<String, Lesson> existingMap = lessonRepository
                .findByYearAndMonthAndApartIdAndCategoryId(year, month, apartId, categoryId)
                .stream()
                .collect(Collectors.toMap(this::getHealthGolfLessonKey, Function.identity(), (left, right) -> left));

        Set<String> selectedKeys = reqDtos.stream()
                .filter(dto -> Boolean.TRUE.equals(dto.getSelected()))
                .map(this::getHealthGolfLessonKey)
                .collect(Collectors.toSet());

        int created = 0;
        int updated = 0;
        int deleted = 0;

        for (LessonDto dto : reqDtos) {
            String key = getHealthGolfLessonKey(dto);
            Lesson lesson = existingMap.get(key);

            if (Boolean.TRUE.equals(dto.getSelected())) {
                validateLessonAmountFields(dto);
                if (lesson == null) {
                    lesson = Lesson.builder()
                            .year(year)
                            .month(month)
                            .apartId(apartId)
                            .userId(dto.getUserId())
                            .categoryId(categoryId)
                            .categoryId1(dto.getCategoryId1())
                            .commission(dto.getCommission())
                            .LessonPrice(dto.getLessonPrice())
                            .LessonCnt(dto.getLessonCnt())
                            .activated(1)
                            .build();
                    created++;
                } else {
                    lesson.setCommission(dto.getCommission());
                    lesson.setLessonPrice(dto.getLessonPrice());
                    lesson.setLessonCnt(dto.getLessonCnt());
                    lesson.setActivated(1);
                    updated++;
                }
                lessonRepository.save(lesson);
            }
        }

        for (Lesson lesson : existingMap.values()) {
            String key = getHealthGolfLessonKey(lesson);
            if (!selectedKeys.contains(key)) {
                lessonRepository.delete(lesson);
                deleted++;
            }
        }

        return Response.ok(Map.of(
                "created", created,
                "updated", updated,
                "deleted", deleted
        ));
    }

    private void validateGxtuniBulkRow(LessonDto dto) {
        if (dto.getYear() == null || dto.getMonth() == null || dto.getApartId() == null) {
            throw new IllegalArgumentException("연도, 월, 아파트 정보가 필요합니다.");
        }
        if (dto.getWeekdayCode() == null || dto.getTimeCode() == null) {
            throw new IllegalArgumentException("요일, 시간 정보가 필요합니다.");
        }
        if (dto.getCategoryId() == null || dto.getCategoryId1() == null) {
            throw new IllegalArgumentException("강습과 세부강습을 선택해 주세요.");
        }
        if (dto.getUserId() == null) {
            throw new IllegalArgumentException("강사를 선택해 주세요.");
        }
        validateLessonAmountFields(dto);
        validateLessonCapacityFields(dto);
    }

    private void validateLessonAmountFields(LessonDto dto) {
        if (dto.getCommission() == null || dto.getLessonPrice() == null || dto.getLessonCnt() == null) {
            throw new IllegalArgumentException("강사가 선택된 행은 수수료, 금액, 횟수를 모두 입력해 주세요.");
        }
    }

    private void validateLessonCapacityFields(LessonDto dto) {
        if (dto.getCapacity() == null || dto.getMinCapacity() == null) {
            throw new IllegalArgumentException("강사가 선택된 행은 정원, 최소정원을 모두 입력해 주세요.");
        }
    }

    @Transactional
    public ResponseDto saveGxtuniLessonList(List<LessonDto> reqDtos, CustomUserDetails userDetails) {
        if (reqDtos == null || reqDtos.isEmpty()) {
            return Response.ok(Map.of("created", 0, "updated", 0, "deleted", 0));
        }

        int created = 0;
        int updated = 0;
        int deleted = 0;

        for (LessonDto dto : reqDtos) {
            boolean selected = dto.getUserId() != null;

            if (!selected) {
                if (dto.getId() != null || dto.getLessonId() != null) {
                    Long lessonId = dto.getId() != null ? dto.getId() : dto.getLessonId();
                    if (lessonRepository.existsById(lessonId)) {
                        lessonRepository.deleteById(lessonId);
                        deleted++;
                    }
                }
                continue;
            }

            validateGxtuniBulkRow(dto);

            Long lessonId = dto.getId() != null ? dto.getId() : dto.getLessonId();
            Lesson lesson;
            if (lessonId == null) {
                lesson = Lesson.builder()
                        .year(dto.getYear())
                        .month(dto.getMonth())
                        .weekdayCode(dto.getWeekdayCode())
                        .timeCode(dto.getTimeCode())
                        .apartId(dto.getApartId())
                        .userId(dto.getUserId())
                        .categoryId(dto.getCategoryId())
                        .categoryId1(dto.getCategoryId1())
                        .commission(dto.getCommission())
                        .capacity(dto.getCapacity())
                        .minCapacity(dto.getMinCapacity())
                        .LessonPrice(dto.getLessonPrice())
                        .LessonCnt(dto.getLessonCnt())
                        .activated(1)
                        .build();
                created++;
            } else {
                lesson = lessonRepository.findById(lessonId)
                        .orElseThrow(() -> new IllegalArgumentException("해당 강습을 찾을 수 없습니다."));
                lesson.setYear(dto.getYear());
                lesson.setMonth(dto.getMonth());
                lesson.setWeekdayCode(dto.getWeekdayCode());
                lesson.setTimeCode(dto.getTimeCode());
                lesson.setApartId(dto.getApartId());
                lesson.setUserId(dto.getUserId());
                lesson.setCategoryId(dto.getCategoryId());
                lesson.setCategoryId1(dto.getCategoryId1());
                lesson.setCommission(dto.getCommission());
                lesson.setCapacity(dto.getCapacity());
                lesson.setMinCapacity(dto.getMinCapacity());
                lesson.setLessonPrice(dto.getLessonPrice());
                lesson.setLessonCnt(dto.getLessonCnt());
                lesson.setActivated(1);
                updated++;
            }

            lessonRepository.save(lesson);
        }

        return Response.ok(Map.of(
                "created", created,
                "updated", updated,
                "deleted", deleted
        ));
    }

    @Transactional
    public ResponseDto createLesson(LessonDto reqDto, CustomUserDetails userDetails) {
        //validateRequiredIds(reqDto);
        //validateDuplicate(reqDto.getApartId(), reqDto.getUserId(), reqDto.getCategoryId1(), reqDto.getRoleId(), null);

        Lesson lesson = Lesson.builder()
                .apartId(reqDto.getApartId())
                .userId(reqDto.getUserId())
                .categoryId(reqDto.getCategoryId())
                .categoryId1(reqDto.getCategoryId1())
                .commission(reqDto.getCommission())
                .capacity(reqDto.getCapacity())
                .minCapacity(reqDto.getMinCapacity())
                .LessonPrice(reqDto.getLessonPrice())
                .LessonCnt(reqDto.getLessonCnt())
                .weekdayCode(reqDto.getWeekdayCode())
                .activated(reqDto.getActivated() == null ? 1 : reqDto.getActivated())
                .build();

        lessonRepository.save(lesson);

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto updateLesson(Long lessonId, LessonDto reqDto, CustomUserDetails userDetails) {
        //validateRequiredIds(reqDto);
        //validateDuplicate(reqDto.getApartId(), reqDto.getUserId(), reqDto.getCategoryId1(), reqDto.getRoleId(), apartUserId);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("해당 아파트 사용자가 존재하지 않습니다."));

        lesson.setApartId(reqDto.getApartId());
        lesson.setUserId(reqDto.getUserId());
        lesson.setCategoryId(reqDto.getCategoryId());
        lesson.setCategoryId1(reqDto.getCategoryId1());
        lesson.setCommission(reqDto.getCommission());
        lesson.setCapacity(reqDto.getCapacity());
        lesson.setMinCapacity(reqDto.getMinCapacity());
        lesson.setLessonPrice(reqDto.getLessonPrice());
        lesson.setLessonCnt(reqDto.getLessonCnt());
        lesson.setWeekdayCode(reqDto.getWeekdayCode());
        lesson.setActivated(reqDto.getActivated() == null ? lesson.getActivated() : reqDto.getActivated());
        lessonRepository.save(lesson);

        return Response.ok(true);
    }

    public ResponseDto getLessonDetail(Long lessonId, CustomUserDetails userDetails) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new NoSuchElementException("해당 아파트 사용자를 찾을 수 없습니다."));

        return Response.ok(LessonDto.toDetailDto(lesson));
    }

    @Transactional
    public ResponseDto resignApartUser(Long apartUserId, String resignDate, CustomUserDetails userDetails) {
        Lesson lesson = lessonRepository.findById(apartUserId)
                .orElseThrow(() -> new NoSuchElementException("해당 강습을 찾을 수 없습니다."));
        lesson.setActivated(0);
        lessonRepository.save(lesson);
        return Response.ok(true);
    }


    public List<Map<String, Object>> getLessonWeekdayTimeList(Long apartId, CustomUserDetails userDetails) {
        Set<Long> apartUserWeekdayCodes = new HashSet<>(getAparUserWeekdayCodeList(apartId, userDetails));

        return Arrays.stream(com.paramount.pmx.model.enums.WeekdayCode.values())
                .filter(weekdayCode -> apartUserWeekdayCodes.contains(weekdayCode.getCode()))
                .flatMap(weekdayCode -> Arrays.stream(TimeCode.values())
                        .map(timeCode -> Map.<String, Object>of(
                                "timecode", timeCode.getCode(),
                                "timename", timeCode.getDescription(),
                                "weekdaycode", weekdayCode.getCode(),
                                "weekdayname", weekdayCode.getDescription()
                        )))
                .toList();
    }

    // AparUserWeek에 WeekdayCode 등록된 코드 리스트 조회
    public List<Long> getAparUserWeekdayCodeList(Long apartId, CustomUserDetails userDetails) {
        if (apartId == null) {
            return List.of();
        }

        return apartUserRepository.findByApartIdAndActivated(apartId, 1).stream()
                .map(ApartUser::getWeekdayCodes)
                .filter(weekdayCodes -> weekdayCodes != null && !weekdayCodes.isBlank())
                .flatMap(weekdayCodes -> List.of(weekdayCodes.split(",")).stream())
                .map(String::trim)
                .filter(code -> !code.isBlank())
                .map(this::parseWeekdayCode)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private Long parseWeekdayCode(String code) {
        try {
            return Long.valueOf(code);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Long parseLong(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return Long.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Object getRequestValue(Map<String, Object> requestParams, String searchKey, String plainKey) {
        Object searchValue = requestParams.get("search_" + searchKey);
        if (searchValue != null) {
            return searchValue;
        }
        Object directSearchValue = requestParams.get(searchKey);
        if (directSearchValue != null) {
            return directSearchValue;
        }
        return requestParams.get(plainKey);
    }

    private String parseString(Object value) {
        return value == null ? null : value.toString();
    }

    private String getHealthGolfLessonKey(Lesson lesson) {
        return lesson.getUserId() + "_" + lesson.getCategoryId() + "_" + lesson.getCategoryId1();
    }

    private String getHealthGolfLessonKey(LessonDto dto) {
        return dto.getUserId() + "_" + dto.getCategoryId() + "_" + dto.getCategoryId1();
    }

//    public ResponseDto checkDuplicateApartUser(Long apartId, Long userId, Long categoryId1, Long excludeId, CustomUserDetails userDetails) {
//        if (apartId == null) {
//            throw new IllegalArgumentException("아파트 선택해 주세요.");
//        }
//        if (userId == null) {
//            throw new IllegalArgumentException("사용자 선택해 주세요.");
//        }
//
//        boolean duplicated;
//        if (categoryId1 == null) {
//            duplicated = excludeId == null
//                    ? apartUserRepository.existsByApartIdAndUserId(apartId, userId)
//                    : apartUserRepository.existsByApartIdAndUserIdAndIdNot(apartId, userId, excludeId);
//        } else {
//            duplicated = excludeId == null
//                    ? apartUserRepository.existsByApartIdAndUserIdAndCategoryId1(apartId, userId, categoryId1)
//                    : apartUserRepository.existsByApartIdAndUserIdAndCategoryId1AndIdNot(apartId, userId, categoryId1, excludeId);
//        }
//
//        return Response.ok(Map.of("duplicated", duplicated));
//    }



//    private void validateRequiredIds(LessonDto reqDto) {
//        if (reqDto == null) {
//            throw new IllegalArgumentException("요청 정보가 없습니다.");
//        }
//        validateRequiredIds(reqDto.getApartId(), reqDto.getUserId(), reqDto.getCategoryId1(), reqDto.getRoleId());
//    }
//
//    private void validateRequiredIds(Long apartId, Long userId, Long categoryId1, Long roleId) {
//        if (apartId == null) {
//            throw new IllegalArgumentException("아파트 선택해 주세요.");
//        }
//        if (userId == null) {
//            throw new IllegalArgumentException("사용자 선택해 주세요.");
//        }
//        if (!isManagerRole(roleId) && categoryId1 == null) {
//            throw new IllegalArgumentException("카테고리를 선택해 주세요.");
//        }
//    }

//    private void validateDuplicate(Long apartId, Long userId, Long categoryId1, Long roleId, Long excludeId) {
//        boolean duplicated;
//        if (isManagerRole(roleId)) {
//            duplicated = excludeId == null
//                    ? lessonRepository.existsByYearAndMonthAndWeekdayCodeAndTimeCodeAndApartIdAndUserId(apartId, userId)
//        } else {
//            duplicated = excludeId == null
//                    ? apartUserRepository.existsByYearAndMonthAndWeekdayCodeAndTimeCodeAndApartIdAndUserId(apartId, userId, categoryId1)
//        }
//
//        if (duplicated) {
//            throw new IllegalArgumentException("이미 등록된 아파트 사용자입니다.");
//        }
//    }

    private boolean isManagerRole(Long roleId) {
        return Long.valueOf(2L).equals(roleId);
    }
}
