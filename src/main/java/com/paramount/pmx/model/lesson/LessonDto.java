package com.paramount.pmx.model.lesson;

import com.paramount.pmx.model.enums.TimeCode;
import com.paramount.pmx.model.enums.UserRole;
import com.paramount.pmx.model.enums.WeekdayCode;
import lombok.*;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@ToString
@Accessors(chain = true)
public class LessonDto {

    private Long id;
    private String year;
    private String month;
    private Long weekdayCode;
    private String weekdayName;
    private String timeCode;
    private String timeName;
    private Long apartId;
    private String apartName;
    private Long userId;
    private String userName;
    private Long categoryId;
    private String categoryName;
    private Long categoryId1;
    private String categoryName1;
    private Long commission;
    private Integer capacity;
    private Integer minCapacity;
    private Long lessonPrice;
    private Integer lessonCnt;
    private Integer activated;
    private String cancelReason;
    private Long lessonId;
    private Integer lessonActivated;
    private Integer apartUserActivated;
    private Boolean selected;
    private String createdAt;
    private String updatedAt;
    private LessonConfirmedDto confirmed;
    private List<String> btnActions;

    public static LessonDto toDto(Lesson lesson) {
        return from(lesson, false);
    }

    public static LessonDto toDetailDto(Lesson lesson) {
        return from(lesson, false);
    }

    public static LessonDto toListDto(Lesson lesson) {
        return from(lesson, true);
    }

    private static LessonDto from(Lesson lesson, boolean includeActions) {
        if (lesson == null) {
            return null;
        }

        List<String> btnActions = new ArrayList<>();
        if (includeActions) {
            btnActions.add("EDIT");
            if (!Integer.valueOf(0).equals(lesson.getActivated())) {
                btnActions.add("DELETE");
            }
        }

        // 회원 구분
        String weekdayName = WeekdayCode.getDescription(lesson.getWeekdayCode());
        String timeName = TimeCode.getDescription(lesson.getTimeCode());

        return LessonDto.builder()
                .id(lesson.getId())
                .year(lesson.getYear())
                .month(lesson.getMonth())
                .weekdayCode(lesson.getWeekdayCode())
                .weekdayName(weekdayName)
                .timeCode(lesson.getTimeCode())
                .timeName(timeName)
                .apartId(lesson.getApartId())
                .apartName(lesson.getApart() == null ? null : lesson.getApart().getName())
                .userId(lesson.getUserId())
                .userName(lesson.getUser() == null ? null : lesson.getUser().getName())
                .categoryId(lesson.getCategoryId())
                .categoryName(lesson.getCategory() == null ? null : lesson.getCategory().getName())
                .categoryId1(lesson.getCategoryId1())
                .categoryName1(lesson.getCategory1() == null ? null : lesson.getCategory1().getName())
                .commission(lesson.getCommission())
                .capacity(lesson.getCapacity())
                .minCapacity(lesson.getMinCapacity())
                .lessonPrice(lesson.getLessonPrice())
                .lessonCnt(lesson.getLessonCnt())
                .activated(lesson.getActivated())
                .createdAt(formatDateTime(lesson.getCreatedAt()))
                .updatedAt(formatDateTime(lesson.getUpdatedAt()))
                .btnActions(btnActions)
                .build();
    }

    public static List<LessonDto> tolessonList(List<Map<String, Object>> baseList, List<Lesson> lessons, boolean includeActions) {
        if (baseList == null || baseList.isEmpty()) {
            return List.of();
        }

        Map<String, Lesson> lessonMap = new HashMap<>();
        if (lessons != null) {
            lessons.stream()
                    .filter(Objects::nonNull)
                    .forEach(lesson -> lessonMap.put(getLessonKey(lesson.getWeekdayCode(), lesson.getTimeCode()), lesson));
        }

        return baseList.stream()
                .map(base -> {
                    Long weekdayCode = toLong(base.get("weekdaycode"));
                    String timeCode = toStringValue(base.get("timecode"));
                    Lesson lesson = lessonMap.get(getLessonKey(weekdayCode, timeCode));
                    return tolessonList(base, lesson, includeActions);
                })
                .toList();
    }

