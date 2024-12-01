package com.paramount.pmx.model.tvcms;


import lombok.*;
import lombok.experimental.Accessors;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Component
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@ToString
@Accessors(chain = true)
public class TvProgramsDto implements Serializable {



    private Long id;
    private String majorFlag;
    private String programLevel;
    private String programName;
    private String broadStartDt;
    private String broadTime;
    private String content;
    private String director;
    private String assistantDirector;
    private String author;
    private String programHost;
    private String contentEtc;
    private String fileName;
    private String saveFileName;
    private String filePath;
    private String fileUrl;
    private Long seq;
    private String viewFlag;
    private String viewFlagNm;
    private String broadFlag;
    private String broadFlagNm;
    private Long createdBy;
    private Long updatedBy;
    private String createdAt;
    private String updatedAt;

    private String programLevelNm;
    private String veiwdateAt;



    private static String S3HOST;                       //S3URL
    @Value("${cloud.aws.s3.url}")
    public void setS3HOST(String S3HOST){
        TvProgramsDto.S3HOST = S3HOST;
    }

    //목록, 상세정보
    public static TvProgramsDto toDto(TvPrograms tvPrograms){
        return TvProgramsDto.builder()
                .id(tvPrograms.getId())
                .majorFlag(tvPrograms.getMajorFlag())
                .programLevel(tvPrograms.getProgramLevel()== null ? "" : tvPrograms.getProgramLevel().trim())
                .programLevelNm(getLevelNm(tvPrograms.getProgramLevel()))
                .programName(tvPrograms.getProgramName()== null ? "" : tvPrograms.getProgramName().trim())
                .broadStartDt(tvPrograms.getBroadStartDt()== null ? "" : tvPrograms.getBroadStartDt().trim())
                .broadTime(tvPrograms.getBroadTime()== null ? "" : tvPrograms.getBroadTime().trim())
                .content(tvPrograms.getContent()== null ? "" : tvPrograms.getContent().trim())
                .director(tvPrograms.getDirector()== null ? "" : tvPrograms.getDirector().trim())
                .assistantDirector(tvPrograms.getAssistantDirector()== null ? "" : tvPrograms.getAssistantDirector().trim())
                .author(tvPrograms.getAuthor()== null ? "" : tvPrograms.getAuthor().trim())
                .programHost(tvPrograms.getProgramHost()== null ? "" : tvPrograms.getProgramHost().trim())
                .contentEtc(tvPrograms.getContentEtc()== null ? "" : tvPrograms.getContentEtc().trim())
                .fileName(tvPrograms.getFileName()== null ? "" : tvPrograms.getFileName().trim())
                .saveFileName(tvPrograms.getSaveFileName()== null ? "" : tvPrograms.getSaveFileName().trim())
                .filePath(tvPrograms.getFilePath()== null ? "" : tvPrograms.getFilePath().trim())
                .fileUrl( StringUtils.isNotBlank(tvPrograms.getFilePath()) &&  StringUtils.isNotBlank(tvPrograms.getSaveFileName()) ?  S3HOST + tvPrograms.getFilePath() + "/" + tvPrograms.getSaveFileName() : null)
                .seq(tvPrograms.getSeq())
                .viewFlag(tvPrograms.getViewFlag())
                .viewFlagNm( "1".equals(tvPrograms.getViewFlag())  ? "공개"  : "비공개")
                .broadFlag(tvPrograms.getBroadFlag())
                .broadFlagNm("1".equals(tvPrograms.getBroadFlag())  ? "방송중"  : "종영")
                .createdBy(tvPrograms.getCreatedBy())
                .updatedBy(tvPrograms.getUpdatedBy())
                .createdAt(tvPrograms.getCreatedAt().toLocalDate().toString()+ " " + tvPrograms.getCreatedAt().toLocalTime().toString())
                .updatedAt(tvPrograms.getUpdatedAt().toLocalDate().toString()+ " " + tvPrograms.getUpdatedAt().toLocalTime().toString())
                .veiwdateAt(tvPrograms.getUpdatedAt() == null ? tvPrograms.getCreatedAt().toLocalDate().toString() : tvPrograms.getUpdatedAt().toLocalDate().toString())
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
    /**
    public static String getFileUrl(String filePath , String fileName  ){
        //시청등급 0: 전체 , 1: 7세이상관람가, 2: 12세이상관람가, 3:15세이상관람가 , 4 : 청소년관람불가
        String fileUrl = "";
        if (StringUtils.isNotBlank(filePath) &&  StringUtils.isNotBlank(filePath)) {
            fileUrl = S3HOST + filePath + "/" + fileName;
        }
        return fileUrl;
    }
     */
}
