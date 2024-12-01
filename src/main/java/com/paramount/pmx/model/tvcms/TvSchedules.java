package com.paramount.pmx.model.tvcms;


import lombok.*;

import org.springframework.context.annotation.Description;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;


@Description("편성표")
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "TV_SCHEDULES")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@ToString(exclude = {})
@EqualsAndHashCode(of = {"id"})
public class TvSchedules implements Serializable {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SCHEDULE_DAY")
    private String scheduleDay;

    @Column(name = "PROGRAM_ID")
    private Long programId;

    @Column(name = "SCHEDULE_NAME")
    private String scheduleName;

    @Column(name = "SCHEDULE_SEQ")
    private String scheduleSeq;

    @Column(name = "SCHEDULE_ST_TIME")
    private String scheduleStTime;

    @Column(name = "SCHEDULE_ED_TIME")
    private String scheduleEdTime;

    @Column(name = "SCHEDULE_LONG_TIME")
    private String scheduleLongTime;

    @Column(name = "SCHEDULE_LEVEL")
    private String scheduleLevel;

    @Column(name = "SCHEDULE_GUBN")
    private String scheduleGubn;

    @Column(name = "CONTENT")
    private String content;

    @Column(name = "VIEW_FLAG")
    private String viewFlag;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @Column(name = "UPDATED_BY" )
    private Long updatedBy;

    @Column(name = "CREATED_AT" , updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    @LastModifiedDate
    private LocalDateTime updatedAt;


    @Builder
    public TvSchedules (
            String scheduleDay
            , Long programId
            , String scheduleName
            , String scheduleSeq
            , String scheduleStTime
            , String scheduleEdTime
            , String scheduleLongTime
            , String scheduleLevel
            , String scheduleGubn
            , String content
            , String viewFlag
            , Long createdBy
            , Long updatedBy
            , LocalDateTime createdAt
            , LocalDateTime updatedAt
    )   {
        this.scheduleDay = scheduleDay;
        this.programId = programId;
        this.scheduleName = scheduleName;
        this.scheduleSeq = scheduleSeq;
        this.scheduleStTime = scheduleStTime;
        this.scheduleEdTime = scheduleEdTime;
        this.scheduleLongTime = scheduleLongTime;
        this.scheduleLevel = scheduleLevel;
        this.scheduleGubn = scheduleGubn;
        this.content = content;
        this.viewFlag = viewFlag;
        this.createdBy = createdBy;
    }

    public TvSchedules updateTvSchedules (
          String scheduleDay
         , Long programId
          , String scheduleName
          , String scheduleSeq
          , String scheduleStTime
          , String scheduleEdTime
          , String scheduleLongTime
          , String scheduleLevel
          , String scheduleGubn
          , String content
          , String viewFlag
          , Long updatedBy


    ) {
        this.scheduleDay = scheduleDay;
        this.programId = programId;
        this.scheduleName = scheduleName;
        this.scheduleSeq = scheduleSeq;
        this.scheduleStTime = scheduleStTime;
        this.scheduleEdTime = scheduleEdTime;
        this.scheduleLongTime = scheduleLongTime;
        this.scheduleLevel = scheduleLevel;
        this.scheduleGubn = scheduleGubn;
        this.content = content;
        this.viewFlag = viewFlag;
        this.updatedBy = updatedBy;

        return this;
    }

}
