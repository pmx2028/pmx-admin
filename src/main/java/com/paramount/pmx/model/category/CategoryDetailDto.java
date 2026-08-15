package com.paramount.pmx.model.category;

import com.paramount.pmx.utils.S3UrlHelper;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryDetailDto {

    private Long id;
    private Integer price;
    private String description;
    private String usageInfo;
    private Long coverId;
    private String coverImageUrl;
    private String coverImageTitle;
    private Long coverId1;
    private String coverImageUrl1;
    private String coverImageTitle1;
    private String createdAt;
    private String updatedAt;

    public static CategoryDetailDto from(CategoryDetail entity) {
        return CategoryDetailDto.builder()
                .id(entity.getId())
                .price(entity.getPrice())
                .description(entity.getDescription())
                .usageInfo(entity.getUsageInfo())
                .createdAt(entity.getCreatedAt().toLocalDate().toString()+ " " + entity.getCreatedAt().toLocalTime().toString())
                .updatedAt(entity.getUpdatedAt().toLocalDate().toString()+ " " + entity.getUpdatedAt().toLocalTime().toString())
                .build();
    }
    public static CategoryDetailDto toDetailDto(CategoryDetail entity){
        String coverImageUrl = "";
        String coverImageTitle = "";
        String coverImageUrl1 = "";
        String coverImageTitle1 = "";
        if (entity.getCover() != null) {
            coverImageUrl = S3UrlHelper.getCoverThumbUrl(entity.getCover().getExtUrl());
            coverImageTitle = entity.getCover().getOriginalFilename();
        }

        if (entity.getCover1() != null) {
            coverImageUrl1 = S3UrlHelper.getCoverThumbUrl(entity.getCover1().getExtUrl());
            coverImageTitle1 = entity.getCover1().getOriginalFilename();
        }


        return CategoryDetailDto.builder()
                .id(entity.getId())
                .price(entity.getPrice())
                .description(entity.getDescription())
                .usageInfo(entity.getUsageInfo())
                .coverId(entity.getCoverId())
                .coverImageUrl(coverImageUrl)
                .coverImageTitle(coverImageTitle)
                .coverId1(entity.getCoverId1())
                .coverImageUrl1(coverImageUrl1)
                .coverImageTitle1(coverImageTitle1)
                .createdAt(entity.getCreatedAt().toLocalDate().toString()+ " " + entity.getCreatedAt().toLocalTime().toString())
                .updatedAt(entity.getUpdatedAt().toLocalDate().toString()+ " " + entity.getUpdatedAt().toLocalTime().toString())
                .build();

    }
}
