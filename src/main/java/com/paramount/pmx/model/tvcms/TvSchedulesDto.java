package com.paramount.pmx.model.tvcms;


import lombok.*;
import lombok.experimental.Accessors;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Description;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.stereotype.Component;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Component
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@ToString
@Accessors(chain = true)
public class TvSchedulesDto implements Serializable {

    private Long id;
    private String scheduleDay;
    private Long programId;
    private String scheduleName;
    private String scheduleSeq;
    private String scheduleStTime;
    private String scheduleEdTime;
    private String scheduleLongTime;
    private String scheduleLevel;
    private String scheduleLevelNm;
    private String scheduleGubn;
    private String scheduleGubnNm;
    private String content;
    private String viewFlag;
    private String viewFlagNm;
    private Long createdBy;
    private Long updatedBy;
    private String createdAt;
    private String updatedAt;
    private String veiwdateAt;

    //목록, 상세정보
    public static TvSchedulesDto toDto(TvSchedules tvSchedules) {
        return TvSchedulesDto.builder()
                .id(tvSchedules.getId())
                .scheduleDay(tvSchedules.getScheduleDay()== null ? "" : tvSchedules.getScheduleDay().trim())
                .programId(tvSchedules.getProgramId()== null ? null : tvSchedules.getProgramId())
                .scheduleName(tvSchedules.getScheduleName()== null ? "" : tvSchedules.getScheduleName().trim())
                .scheduleSeq(tvSchedules.getScheduleSeq()== null ? "" : tvSchedules.getScheduleSeq().trim())
                .scheduleStTime(tvSchedules.getScheduleStTime()== null ? "" : tvSchedules.getScheduleStTime().trim())
                .scheduleEdTime(tvSchedules.getScheduleEdTime()== null ? "" :tvSchedules.getScheduleEdTime().trim())
                .scheduleLongTime(tvSchedules.getScheduleLongTime()== null ? "" : tvSchedules.getScheduleLongTime().trim())
                .scheduleLevel(tvSchedules.getScheduleLevel()== null ? "" : tvSchedules.getScheduleLevel().trim())
                .scheduleLevelNm(getLevelNm(tvSchedules.getScheduleLevel()))
                .scheduleGubn(tvSchedules.getScheduleGubn()== null ? "" : tvSchedules.getScheduleGubn().trim())
                .scheduleGubnNm(getGubnNm(tvSchedules.getScheduleGubn()))
                .content(tvSchedules.getContent())
                .viewFlag(tvSchedules.getViewFlag())
                .viewFlagNm( "1".equals(tvSchedules.getViewFlag())  ? "공개"  : "비공개")
                .createdBy(tvSchedules.getCreatedBy())
                .updatedBy(tvSchedules.getUpdatedBy())
                .createdAt(tvSchedules.getCreatedAt().toLocalDate().toString() + " " + tvSchedules.getCreatedAt().toLocalTime().toString())
                .updatedAt(tvSchedules.getUpdatedAt().toLocalDate().toString() + " " + tvSchedules.getUpdatedAt().toLocalTime().toString())
                .veiwdateAt(tvSchedules.getUpdatedAt() == null ? tvSchedules.getCreatedAt().toLocalDate().toString() : tvSchedules.getUpdatedAt().toLocalDate().toString())
                .build();
    }
    public static String getLevelNm(String level){
        //시청등급 0: 전체 , 1: 7세이상관람가, 2: 12세이상관람가, 3:15세이상관람가 , 4 : 청소년관람불가
        String levelNm = "";
        if ("1".equals(level)){
            levelNm = "7세이상관람가";
        } else if ("2".equals(level)){
            levelNm = "12세이상관람가";
        } else if ("3".equals(level)){
            levelNm = "15세이상관람가";
        } else if ("4".equals(level)){
            levelNm = "청소년관람불가";
        } else {
            levelNm = "전체등급";
        }
        return levelNm;
    }
    public static String getGubnNm(String gubn){
        String gubnName = "";
        if (gubn != null && !gubn.isEmpty()) {
            String[] result = StringUtils.split(gubn, ',');
            for (String gubnId : result) {
                if ("1".equals(gubnId)) {
                    gubnName = gubnName + "본방송,";
                } else if ("2".equals(gubnId)) {
                    gubnName = gubnName +"생방송,";
                } else if ("3".equals(gubnId)) {
                    gubnName = gubnName + "재방송,";
                }
            }
        }
        if ( StringUtils.isNotBlank(gubnName) ) {
            gubnName = gubnName.substring(0, gubnName.length()-1);
        }
        return gubnName;
    }

}
