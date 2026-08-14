package com.paramount.pmx.utils;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class S3UrlHelper {

    private static String baseUrl;

    @Value("${cloud.aws.s3.url}")
    public void setBaseUrl(String url) {
        S3UrlHelper.baseUrl = url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    /**
     * photo original URL 생성
     */
    public static String getPhotoOriginalUrl(String extUrl) {
        return baseUrl + "/" + extUrl;
    }

    /**
     * photo thumb URL 생성
     */
    public static String getPhotoThumbUrl(String extUrl) {
        if (extUrl == null) {
            return null;
        }
        return baseUrl + "/" + extUrl.replace("original", "thumb");
    }


    /**
     * cover medium URL 생성
     */
    public static String getCoverMediumUrl(String extUrl) {
        return baseUrl + "/" + extUrl.replace("original", "medium");
    }

    /**
     * cover original URL 생성
     */
    public static String getCoverOriginalUrl(String extUrl) {
        return baseUrl + "/" + extUrl;
    }

    /**
     * cover small URL 생성
     */
    public static String getCoverSmallUrl(String extUrl) {
        return baseUrl + "/" + extUrl.replace("original", "medium");
    }


    /**
     * cover thumbnail URL 생성
     */
    public static String getCoverThumbUrl(String extUrl) {
        return baseUrl + "/" + extUrl.replace("original", "thumb");
    }

    /**
     * clip 파일 URL 생성
     */
    public static String getClipUrl(String extUrl) {
        return baseUrl + "/" + extUrl;
    }
}
