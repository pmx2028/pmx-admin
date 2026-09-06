package com.paramount.pmx.model.lesson;

import com.paramount.pmx.model.enums.Confirmed;
import com.paramount.pmx.model.enums.TimeCode;
import com.paramount.pmx.model.enums.WeekdayCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.Map;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@ToString
@Accessors(chain = true)
public class LessonConfirmedDto {

    private Long id;
    private String year;
    private String month;
    private Long apartId;
    private String apartName;
    private Long categoryId;
    private String categoryIdStr;
    private Long categoryName;
    private Long addressId;
    private String addressName;
    private Long addressId1;
    private String addressName1;
    private Integer apartActivated;
    private String lessonType;
    private Integer confirmed;
    private Integer activated;
    private String gxConfirmed;
    private String healthConfirmed;
    private String golfConfirmed;
    private String tuniConfirmed;
    private String gxConfirmedName;
    private String healthConfirmedName;
    private String golfConfirmedName;
    private String tuniConfirmedName;
    private String createdAt;
    private String updatedAt;
    private Boolean lessonRegistered;


    public static LessonConfirmedDto toDto(LessonConfirmed lessonConfirmed , Boolean lessonRegistered) {
        if (lessonConfirmed == null) {
            return null;
        }
        return LessonConfirmedDto.builder()
                .id(lessonConfirmed.getId())
                .year(lessonConfirmed.getYear())
                .month(lessonConfirmed.getMonth())
                .apartId(lessonConfirmed.getApartId())
                .categoryId(lessonConfirmed.getCategoryId())
                .confirmed(lessonConfirmed.getConfirmed())
                .activated(lessonConfirmed.getActivated())
                .lessonRegistered(lessonRegistered)
                .createdAt(formatDateTime(lessonConfirmed.getCreatedAt()))
                .updatedAt(formatDateTime(lessonConfirmed.getUpdatedAt()))
                .build();
    }

    public static LessonConfirmedDto toDto(LessonConfirmed lessonConfirmed) {
        return toDto(lessonConfirmed , false);
    }

    private static String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.toLocalDate() + " " + value.toLocalTime();
    }

    // findApartWithLessonConfirmed(네이티브 쿼리, Map<String,Object> 반환) 결과 1행을 DTO로 변환할 때 사용
    public static LessonConfirmedDto toDto(Map<String, Object> row) {
        if (row == null) {
            return null;
        }
        return LessonConfirmedDto.builder()
                .id(toLong(row.get("id")))
                .year(toStringValue(row.get("year")))
                .month(toStringValue(row.get("month")))
                .apartId(toLong(row.get("apartId")))
                .categoryId(toLong(row.get("categoryId")))
                .categoryName(toLong(row.get("categoryName")))
                .apartName(toStringValue(row.get("apartName")))
                .addressId(toLong(row.get("id")))
                .addressName(toStringValue(row.get("addressName")))
                .addressId1(toLong(row.get("addressId1")))
                .addressName1(toStringValue(row.get("addressName1")))
                .apartActivated(toInteger(row.get("apartActivated")))
                .activated(toInteger(row.get("activated")))
                .gxConfirmed(toStringValue(row.get("gxConfirmed")))
                .gxConfirmedName(Confirmed.getDescription(toStringValue(row.get("gxConfirmed"))))
                .healthConfirmed(toStringValue(row.get("healthConfirmed")))
                .healthConfirmedName(Confirmed.getDescription(toStringValue(row.get("healthConfirmed"))))
                .golfConfirmed(toStringValue(row.get("golfConfirmed")))
                .golfConfirmedName(Confirmed.getDescription(toStringValue(row.get("golfConfirmed"))))
                .tuniConfirmed(toStringValue(row.get("tuniConfirmed")))
                .tuniConfirmedName(Confirmed.getDescription(toStringValue(row.get("tuniConfirmed"))))
                .build();


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

    private static String toStringValue(Object value) {
        return value == null ? null : value.toString();
    }
}
