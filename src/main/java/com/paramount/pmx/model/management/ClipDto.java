package com.paramount.pmx.model.management;


import com.paramount.pmx.utils.S3UrlHelper;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClipDto {
    private Long id;
    private String hashkey;
    private String title;
    private String url;
    private String fileKey;
    private String size;

    public static ClipDto from(Clip clip) {

        return ClipDto.builder()
                .id(clip.getId())
                .hashkey(clip.getHashkey())
                .title(clip.getOriginalFilename())
                .url(S3UrlHelper.getClipUrl(clip.getExtUrl()))
                .fileKey(clip.getExtUrl())
                .size(clip.getFilesize())
                .build();
    }
}
