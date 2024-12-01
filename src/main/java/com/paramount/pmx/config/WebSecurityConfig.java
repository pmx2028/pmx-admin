package com.paramount.pmx.config;

import com.paramount.pmx.security.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.rememberme.JdbcTokenRepositoryImpl;
import org.springframework.security.web.authentication.rememberme.PersistentTokenBasedRememberMeServices;
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.security.web.session.HttpSessionEventPublisher;

import javax.sql.DataSource;

@Configuration
//@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    public static final String ROOT_PATH                   = "/";
    public static final String LOGIN_PAGE                  = ROOT_PATH + "login";           //로그인 페이지 경로
    public static final String LOGIN_PROCESS_PAGE          = ROOT_PATH + "signin";          //로그인 처리 경로
    public static final String LOGOUT_URL                  = ROOT_PATH + "logout";          //로그아웃 처리 경로
    public static final String LOGIN_SUCCESS_URL           = "/login/success";                  //로그인 성공시 이동 경로 (페이지 이동일 경우 적용. ajax 방식일 경우 로그인관련 js에서 처리)

    public static final String LOGOUT_SUCCESS_URL          = ROOT_PATH + "login?code=L01";      //로그아웃 성공시 이동 경로
    public static final String LOGIN_FAILURE_URL           = ROOT_PATH + "login?code=L01";      //로그인 실패시 이동 경로
    public static final String LOGIN_DUPLICATED_FAILURE_URL = "/error/login_duplicated_fail";   //중복로그인시 이동 경로
    public static final String SESSION_EXPIRED_URL         = ROOT_PATH + "login";               //세션 종료시 이동 경로
    public static final String SESSION_INVALIDSESSION_URL  = ROOT_PATH + "login";               //세션이 유효하지 않을 경우 이동 경로
    public static final String ACCESS_DINY_PAGE            = ROOT_PATH + "login?code=L04";      //권한이 없는 페이지 접속시 이동 경로

    public static final String USERNAME_PARAM              = "login";                       //로그인 페이지에서 ID 폼개체이름
    public static final String PASSWORD_PARAM              = "password";                    //로그인 페이지에서 PW 폼개체이름
    public static final String REMEMBERME_PARAMNAME        = "autologin";                   //로그인 페이지에서 자동로그인 폼개체이름
    public static final int    REMEMBERME_VALID_DAY        = 30;                            //자동로그인 유지 기간(일)

    //** ajax 결과값 */
    public static final String LOGIN_SUCCESS_CODE          = "S01";                         //로그인 성공시 code 값
    public static final String LOGIN_FAILURE_CODE          = "F01";                         //로그인 실패시 code 값

    @Value("${paramount.security.rememberme-cookiename}")
    private String REMEMBERME_COOKIENAME;

    @Autowired
    @Qualifier("customUserDetailsService")
    private UserDetailsService userDetailsService;

    @Autowired
    private CustomAuthenticationProvider customAuthenticationProvider;

    @Autowired
    private DataSource dataSource;


    @Autowired
    public void configure(AuthenticationManagerBuilder auth) throws Exception {
        //여러 password encoder를 접두사를 붙여서 사용
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
        auth.authenticationProvider(customAuthenticationProvider);
     }

    @Override
    public void configure(WebSecurity web)  throws Exception {
        // ======================================================================
        // static,storage 디렉터리의 하위 파일 목록은 인증 무시 ( = 항상통과 )
        web.ignoring().antMatchers("/static/**", "/storage/**");
    }


    @Override
    protected void configure(HttpSecurity http) throws Exception {

        // ======================================================================
        // 페이지 접근 권한을 설정 - 권한이 없을 경우 자동으로 login 페이지로 이동
        // ======================================================================

        // 다음페이지는 미인증 시 접근 허용
        http.authorizeRequests().antMatchers("/health", LOGIN_PAGE, LOGOUT_URL).permitAll();

        // 다음 권한을 가진자에게 접근 허용
        http.authorizeRequests()
            .antMatchers("/login/success").permitAll()
            .antMatchers("/**", "/").access("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_SUPPORT_ADMIN')")
            // .anyRequest().permitAll()
            ;
            //.anyRequest().authenticated(); //이부분을 오픈하면 모든 호출이 security영향을 받아 login 페이지로 이동한다.

        // ======================================================================
        // 세션 정책에 대한 설정
        http.sessionManagement()
            .invalidSessionUrl(SESSION_INVALIDSESSION_URL)
            .maximumSessions(1)                             //동시접속 seesion 수 (UserDetails에 해당하는 유저가 "1명" 만 접속이 가능)
            .maxSessionsPreventsLogin(false)                //이부분이 활성화되면 추가 로그인이 안된다.true일 경우 : 나중에 접속한 사용자 로그인 방지, false일 경우 : 먼저 접속한 사용자 logout 처리
            .expiredUrl(SESSION_EXPIRED_URL)                //세션 파기시 리다이렉션 경로
            .sessionRegistry(sessionRegistry())
        ;

        // ======================================================================
        // 로그인에 대한 설정
        http.authorizeRequests().and().formLogin()
            .loginPage(LOGIN_PAGE)                          //커스텀로그인 페이지 URL
            .loginProcessingUrl(LOGIN_PROCESS_PAGE)         //로그인처리 URL
            .defaultSuccessUrl(LOGIN_SUCCESS_URL)           //로그인 성공시 이동할 페이지
            .failureUrl(LOGIN_FAILURE_URL)                  //로그인 실패시 이동할 페이지
            .usernameParameter(USERNAME_PARAM)              //ID에 해당하는 input name
            .passwordParameter(PASSWORD_PARAM)              //Password에 해당하는 input name
            .failureHandler(authenticationFailureHandler()) //로그인 실패시 처리 핸들러(.defaultSuccessUrl설정 무시)
            .successHandler(authenticationSuccessHandler()) //로그인 성공시 처리 핸들러(.failureUrl 설정 무시)
        ;

        // ======================================================================
        // 로그아웃에 대한 설정
        http.logout()
            .logoutUrl(LOGOUT_URL)                          //로그아웃을 실행할 url
            .logoutSuccessUrl(LOGOUT_SUCCESS_URL)           //로그아웃이 성공할 경우 이동할 페이지
            .invalidateHttpSession(true)                    //session정보를 삭제
            .logoutSuccessHandler(logoutSuccessHandler())   //로그아웃 시 처리 핸들러(아래 Bean 참조)
            .clearAuthentication(true)                      //권한정보 제거
            .deleteCookies(REMEMBERME_COOKIENAME)           //쿠키 제거
            .permitAll()
        ;

        // ======================================================================
        // 자동로그인에 대한 설정
        http.authorizeRequests().and().rememberMe()
            .userDetailsService(userDetailsService())
            .tokenRepository(this.persistentTokenRepository())
            .rememberMeServices(getPersistentTokenBasedRememberMeServices())    // 주석처리한 설정을 service에 해야 오류가 안남.
            .authenticationSuccessHandler(authenticationSuccessHandler())
        ;

        // ======================================================================
        // 시큐리티 전반적 오류 처리에 대한 설정
        http.exceptionHandling()
            .accessDeniedPage(ACCESS_DINY_PAGE)                                         //권한이 없는 페이지 접속시 이동 페이지(.authenticationEntryPoint설정이 우선함)
            .accessDeniedHandler(accessDeniedHandler())                                 //권한이 없는 페이지 접속시 처리 핸들러(아래 Bean 참조)
            .authenticationEntryPoint(loginUrlAuthenticationEntryPoint())               //비인증 또는 인증이 파기될 경우 처리 핸들러(아래 Bean 참조)
        ;

        // ======================================================================
        // csrf 보안 정책 설정(특정 요청만 예외처리)
        http.csrf()
            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            .ignoringAntMatchers("/error", "/error/**", LOGOUT_URL, LOGIN_PROCESS_PAGE)                                             //csrf인증을 무시하는 URL
            // .ignoringAntMatchers("/error", "/error/**", "/", "/article/**","/categories/**", LOGOUT_URL)                         //csrf인증을 무시하는 URL
            //.ignoringRequestMatchers()
            //.ignoringAntMatchers("/error", "/error/**", LOGIN_PAGE, LOGIN_PROCESS_PAGE, LOGOUT_URL)    //csrf인증을 무시하는 URL(?이상하게 LOGIN_PROCESS_PAGE를 안 넣으면 오류가 나네)
            // .disable(); // 폼전송시 자동으로 csrf토큰을 넘기는 기능을 해제
            ;

        // ======================================================================
        // frame header 설정
        http.headers()
            .frameOptions()
            .sameOrigin();
    }

    // ======================================================================
    // 비밀번호 암호화에 사용할 encoder 설정
    @Bean
    public PasswordEncoder passwordEncoder() {
        DelegatingPasswordEncoder delegatingPasswordEncoder =
        (DelegatingPasswordEncoder) PasswordEncoderFactories.createDelegatingPasswordEncoder();
        delegatingPasswordEncoder.setDefaultPasswordEncoderForMatches(new BCryptPasswordEncoder());
        return delegatingPasswordEncoder;
    }

    // ======================================================================
    // 비밀번호 암호화에 사용할 encoder 설정(bCrypt사용)
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ======================================================================
    // 비밀번호 암호화에 사용할 encoder 설정(SHA-1사용)
    @Bean
    public Sha1PasswordEncoder sha1PasswordEncoder() {
        return new Sha1PasswordEncoder();
    }

    // ======================================================================
    // 자동로그인 정보 저장용 보관소 설정(DB사용)
    @Bean
    public PersistentTokenRepository persistentTokenRepository() {
        JdbcTokenRepositoryImpl db = new JdbcTokenRepositoryImpl();
        db.setDataSource(dataSource);
        return db;
    }

    // ======================================================================
    // 자동로그인 정보 서비스 설정(Token기반)
    @Bean
    public PersistentTokenBasedRememberMeServices getPersistentTokenBasedRememberMeServices() {
        PersistentTokenBasedRememberMeServices persistenceTokenBasedservice = new PersistentTokenBasedRememberMeServices("uniqueRememberMeTokenSecretKey", userDetailsService, persistentTokenRepository());
        persistenceTokenBasedservice.setParameter(REMEMBERME_PARAMNAME);         // 자동로그인 checkbox 폼개체 이름
        persistenceTokenBasedservice.setCookieName(REMEMBERME_COOKIENAME);       // 자동로그인 정보 저장 쿠키 이름
        persistenceTokenBasedservice.setTokenValiditySeconds(7 * 24 * 60 * 60);  // 자동로그인 사용 기간 설정 7d, 설정안하면 2주(변수를 넣으면 안먹음)
        persistenceTokenBasedservice.setAlwaysRemember(false);                   // 자동로그인 영속 사용 여부(기간제한)
        return persistenceTokenBasedservice;
    }

    // ======================================================================
    // 인증정보를 호출할 수 있도록 등록(필수적으로 빈으로 등록해야 함)
    @Bean
    @Override
     public AuthenticationManager authenticationManagerBean() throws Exception {
          return super.authenticationManagerBean();
    }

    // ======================================================================
    // 자동로그인시 시 처리 핸들러 (세부코드는 security폴더 참조)
    //      [기본] 접속 URL로 리다이렉트
    //      [변경] 로그 출력 추가 안함
    @Bean
    public CustomRememberMeAuthenticationSuccessHandler rememberMeAuthenticationSuccessHandler() {
        return new CustomRememberMeAuthenticationSuccessHandler();
    }

    // ======================================================================
    // 로그인 성공 시 처리 핸들러 (세부코드는 security폴더 참조)
    //      [기본] LOGIN_SUCCESS_URL로 리다이렉트
    //      [변경] 로그 출력 추가
    @Bean
    public CustomAuthenticationSuccessHandler authenticationSuccessHandler() {
        return new CustomAuthenticationSuccessHandler();
    }

    // ======================================================================
    // 로그인 실패 시 처리 핸들러 (세부코드는 security폴더 참조)
    //      [기본] LOGIN_FAILURE_URL로 리다이렉트
    //      [변경] 로그 출력 추가
    @Bean
    public CustomAuthenticationFailureHandler authenticationFailureHandler() {
        return new CustomAuthenticationFailureHandler();
    }

    // ======================================================================
    // 로그아웃 시 처리 핸들러 (세부코드는 security폴더 참조)
    //      [기본] LOGOUT_SUCCESS_URL로 리다이렉트
    //      [변경] 로그 출력 추가
    @Bean
    public CustomLogoutSuccessHandler logoutSuccessHandler(){
        return new CustomLogoutSuccessHandler();
    }

    // ======================================================================
    // 권한이 없는 페이지 접근 시 처리 핸들러 (세부코드는 security폴더 참조)
    //      [기본] ACCESS_DINY_PAGE로 리다이렉트
    //      [변경] AJAX호출의 경우 403 JSON 리턴, HTML호출의 경우 ACCESS_DINY_PAGE로 리다이렉트, 로그 출력 추가
    @Bean
    public CustomAccessDeniedHandler accessDeniedHandler(){
        return new CustomAccessDeniedHandler();
    }

    // ======================================================================
    // 인증이 되지 않았을 경우 처리 핸들러 (세부코드는 security폴더 참조)
    //      [기본] LOGIN_PAGE로 리다이렉트
    //      [변경] AJAX호출의 경우 401 JSON 리턴, HTML호출의 경우 LOGIN_PAGE로 리다이렉트, 로그 출력 추가
    @Bean
    public CustomLoginUrlAuthenticationEntryPoint loginUrlAuthenticationEntryPoint(){
        return new CustomLoginUrlAuthenticationEntryPoint(LOGIN_PAGE);
    }

    // ======================================================================
    // logout 후 login할 때 정상동작을 위함
    @Bean
    public SessionRegistry sessionRegistry() {
        SessionRegistry sessionRegistry = new SessionRegistryImpl();
        return sessionRegistry;
    }

    // logout시 session 정보 삭제.
    // invalidateHttpSession(true)로 정상작동 되지 않을 수 있어 적용.
    @Bean
    public static ServletListenerRegistrationBean<HttpSessionEventPublisher> httpSessionEventPublisher() {
        return new ServletListenerRegistrationBean<HttpSessionEventPublisher>(new HttpSessionEventPublisher());
    }

    // ======================================================================
    // HttpFirewall 인터페이스
    // strictHttpFirewall 은 HttpFirewall의 더 엄격한 기본 구현
    // URI의 일부로 세미콜론을 허용
    // URI의 일부로 % 허용
    // URI의 일부로 // 더블슬러시 허용
    @Bean
    public HttpFirewall customHttpFirewall() {
        // return new DefaultHttpFirewall(); //DefaultHttpFirewall :: 전체허용으로 권장하지 않음.
        StrictHttpFirewall strictHttpFirewall = new StrictHttpFirewall();
        strictHttpFirewall.setAllowSemicolon(true);
        strictHttpFirewall.setAllowUrlEncodedPercent(true);
        // strictHttpFirewall.setAllowBackSlash(true);
        strictHttpFirewall.setAllowUrlEncodedDoubleSlash(true);
        return strictHttpFirewall;
    }

    // @Bean
    // public RegisterSessionAuthenticationStrategy registerSessionAuthStr() {
    //     return new RegisterSessionAuthenticationStrategy( sessionRegistry() );
    // }

    // @Bean
    // public ConcurrentSessionControlAuthenticationStrategy concurrentSessionControlAuthenticationStrategy() {

    //     ConcurrentSessionControlAuthenticationStrategy strategy = new ConcurrentSessionControlAuthenticationStrategy(sessionRegistry());
    //     strategy.setExceptionIfMaximumExceeded(true);
    //     //strategy.setMessageSource(messageSource);

    //     return strategy;
    // }

}