    private static LessonDto tolessonList(Map<String, Object> base, Lesson lesson, boolean includeActions) {
        List<String> btnActions = new ArrayList<>();

        Long baseWeekdayCode = toLong(base.get("weekdaycode"));
        String baseWeekdayName = toStringValue(base.get("weekdayname"));
        String baseTimeCode = toStringValue(base.get("timecode"));
        String baseTimeName = toStringValue(base.get("timename"));

        return LessonDto.builder()
                .id(lesson == null ? null : lesson.getId())
                .year(lesson == null ? null : lesson.getYear())
                .month(lesson == null ? null : lesson.getMonth())
                .weekdayCode(lesson == null ? baseWeekdayCode : lesson.getWeekdayCode())
                .weekdayName(lesson == null ? baseWeekdayName : WeekdayCode.getDescription(lesson.getWeekdayCode()))
                .timeCode(lesson == null ? baseTimeCode : lesson.getTimeCode())
                .timeName(lesson == null ? baseTimeName : TimeCode.getDescription(lesson.getTimeCode()))
                .apartId(lesson == null ? null : lesson.getApartId())
                .apartName(lesson == null || lesson.getApart() == null ? null : lesson.getApart().getName())
                .userId(lesson == null ? null : lesson.getUserId())
                .userName(lesson == null || lesson.getUser() == null ? null : lesson.getUser().getName())
                .categoryId(lesson == null ? null : lesson.getCategoryId())
                .categoryName(lesson == null || lesson.getCategory() == null ? null : lesson.getCategory().getName())
                .categoryId1(lesson == null ? null : lesson.getCategoryId1())
                .categoryName1(lesson == null || lesson.getCategory1() == null ? null : lesson.getCategory1().getName())
                .commission(lesson == null ? 0 : lesson.getCommission())
                .capacity(lesson == null ? 0 : lesson.getCapacity())
                .minCapacity(lesson == null ? 0 : lesson.getMinCapacity())
                .lessonPrice(lesson == null ? 0 : lesson.getLessonPrice())
                .lessonCnt(lesson == null ? 0 : lesson.getLessonCnt())
                .activated(lesson == null ? 1 : lesson.getActivated())
                .cancelReason(lesson == null ? null : lesson.getCancelReason())
                .createdAt(lesson == null ? null : formatDateTime(lesson.getCreatedAt()))
                .updatedAt(lesson == null ? null : formatDateTime(lesson.getUpdatedAt()))
                .btnActions(btnActions)
                .build();
    }


    public static LessonDto tohealthGolfList(Map<String, Object> healthGolf) {
        return tohealthGolfList(healthGolf, true);
    }

    public static LessonDto tohealthGolfList(Map<String, Object> healthGolf, boolean includeActions) {
        if (healthGolf == null) {
            return null;
        }

        Long lessonId = toLong(getMapValue(healthGolf, "lessonId"));
        Integer lessonActivated = toInteger(getMapValue(healthGolf, "lessonActivated"));
        Integer apartUserActivated = toInteger(getMapValue(healthGolf, "apartUserActivated"));

        List<String> btnActions = new ArrayList<>();
        if (includeActions && lessonId != null) {
            btnActions.add("EDIT");
            if (!Integer.valueOf(0).equals(lessonActivated)) {
                btnActions.add("DELETE");
            }
        }

        return LessonDto.builder()
                .id(lessonId)
                .lessonId(lessonId)
                .year(toStringValue(getMapValue(healthGolf, "year")))
                .month(toStringValue(getMapValue(healthGolf, "month")))
                .apartId(toLong(getMapValue(healthGolf, "apartId")))
                .userId(toLong(getMapValue(healthGolf, "userId")))
                .userName(toStringValue(getMapValue(healthGolf, "userName")))
                .categoryId(toLong(getMapValue(healthGolf, "categoryId")))
                .categoryName(toStringValue(getMapValue(healthGolf, "categoryName")))
                .categoryId1(toLong(getMapValue(healthGolf, "categoryId1")))
                .categoryName1(toStringValue(getMapValue(healthGolf, "categoryName1")))
                .commission(toLong(getMapValue(healthGolf, "commission")))
                .lessonPrice(toLong(getMapValue(healthGolf, "lessonPrice")))
                .lessonCnt(toInteger(getMapValue(healthGolf, "lessonCnt")))
                .activated(lessonActivated == null ? apartUserActivated : lessonActivated)
                .lessonActivated(lessonActivated)
                .apartUserActivated(apartUserActivated)
                .btnActions(btnActions)
                .build();
    }

    private static String getLessonKey(Long weekdayCode, String timeCode) {
        return String.valueOf(weekdayCode) + "_" + String.valueOf(timeCode);
    }

    private static Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Integer toInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Object getMapValue(Map<String, Object> map, String key) {
        if (map.containsKey(key)) {
            return map.get(key);
        }

        String snakeKey = key.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
        if (map.containsKey(snakeKey)) {
            return map.get(snakeKey);
        }

        return map.get(key.toUpperCase());
    }

    private static String toStringValue(Object value) {
        return value == null ? null : value.toString();
    }

    private static String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.toLocalDate() + " " + value.toLocalTime();
    }

}
