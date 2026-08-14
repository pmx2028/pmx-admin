package com.paramount.pmx.model.photo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CoverDto {
    private Long id;
    private Long userId;
    private String fileName;
    private String hashkey;
    private String originalUrl;
    private String thumbUrl;
    private String mediumUrl;
    private String smallUrl;
    private String title;
    private String url;

    public static CoverDto toCoverDto(Cover cover , String  S3HOST) {
        String originalUrl = getUrl(cover.getExtUrl() , "original" , S3HOST);
        String thumbUrl = getUrl(cover.getExtUrl() , "thumb" , S3HOST);
        String mediumUrl = getUrl(cover.getExtUrl() , "medium" , S3HOST);

        CoverDto coverDto = CoverDto.builder()
                .id(cover.getId())
                .originalUrl(originalUrl)
                .thumbUrl(thumbUrl)
                .mediumUrl(mediumUrl)
                .hashkey(cover.getHashkey())
                .build();
        return coverDto;
    }

    public static String getUrl(String extUrl, String style, String S3HOST) {
        String path = (extUrl == null) ? "" : extUrl;
        // Ruby gsub(/\/original\./, "/{style}.")
        // Replace the FIRST occurrence of "/original." with "/{style}."
        String replaced = path.replaceFirst("/original\\.", "/" + style + ".");
        return S3HOST + "/" + replaced;
    }
}
