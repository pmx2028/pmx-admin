package com.paramount.pmx;

import java.time.LocalDateTime;
import java.util.TimeZone;

import javax.annotation.PostConstruct;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchRepositoriesAutoConfiguration;
// import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.aws.autoconfigure.context.ContextInstanceDataAutoConfiguration;
import org.springframework.context.annotation.PropertySource;

@SpringBootApplication(exclude = {ElasticsearchRepositoriesAutoConfiguration.class})
// @EnableCaching
//사용자 정의 properties
//공통항목 정의
@PropertySource(value="classpath:config.properties", encoding="UTF-8")
@EnableAutoConfiguration(exclude = {ContextInstanceDataAutoConfiguration.class})
public class PmxApplication {

    //timezone 설정 (Korea)
    @PostConstruct
    public void started(){
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
    }

	public static void main(String[] args) {
		SpringApplication.run(PmxApplication.class, args);
        System.out.println("현재시각 : " + LocalDateTime.now());
        System.out.println("String boot Start.......................");
	}

}
