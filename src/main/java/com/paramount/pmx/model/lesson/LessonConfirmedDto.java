package com.paramount.pmx.model.lesson;

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
    private Integer confirmed;
    private Integer activated;
    private String createdAt;
    private String updatedAt;

    public static LessonConfirmedDto toDto(LessonConfirmed lessonConfirmed) {
        if (lessonConfirmed == null) {
            return null;
        }
        return LessonConfirmedDto.builder()
                .id(lessonConfirmed.getId())
                .year(lessonConfirmed.getYear())
                .month(lessonConfirmed.getMonth())
                .apartId(lessonConfirmed.getApartId())
                .confirmed(lessonConfirmed.getConfirmed())
                .activated(lessonConfirmed.getActivated())
                .createdAt(formatDateTime(lessonConfirmed.getCreatedAt()))
                .updatedAt(formatDateTime(lessonConfirmed.getUpdatedAt()))
                .build();
    }

    private static String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.toLocalDate() + " " + value.toLocalTime();
    }
}
