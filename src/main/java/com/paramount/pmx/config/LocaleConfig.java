package com.paramount.pmx.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;

@Configuration
public class LocaleConfig implements WebMvcConfigurer  {

    @Value("${spring.messages.basename}")
    String messagesBasename;

    @Value("${spring.messages.encoding}")
    String messagesEncoding;

    @Value("${spring.messages.cache-duration}")
    int messagesCacheSeconds;

    @Bean
    public ReloadableResourceBundleMessageSource messageSource() {
        ReloadableResourceBundleMessageSource source = new ReloadableResourceBundleMessageSource();
        source.setBasename(messagesBasename);
        source.setDefaultEncoding(messagesEncoding);
        source.setCacheSeconds(messagesCacheSeconds);
        source.setUseCodeAsDefaultMessage(true); // 없는 메세지일 경우 예외를 발생시키는 대신 코드를 기본 메세지로 한다.
        return source;
    }

    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        // interceptor.setParamName("lang");
        return interceptor;
    }

    @Bean
    public MessageSourceAccessor getMessageSourceAccessor(){
       ReloadableResourceBundleMessageSource m = messageSource();
       return new MessageSourceAccessor(m);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor()).addPathPatterns("/**");
    }
}
