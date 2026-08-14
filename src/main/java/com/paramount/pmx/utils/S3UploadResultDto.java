package com.paramount.pmx.utils;

import lombok.Builder;

@Builder
public record S3UploadResultDto(
        String hashkey,
        String originalFilename,
        String filename,
        String contentType,
        String ext,
        String originalKey,
        String thumbKey,
        String mediumKey,
        String smallKey,
        String filesizeJson,
        String dimensionsJson,
        String detailsJson,
        String colorsJson
) {}

