package com.paramount.pmx.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "hecto")
public record HectoProperties(
        String mid,
        String encryptionKey,
        String hashKey,
        String hectoUrl
) {
}