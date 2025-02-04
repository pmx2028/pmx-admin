package com.paramount.pmx.model.tvcms;


import com.paramount.pmx.model.setting.KrxesDto;
import lombok.*;
import lombok.experimental.Accessors;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Description;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.stereotype.Component;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Component
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@ToString
@Accessors(chain = true)
public class TvVodsDto implements Serializable {

    private Long id;
    private Long programId;
    private String programName;
    private String vodName;
    private String youtubeUrl;
    private String krxeName;
    private String fileName;
    private String fileUrl;
    private String saveFileName;
    private String filePath;
    private String viewFlag;
    private String useFlag;
    private Long hitsCount;
    private Long createdBy;
    private Long updatedBy;
    private String createdAt;
    private String updatedAt;
    private String veiwdateAt;

    private String vodKrxIds;
    private String createdName;

    private List<KrxesDto> krxesDtoList;

    private static String S3HOST;                       //S3URL
    @Value("${cloud.aws.s3.url}")
    public void setS3HOST(String S3HOST){
        TvVodsDto.S3HOST = S3HOST;
    }


    //목록, 상세정보
    public static TvVodsDto toDto(TvVods tvVods) {
        return TvVodsDto.builder()
                .id(tvVods.getId())
                .programId(tvVods.getProgramId()== null ? null : tvVods.getProgramId())
                .programName(tvVods.getProgramName()== null ? null : tvVods.getProgramName())
                .vodName(tvVods.getVodName()== null ? null : tvVods.getVodName().trim())
                .youtubeUrl(tvVods.getYoutubeUrl()== null ? null : tvVods.getYoutubeUrl().trim())
                .krxeName(getVodKrxeName(tvVods))
                .fileName(tvVods.getFileName()== null ? null : tvVods.getFileName().trim())
                .saveFileName(tvVods.getSaveFileName()== null ? null : tvVods.getSaveFileName().trim())
                .filePath(tvVods.getFilePath()== null ? null : tvVods.getFilePath().trim())
                .fileUrl( getfileUrl(tvVods.getYoutubeUrl() , tvVods.getFilePath() ,tvVods.getSaveFileName()))
                .viewFlag(tvVods.getViewFlag())
                .useFlag(tvVods.getUseFlag())
                .hitsCount(tvVods.getHitsCount())
                .createdBy(tvVods.getCreatedBy())
                .updatedBy(tvVods.getUpdatedBy())
                .createdAt(tvVods.getCreatedAt().toLocalDate().toString()+ " " + tvVods.getCreatedAt().toLocalTime().toString())
                .updatedAt(tvVods.getUpdatedAt().toLocalDate().toString()+ " " + tvVods.getUpdatedAt().toLocalTime().toString())
                .veiwdateAt(tvVods.getUpdatedAt() == null ? tvVods.getCreatedAt().toLocalDate().toString() : tvVods.getUpdatedAt().toLocalDate().toString())
                .vodKrxIds(getVodKrxeIds(tvVods))
                .krxesDtoList( //대표주관정보
                        tvVods.getTvVodKrxesList().stream()
                                .map(r -> KrxesDto.builder()
                                .id(r.getKrxes().getId())
                                .name(r.getKrxes().getName())
                                .code(r.getKrxes().getCode())
                                .kindof(r.getKrxes().getKindof())
                                .build()
                                ).collect(Collectors.toList())
                )
                .createdName(tvVods.getUsers().getName())
                .build();
    }

    /** 이미지 세팅 */
    public static String getfileUrl(String youtubeUrl , String fielPath , String saveFileName  ){
        String fileUrl = "";
        if (StringUtils.isNotBlank(youtubeUrl)) {
            if (StringUtils.isNotBlank(fielPath) &&  StringUtils.isNotBlank(saveFileName) ){
                fileUrl = S3HOST + fielPath + "/" + saveFileName;
            } else {
                if (! StringUtils.isBlank(youtubeUrl) && youtubeUrl.indexOf("?v=") > 0) {
                    String videoId = youtubeUrl.substring(youtubeUrl.indexOf("?v=") + 3);
                    fileUrl = "https://i.ytimg.com/vi/"+videoId+"/mqdefault.jpg";
                    //fileUrl =  "https://i.ytimg.com/vi/"+videoId+"/hqdefault.jpg";
                    //tBaseDetailDto.setId(videoId);
                    //tBaseDetailDtoList.add(tBaseDetailDto);
                }
            }
        }
        return fileUrl;
    }
    public static String getVodKrxeIds(TvVods tvVods) {
        ArrayList<String> strArr = new ArrayList<>();
        tvVods.getTvVodKrxesList().stream().forEach(e -> {
            strArr.add(e.getKrxes().getId().toString());
        });
        return StringUtils.join(strArr , ',');

    }
    public static String getVodKrxeName(TvVods tvVods) {
        ArrayList<String> strArr = new ArrayList<>();
        tvVods.getTvVodKrxesList().stream().forEach(e -> {
            strArr.add(e.getKrxes().getName());
        });
        return StringUtils.join(strArr , ',');
    }

}
