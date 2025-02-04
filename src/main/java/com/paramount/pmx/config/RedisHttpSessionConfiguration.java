package com.paramount.pmx.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.session.data.redis.config.ConfigureRedisAction;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.session.web.context.AbstractHttpSessionApplicationInitializer;

@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds=60*60*12) //1시간(60*60), 1일 (60*60*24)
public class RedisHttpSessionConfiguration extends AbstractHttpSessionApplicationInitializer {

    // public void RedisHttpSessionConfiguration(){
    //     super(RedisHttpSessionConfiguration.class);
    // }

    @Value("${spring.redis.host}")
    private String redisHost;
    @Value("${spring.redis.port}")
    private int redisPort;
    @Value("${spring.redis.password}")
    private String redisPwd;

    @Autowired
    private ObjectMapper mapper;

    /*
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.registerModules(new JavaTimeModule(), new Jdk8Module());
        return mapper;
    }
    */

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        // 서버 환경 설정
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration(redisHost, redisPort);
        //redisStandaloneConfiguration.setPassword(redisPwd);
        redisStandaloneConfiguration.setPassword(redisPwd.isEmpty() ? RedisPassword.none() : RedisPassword.of(redisPwd));

        // redis 서버와 연결 수행 객체
        LettuceConnectionFactory lettuceConnectionFactory = new LettuceConnectionFactory(redisStandaloneConfiguration);
        return lettuceConnectionFactory;
        //return new LettuceConnectionFactory(redisStandaloneConfiguration);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(){
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory());
        redisTemplate.setEnableTransactionSupport(true);
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new GenericJackson2JsonRedisSerializer(mapper));
        redisTemplate.afterPropertiesSet();

        // System.out.println("_________________ redisTemplate ___________________");
        // System.out.println("getClientList : "+redisTemplate.getClientList().toString());
        // System.out.println("getConnectionFactory : "+redisTemplate.getConnectionFactory().toString());
        // System.out.println("getHashValueSerializer : "+redisTemplate.getHashValueSerializer().toString());
        // System.out.println("getKeySerializer : "+redisTemplate.getKeySerializer().toString());
        // System.out.println("getStringSerializer : "+redisTemplate.getStringSerializer().toString());
        // System.out.println("getValueSerializer : "+redisTemplate.getValueSerializer().toString());
        // System.out.println("_________________ /redisTemplate __________________");

        return redisTemplate;
    }

    @Bean
    public ConfigureRedisAction configureRedisAction() {
        return ConfigureRedisAction.NO_OP;
    }
}
