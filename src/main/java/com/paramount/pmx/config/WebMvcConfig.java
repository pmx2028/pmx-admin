package com.paramount.pmx.config;


import com.paramount.pmx.interceptor.CustomInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.format.datetime.standard.DateTimeFormatterRegistrar;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${paramount.security.rememberme-cookiename}")
    private String remembermeCookiename;


    @Override 
    public void addInterceptors(InterceptorRegistry registry) {
        //인증적용
		registry.addInterceptor(customInterceptor())
            .addPathPatterns("/**") // 적용경로
            .excludePathPatterns("/static/**", "/storage/**", "/css/**", "/data/**", "/font/**",  "/images/**", "/js/**" ,  "/vendor/**"); // 제외경로
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**").addResourceLocations("classpath:static/");
        registry.addResourceHandler("/storage/**").addResourceLocations("classpath:storage/");
        registry.addResourceHandler("/css/**").addResourceLocations("classpath:static/css/");
        registry.addResourceHandler("/data/**").addResourceLocations("classpath:static/data/");
        registry.addResourceHandler("/data/**").addResourceLocations("classpath:static/font/");
        registry.addResourceHandler("/images/**").addResourceLocations("classpath:static/images/");
        registry.addResourceHandler("/js/**").addResourceLocations("classpath:static/js/");
        registry.addResourceHandler("/vendor/**").addResourceLocations("classpath:static/vendor/");
    }

    
    public CustomInterceptor customInterceptor(){

        // freemarker에서 사용할 property들을 설정한다.
        Map<String,String> interceptorConfig = new HashMap<>();
        interceptorConfig.put("remembermeCookiename", remembermeCookiename);
        
        return new CustomInterceptor(interceptorConfig);
    }

    //파라메터로 날짜값을 받을 경우 오류발생. 포맷수정 메소드
    @Override
    public void addFormatters(FormatterRegistry registry) {
        DateTimeFormatterRegistrar registrar = new DateTimeFormatterRegistrar();
        registrar.setUseIsoFormat(true);
        registrar.registerFormatters(registry);
    }
}