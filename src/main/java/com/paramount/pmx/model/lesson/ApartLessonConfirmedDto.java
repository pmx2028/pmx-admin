package com.paramount.pmx.model.lesson;

import com.paramount.pmx.model.apart.Apart;
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
public class ApartLessonConfirmedDto {

    private Long apartId;
    private String apartName;
    private Integer addressId;
    private Integer addressId1;
    private Integer apartActivated;

    private Long lessonConfirmedId;
    private String year;
    private String month;
    private Integer confirmed;
    private Integer confirmedActivated;
    private String createdAt;
    private String updatedAt;

    // Specification/Page 기반 아파트 목록 조회 후, 배치로 조회한 LessonConfirmed를 병합할 때 사용
    public static ApartLessonConfirmedDto of(Apart apart, LessonConfirmed lessonConfirmed, String year, String month) {
        if (apart == null) {
            return null;
        }

        ApartLessonConfirmedDtoBuilder builder = ApartLessonConfirmedDto.builder()
                .apartId(apart.getId())
                .apartName(apart.getName())
                .addressId(apart.getAddressId())
                .addressId1(apart.getAddressId1())
                .apartActivated(apart.getActivated())
                .year(year)
                .month(month);

        if (lessonConfirmed != null) {
            builder.lessonConfirmedId(lessonConfirmed.getId())
                    .confirmed(lessonConfirmed.getConfirmed())
                    .confirmedActivated(lessonConfirmed.getActivated())
                    .createdAt(formatDateTime(lessonConfirmed.getCreatedAt()))
                    .updatedAt(formatDateTime(lessonConfirmed.getUpdatedAt()));
        }

        return builder.build();
    }

    // 네이티브 쿼리(findApartWithLessonConfirmed) 단건 조회 결과를 매핑할 때 사용
    public static ApartLessonConfirmedDto of(Map<String, Object> row) {
        if (row == null) {
            return null;
        }

        return ApartLessonConfirmedDto.builder()
                .apartId(toLong(getMapValue(row, "apartId")))
                .apartName(toStringValue(getMapValue(row, "apartName")))
                .addressId(toInteger(getMapValue(row, "addressId")))
                .addressId1(toInteger(getMapValue(row, "addressId1")))
                .apartActivated(toInteger(getMapValue(row, "apartActivated")))
                .lessonConfirmedId(toLong(getMapValue(row, "lessonConfirmedId")))
                .year(toStringValue(getMapValue(row, "year")))
                .month(toStringValue(getMapValue(row, "month")))
                .confirmed(toInteger(getMapValue(row, "confirmed")))
                .confirmedActivated(toInteger(getMapValue(row, "confirmedActivated")))
                .createdAt(formatDateTime(getMapValue(row, "createdAt")))
                .updatedAt(formatDateTime(getMapValue(row, "updatedAt")))
                .build();
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

    private static String formatDateTime(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDateTime dateTime) {
            return dateTime.toLocalDate() + " " + dateTime.toLocalTime();
        }
        return value.toString();
    }
}
