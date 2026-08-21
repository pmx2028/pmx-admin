package com.paramount.pmx.config;

import com.paramount.pmx.model.enums.AuthorityCode;
import com.paramount.pmx.repository.user.PersistentLoginsRepository;
import com.paramount.pmx.security.*;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.rememberme.PersistentTokenBasedRememberMeServices;
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;

import javax.sql.DataSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity       // @PreAuthorize 등 사용 시
public class SecurityConfig {

    /* ======== 경로/파라미터 상수 ======== */
    public static final String ROOT_PATH   = "/";
    public static final String LOGIN_PAGE  = ROOT_PATH + "login";
    public static final String SIGNIN_URL  = ROOT_PATH + "signin";
    public static final String LOGOUT_URL  = ROOT_PATH + "logout";

    public static final String LOGIN_SUCCESS_URL   = "/login/success";
    public static final String LOGOUT_SUCCESS_URL  = ROOT_PATH + "login?code=L01";
    public static final String LOGIN_FAILURE_URL   = ROOT_PATH + "login?code=L01";

    public static final String SESSION_EXPIRED_URL        = ROOT_PATH + "login?code=L02";
    public static final String SESSION_INVALIDSESSION_URL = ROOT_PATH + "login?code=L02";
    public static final String ACCESS_DENIED_PAGE         = ROOT_PATH + "login?code=L04";

    public static final String USERNAME_PARAM    = "login";
    public static final String PASSWORD_PARAM    = "password";
    public static final String REMEMBERME_PARAM  = "autologin";

    //** ajax 결과값 */
    public static final String LOGIN_SUCCESS_CODE          = "S01";                         //로그인 성공시 code 값
    public static final String LOGIN_FAILURE_CODE          = "F01";                         //로그인 실패시 code 값

    @Value("${paramount.security.rememberme-cookiename}")
    private String rememberMeCookie;

    @Value("${paramount.security.rememberme-key}")
    private String rememberMeKey;

    @Value("${paramount.security.rememberme-validity-days:7}")
    private int rememberMeValidityDays;

    @Value("${paramount.security.rememberme-enabled:false}")
    private boolean rememberMeEnabled;

    @Value("${paramount.security.rememberme-table:persistent_logins_pmx}")
    private String rememberMeTable;


    @Value("${server.servlet.session.cookie.secure:false}")
    private boolean secureCookie;

    @Value("${server.servlet.session.cookie.name:JSESSIONID_PMX}")
    private String sessionCookie;

    /* ======== 주입 ======== */
    private final UserDetailsService userDetailsService;
    private final AuthenticationProvider customAuthProvider;
    private final DataSource dataSource;


    public SecurityConfig(
            @Qualifier("customUserDetailsService") UserDetailsService userDetailsService,
            CustomAuthenticationProvider customAuthProvider,
            DataSource dataSource) {
        this.userDetailsService = userDetailsService;
        this.customAuthProvider = customAuthProvider;
        this.dataSource = dataSource;

    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.httpFirewall(customHttpFirewall());
    }

