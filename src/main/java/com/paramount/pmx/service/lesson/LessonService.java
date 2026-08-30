package com.paramount.pmx.service.lesson;

import com.paramount.pmx.model.DatatableDto;
import com.paramount.pmx.model.apart.ApartUser;
import com.paramount.pmx.model.enums.CategoryCode;
import com.paramount.pmx.model.enums.TimeCode;
import com.paramount.pmx.model.lesson.Lesson;
import com.paramount.pmx.model.lesson.LessonConfirmed;
import com.paramount.pmx.model.lesson.LessonConfirmedDto;
import com.paramount.pmx.model.lesson.LessonDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.apart.ApartUserRepository;
import com.paramount.pmx.repository.lesson.LessonConfirmedRepository;
import com.paramount.pmx.repository.lesson.LessonRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.specs.lesson.SearchLessonConfirmedSpec;
import com.paramount.pmx.specs.lesson.SearchLessonSpec;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonService {

    private final LessonRepository lessonRepository;
    private final LessonConfirmedRepository lessonConfirmedRepository;
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

    // golf / health 조회
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
                .map(row -> LessonDto.tohealthGolfList(row))
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
       Lesson lesson = Lesson.builder()
                .year(reqDto.getYear())
                .month(reqDto.getMonth())
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
                .timeCode(reqDto.getTimeCode())
                .activated(reqDto.getActivated() == null ? 1 : reqDto.getActivated())
                .build();

        lessonRepository.save(lesson);

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto updateLesson(Long lessonId, LessonDto reqDto, CustomUserDetails userDetails) {

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
        lesson.setTimeCode(reqDto.getTimeCode());
        lesson.setYear(reqDto.getYear());
        lesson.setMonth(reqDto.getMonth());
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

    public ResponseDto getLessonConfirmedDetail(Map<String, Object> requestParams , CustomUserDetails userDetails) {
        String year = parseString(getRequestValue(requestParams, "YEAR_IS", "year"));
        String month = parseString(getRequestValue(requestParams, "MONTH_IS", "month"));
        Long apartId = parseLong(getRequestValue(requestParams, "APART_ID_IS", "apartId"));
        String lessonType = parseString(getRequestValue(requestParams, "LESSON_TYPE_IS", "lessonType"));

        if (year == null || month == null || apartId == null || lessonType == null) {
            throw new IllegalArgumentException("년, 월, 아파트 ,  강습 정보가 필요합니다.");
        }
        List<Lesson> lessonList = null;
        Boolean lessonRegistered = false;
        if (lessonType.equals("gxtuni")) {
            List<Long> categoryIds = List.of(CategoryCode.GX.getCode(), CategoryCode.TUNI.getCode());
            lessonList = lessonRepository.findByYearAndMonthAndApartIdAndCategoryIdIn(year, month, apartId , categoryIds);
        } else if (lessonType.equals("health")) {
            long categoryId = CategoryCode.HEALTH.getCode();;
            lessonList = lessonRepository.findByYearAndMonthAndApartIdAndCategoryId(year, month, apartId , categoryId);
        } else if (lessonType.equals("golf")) {
            long categoryId = CategoryCode.GOLF.getCode();
            lessonList = lessonRepository.findByYearAndMonthAndApartIdAndCategoryId(year, month, apartId , categoryId);
        }

        if (! lessonList.isEmpty()) {
            lessonRegistered = true;
        }

        List<LessonConfirmed> lessonConfirmedList = lessonConfirmedRepository.findByYearAndMonthAndApartIdAndLessonType(year, month, apartId , lessonType);
        if (lessonConfirmedList.isEmpty()) {
            return Response.ok(LessonConfirmedDto.builder()
                    .id(null)
                    .year(year)
                    .month(month)
                    .lessonType(lessonType)
                    .apartId(apartId)
                    .confirmed(null)
                    .lessonRegistered(lessonRegistered)
                    .build());
        }

        return Response.ok(LessonConfirmedDto.toDto(lessonConfirmedList.get(0),lessonRegistered));
    }


    @Transactional
    public ResponseDto createLessonConfirmed(LessonConfirmedDto reqDto, CustomUserDetails userDetails) {

        LessonConfirmed lessonConfirmed = LessonConfirmed.builder()
                .year(reqDto.getYear())
                .month(reqDto.getMonth())
                .apartId(reqDto.getApartId())
                .lessonType(reqDto.getLessonType())
                .confirmed(reqDto.getConfirmed() == null ? 0 : reqDto.getConfirmed())
                .activated(reqDto.getActivated() == null ? 1 : reqDto.getActivated())
                .build();
        lessonConfirmedRepository.save(lessonConfirmed);
        return Response.ok(true);
    }

    @Transactional
    public ResponseDto updateLessonConfirmed(Long lessonConfirmedId, LessonConfirmedDto reqDto, CustomUserDetails userDetails) {
        LessonConfirmed lessonConfirmed = lessonConfirmedRepository.findById(lessonConfirmedId)
                .orElseThrow(() -> new IllegalArgumentException("해당 강습확정을 찾을 수 없습니다."));

        lessonConfirmed.setConfirmed(reqDto.getConfirmed() == null ? lessonConfirmed.getConfirmed() : reqDto.getConfirmed());

        lessonConfirmedRepository.save(lessonConfirmed);

        return Response.ok(true);
    }


    public ResponseDto getApartLessonConfirmedList(Map<String, Object> requestParams , CustomUserDetails userDetails) {
        DatatableDto datatableDto = new DatatableDto(
                requestParams,
                Sort.by(Sort.Order.asc("name")),
                SearchLessonConfirmedSpec::getValidSortKey
        );
        String year = parseString(getRequestValue(requestParams, "YEAR_IS", "year"));
        String month = parseString(getRequestValue(requestParams, "MONTH_IS", "month"));
        Long apartId = parseLong(getRequestValue(requestParams, "APART_ID_IS", "apartId"));
        Long addressId = parseLong(getRequestValue(requestParams, "ADDRESS_ID_IS", "addressId"));
        Long addressId1 = parseLong(getRequestValue(requestParams, "ADDRESS1_ID_IS", "addressId1"));
        String name = parseString(getRequestValue(requestParams, "NAME_LIKE", "name"));

       if (year == null || month == null) {
            throw new IllegalArgumentException("연도, 월 정보가 필요합니다.");
        }

        List<Map<String , Object>> filteredResult = lessonConfirmedRepository.findApartWithLessonConfirmed(
                year,
                month,
                apartId,
                addressId,
                addressId1,
                name
        );

        int start = Math.max(datatableDto.getStart(), 0);
        int length = Math.max(datatableDto.getLength(), 1);
        int end = Math.min(start + length, filteredResult.size());


        List<LessonConfirmedDto> resultList = start >= filteredResult.size()
                ? List.of()
                : filteredResult.subList(start, end).stream()
                .map(LessonConfirmedDto::toDto)
                .toList();
        long recordsTotal = filteredResult.size();

        return Response.ok(
                resultList,
                datatableDto.getDraw(),
                recordsTotal,
                recordsTotal
        );
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

    private boolean isManagerRole(Long roleId) {
        return Long.valueOf(2L).equals(roleId);
    }
}
