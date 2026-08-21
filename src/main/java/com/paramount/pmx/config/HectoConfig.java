package com.paramount.pmx.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(HectoProperties.class)
public class HectoConfig {
}