    /* -----------------------------------------------------------------------
     * 5) SecurityFilterChain – 기존 configure(HttpSecurity) 대체
     * --------------------------------------------------------------------- */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           CustomAuthenticationSuccessHandler authenticationSuccessHandler,
                                           CustomRememberMeAuthenticationSuccessHandler rememberMeAuthenticationSuccessHandler,
                                           CustomLogoutSuccessHandler logoutSuccessHandler) throws Exception {

        http
                // (1) Provider 등록
                .authenticationProvider(customAuthProvider);

        /* 5-1. 정적 자원 무시(web.ignoring) ⇒ antMatchers("/static/**") 대신 아래처럼: */
        http.securityMatcher("/**")                        // 전체 URL
                .authorizeHttpRequests(auth -> auth
                        /* 공개 리소스 */
                        .requestMatchers("/css/**", "/data/**", "/fonts/**",  "/images/**", "/js/**" , "/vendor/**" , "/storage/**", "/health", "/error", "/error/**").permitAll()
                        .requestMatchers(LOGIN_PAGE, LOGOUT_URL, LOGIN_SUCCESS_URL).permitAll()
                        .requestMatchers("/actuator/prometheus").permitAll()
                        // 헥토파이낸셜 결제서버 → 가맹점 서버 결과통보(notiUrl). PG 서버가 세션/CSRF 토큰 없이 직접 호출한다.
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/pay/hecto/notify").permitAll()

                        /* 화면(HTML) 라우트 권한 */
                        // 홈
                        .requestMatchers(
                                "/index"
                        ).authenticated()
//                        // 관리 - 기타 (
//                        .requestMatchers(
//                                "/manage/ombudsmen/**",    // 옴부즈만
//                                "/manage/histories/**",    // 연혁관리
//                                "/manage/posts/**",        // 푸터관리
//                                "/manage/charts/**",       // 인포그래픽관리
//                                "/manage/quick-link/**",   // 퀵링크관리
//                                "/manage/auth/**"          // 권한관리
//                        ).hasAuthority(AuthorityCode.ETC_PAGE_VIEW.name())
                                // 게시
                        .requestMatchers("/board","/board/**").hasAuthority(AuthorityCode.NOTICE_PAGE_VIEW.name()) // 공지사항 제외한 나머지 (기사 읽기 권한이 있으면 접근가능하다고 가정)
                        /* 나머지는 로그인만 필요 */
                        .anyRequest().authenticated()
                );

        /* 5-2. 로그인/로그아웃 */
        http.formLogin(form -> form
                        .loginPage(LOGIN_PAGE)
                        .loginProcessingUrl(SIGNIN_URL)
                        .defaultSuccessUrl(LOGIN_SUCCESS_URL)
                        .failureUrl(LOGIN_FAILURE_URL)
                        .usernameParameter(USERNAME_PARAM)
                        .passwordParameter(PASSWORD_PARAM)
                        .authenticationDetailsSource(new CustomAuthenticationDetailsSource())
                        .successHandler(authenticationSuccessHandler)
                        .failureHandler(authenticationFailureHandler())
                )
                .logout(logout -> logout
                        .logoutUrl(LOGOUT_URL)
                        .logoutSuccessUrl(LOGOUT_SUCCESS_URL)
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID", rememberMeCookie)
                        .logoutSuccessHandler(logoutSuccessHandler)
                );

        /* 5-3. 세션 관리 */
        http.sessionManagement(sm -> sm
                .sessionFixation(sessionFixation -> sessionFixation.migrateSession())
                // 8시간 세션이 끝나도 7일짜리 Remember-Me 자동 로그인 필터가 바통을 이어받도록 길을 열어줍니다.
                // .invalidSessionUrl(SESSION_INVALIDSESSION_URL)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
                .expiredUrl(SESSION_EXPIRED_URL)
                .sessionRegistry(sessionRegistry())
        );

        //* 5-4. Remember-Me */
        if (rememberMeEnabled) {
            http.rememberMe(rm -> rm
                    .rememberMeServices(rememberMeServices())
                    .tokenRepository(tokenRepository())
                    .userDetailsService(userDetailsService)
                    .authenticationSuccessHandler(rememberMeAuthenticationSuccessHandler)
            );
        } else {
            http.rememberMe(rm -> rm.disable());
        }

        /* 5-5. 예외 처리 */
        http.exceptionHandling(ex -> ex
                .accessDeniedPage(ACCESS_DENIED_PAGE)
                .accessDeniedHandler(accessDeniedHandler())
                .authenticationEntryPoint(loginUrlAuthenticationEntryPoint())
        );

        /* 5-6. CSRF (Cross-Site Request Forgery) 방어선 */
        http.csrf(csrf -> {
            // 더블 중괄호({{}}) 대신 공식 스펙인 정적 팩토리 메서드를 사용하고
            // 쿠키 커스터마이저를 체닝하여 가독성과 안정성을 극대화합니다.
            CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
            csrfRepository.setCookieCustomizer(cookie -> cookie
                    .secure(secureCookie)       // HTTPS 환경에서만 CSRF 쿠키 전송 (세션 쿠키와 동기화)
                    .sameSite("Lax")    // 타 사이트 유입 시 불필요한 쿠키 전송 차단 (보안)
                    .path("/")          // 전체 경로에서 쿠키 유효
            );

            csrf.csrfTokenRepository(csrfRepository)
                    .ignoringRequestMatchers("/error/**", SIGNIN_URL, LOGOUT_URL, "/api/pay/hecto/notify");
        });
        http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

    @Bean
    public PersistentTokenRepository tokenRepository() {
        return new ConfigurableTablePersistentTokenRepository(dataSource, rememberMeTable);
    }

    @Bean
    public PersistentTokenBasedRememberMeServices rememberMeServices() {
        PersistentTokenBasedRememberMeServices svc =
                new PersistentTokenBasedRememberMeServices(rememberMeKey,
                        userDetailsService, tokenRepository());
        svc.setParameter(REMEMBERME_PARAM);
        svc.setCookieName(rememberMeCookie);
        svc.setTokenValiditySeconds(rememberMeValidityDays * 24 * 60 * 60);
        svc.setUseSecureCookie(secureCookie);
        return svc;
    }

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
    // 인증정보를 호출할 수 있도록 등록(필수적으로 빈으로 등록해야 함)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // ======================================================================
    // 로그인 성공 시 처리 핸들러 (세부코드는 security폴더 참조)
    //      [기본] LOGIN_SUCCESS_URL로 리다이렉트
    //      [변경] 로그 출력 추가
    @Bean
    public CustomAuthenticationSuccessHandler authenticationSuccessHandler(
            FindByIndexNameSessionRepository<? extends Session> sessionRepository,
            PersistentLoginsRepository persistentLoginsRepository
    ) {
        return new CustomAuthenticationSuccessHandler(sessionRepository, persistentLoginsRepository);
    }
    // 자동로그인시 시 처리 핸들러 (세부코드는 security폴더 참조)
    //      [기본] 접속 URL로 리다이렉트
    //      [변경] 로그 출력 추가 안함
    @Bean
    public CustomRememberMeAuthenticationSuccessHandler rememberMeAuthenticationSuccessHandler(
            CustomAuthenticationSuccessHandler authenticationSuccessHandler
    ) {
        return new CustomRememberMeAuthenticationSuccessHandler(authenticationSuccessHandler);
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
    public CustomLogoutSuccessHandler logoutSuccessHandler(
            FindByIndexNameSessionRepository<? extends Session> sessionRepository
    ) {
        return new CustomLogoutSuccessHandler(sessionRegistry(), sessionRepository);
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
        return new SessionRegistryImpl();
    }

    // logout시 session 정보 삭제.
    // invalidateHttpSession(true)로 정상작동 되지 않을 수 있어 적용.
    @Bean
    public ServletListenerRegistrationBean<HttpSessionEventPublisher> httpSessionEventPublisher() {
        return new ServletListenerRegistrationBean<>(new HttpSessionEventPublisher());
    }

    // ======================================================================
    // HttpFirewall 인터페이스
    // strictHttpFirewall 은 HttpFirewall의 더 엄격한 기본 구현
    // URI의 일부로 세미콜론을 허용
    // URI의 일부로 % 허용
    // URI의 일부로 // 더블슬러시 허용
    @Bean
    public HttpFirewall customHttpFirewall() {
        StrictHttpFirewall fw = new StrictHttpFirewall();
        fw.setAllowSemicolon(true);
        fw.setAllowUrlEncodedPercent(true);
        fw.setAllowUrlEncodedDoubleSlash(true);

        // ✅ DataTables 파라미터( %5B %5D ) 허용
        fw.getEncodedUrlBlocklist().remove("%5B");
        fw.getEncodedUrlBlocklist().remove("%5D");
        fw.getDecodedUrlBlocklist().remove("[");
        fw.getDecodedUrlBlocklist().remove("]");
        return fw;
    }
}
