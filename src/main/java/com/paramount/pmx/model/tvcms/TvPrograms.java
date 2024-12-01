package com.paramount.pmx.model.tvcms;


import jdk.jfr.Description;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;


@Description("TV프로그램")
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "TV_PROGRAMS")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@ToString(exclude = {})
@EqualsAndHashCode(of = {"id"})
public class TvPrograms implements Serializable {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "MAJOR_FLAG")
    private String majorFlag;

    @Column(name = "PROGRAM_LEVEL")
    private String programLevel;

    @Column(name = "PROGRAM_NAME")
    private String programName;

    @Column(name = "BROAD_START_DT")
    private String broadStartDt;

    @Column(name = "BROAD_TIME")
    private String broadTime;

    @Column(name = "CONTENT")
    private String content;

    @Column(name = "DIRECTOR")
    private String director;

    @Column(name = "ASSISTANT_DIRECTOR")
    private String assistantDirector;

    @Column(name = "AUTHOR")
    private String author;

    @Column(name = "PROGRAM_HOST")
    private String programHost;

    @Column(name = "CONTENT_ETC")
    private String contentEtc;

    @Column(name = "FILE_NAME")
    private String fileName;

    @Column(name = "SAVE_FILE_NAME")
    private String saveFileName;

    @Column(name = "FILE_PAHT")
    private String filePath;

    @Column(name = "SEQ")
    private Long seq;

    @Column(name = "VIEW_FLAG")
    private String viewFlag;

    @Column(name = "BROAD_FLAG")
    private String broadFlag;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @Column(name = "UPDATED_BY")
    private Long updatedBy;

    @Column(name = "CREATED_AT" , updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @PostLoad
    public void PostLoad(){
//        if (this.hashkey != null){
//            this.photoThumbUrl = "photos/"+this.hashkey + "/" + ((this.extUrl).split("\\.").length == 1 ? "medium" : "medium."+(this.extUrl).split("\\.")[(this.extUrl).split("\\.").length-1]);
//            this.forumGalleryThumbUrl = "photos/"+this.hashkey + "/" + ((this.extUrl).split("\\.").length == 1 ? "thumb" : "thumb."+(this.extUrl).split("\\.")[(this.extUrl).split("\\.").length-1]);
//        }

    }


    //데이터 추가 메소드
    @Builder
    public TvPrograms (
            String majorFlag,
            String programLevel,
            String programName,
            String broadStartDt,
            String broadTime,
            String content,
            String director,
            String assistantDirector,
            String author,
            String programHost,
            String contentEtc,
            String fileName,
            String saveFileName,
            String filePath,
            Long seq,
            String viewFlag,
            String broadFlag,
            Long createdBy
    ){
        this.majorFlag = majorFlag;
        this.programLevel = programLevel;
        this.programName = programName;
        this.broadStartDt = broadStartDt;
        this.broadTime = broadTime;
        this.content = content;
        this.director = director;
        this.assistantDirector = assistantDirector;
        this.author = author;
        this.programHost = programHost;
        this.contentEtc = contentEtc;
        this.fileName = fileName;
        this.saveFileName = saveFileName;
        this.filePath = filePath;
        this.seq = seq;
        this.viewFlag = viewFlag;
        this.broadFlag = broadFlag;
        this.createdBy = createdBy;
    }

    //데이터 수정 메소드
    public TvPrograms updateTvPrograms (
            String majorFlag,
            String programLevel,
            String programName,
            String broadStartDt,
            String broadTime,
            String content,
            String director,
            String assistantDirector,
            String author,
            String programHost,
            String contentEtc,
            String fileName,
            String saveFileName,
            String filePath,
            Long seq,
            String viewFlag,
            String broadFlag,
            Long updatedBy
    ) {

        this.majorFlag = majorFlag;
        this.programLevel = programLevel;
        this.programName = programName;
        this.broadStartDt = broadStartDt;
        this.broadTime = broadTime;
        this.content = content;
        this.director = director;
        this.assistantDirector = assistantDirector;
        this.author = author;
        this.programHost = programHost;
        this.contentEtc = contentEtc;
        this.fileName = fileName;
        this.saveFileName = saveFileName;
        this.filePath = filePath;
        this.seq = seq;
        this.viewFlag = viewFlag;
        this.broadFlag = broadFlag;
        this.updatedBy = updatedBy;
        return this;
    }

}
