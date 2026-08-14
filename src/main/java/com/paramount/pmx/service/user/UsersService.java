package com.paramount.pmx.service.user;

import com.paramount.pmx.model.DatatableDto;
import com.paramount.pmx.model.enums.UserStatus;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.model.user.UserReqDto;
import com.paramount.pmx.model.user.Users;
import com.paramount.pmx.model.user.UsersDto;
import com.paramount.pmx.repository.user.UsersRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.specs.user.SearchUsersSpec;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsersService {

    private final UsersRepository usersRepository;

    // 회원정보 리스트 조회
    public ResponseDto getAllStaffList(Map<String, Object> requestParams, CustomUserDetails userDetails) {
        // 1. DatatableDto 생성
        Sort defaultSort = Sort.by(
                Sort.Order.desc("activated"),
                Sort.Order.desc("id")
        );
        DatatableDto datatableDto = new DatatableDto(requestParams, defaultSort, SearchUsersSpec::getValidSortKey);

        // 2. Specification 생성 (DatatableDto에서 추출한 search 파라미터 사용)
        Map<String, Object> extraSearch = new HashMap<>();
        extraSearch.put("LEVEL_NOT", 1); // level 1인 경우 일반 회원 데이터기때문에 제외함
        datatableDto.getSearch().putAll(extraSearch);

        Specification<Users> spec = SearchUsersSpec.createSpecification(datatableDto.getSearch(), List.of());

        // 3. 데이터 조회
        Page<Users> page = usersRepository.findAll(spec, datatableDto.getPageable());
        List<Users> users = page.getContent();
        List<Long> userIds = users.stream().map(Users::getId).toList();

        List<UsersDto> result = users.stream()
                .map(UsersDto :: toListDto)
                .toList();

        long recordsTotal = usersRepository.count(SearchUsersSpec.createSpecification(new HashMap<>(), List.of()));        // 전체 개수
        // 4. 결과 반환
        return Response.ok(
                result, // data
                datatableDto.getDraw(), // draw
                recordsTotal, // recordsTotal
                page.getTotalElements() // recordsFiltered
        );
    };

    // 사용자 추가
    public ResponseDto createUser(UserReqDto reqDto, CustomUserDetails userDetails) {
        // 1) 중복 아이디 검사
        if (usersRepository.existsByLogin(reqDto.login())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        // 2) 비밀번호 암호화
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String encodedPw = passwordEncoder.encode(reqDto.password());

        Users users = Users.builder()
                .activated(UserStatus.NORMAL)
                .level(reqDto.level())
                .login(reqDto.login())
                .password(encodedPw)
                .name(reqDto.name())
                .roleId(reqDto.roleId())
                .email(reqDto.email())
                .mobile(reqDto.mobile())
                .zipcode(reqDto.zipcode())
                .address(reqDto.address())
                .sex(reqDto.sex())
                .coverId(reqDto.coverId())
                .coverId1(reqDto.coverId1())
                .birthday(reqDto.zipcode())
                .build();


        usersRepository.save(users);

        return Response.ok(true);
    }

    // 사용자 업데이트
    @Transactional
    public ResponseDto updateUser(Long userId, UserReqDto reqDto, CustomUserDetails userDetails) {

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        // 비밀번호 입력된 경우에만 salt 재발급 + 해시 갱신해서 비번 변경
        if (reqDto.password()!=null && !reqDto.password().isEmpty()) {
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            String encodedPw = passwordEncoder.encode(reqDto.password());
            user.setPassword(encodedPw);
        }
        user.setName(reqDto.name());
        user.setRoleId(reqDto.roleId());
        user.setEmail(reqDto.email());
        user.setMobile(reqDto.mobile());
        user.setZipcode(reqDto.zipcode());
        user.setAddress(reqDto.address());
        user.setSex(reqDto.sex());
        user.setBirthday(reqDto.birthday());
        user.setCoverId(reqDto.coverId());
        user.setCoverId1(reqDto.coverId1());
        usersRepository.save(user);

        return Response.ok(true);
    }

    // 비밀번호 변경 (로그인 사용자 본인)
    public ResponseDto changePassword(UserReqDto reqDto, CustomUserDetails userDetails) {

        Users user = usersRepository.findById(userDetails.getId())
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        // 1) 입력값 검증
        String currentPassword = reqDto.currentPassword();
        String newPassword = reqDto.password();


        // 5) 패스워드 검사
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        boolean matches = passwordEncoder.matches(currentPassword, user.getPassword());
        if(!matches) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }


        // 3) 새 비밀번호 반영 (salt 재발급 + 해시 갱신)
        String encodedPw = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPw);
        usersRepository.save(user);

        return Response.ok(true);
    }


    private void refreshAuthentication(CustomUserDetails userDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return;
        }

        UsernamePasswordAuthenticationToken refreshedAuthentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        authentication.getCredentials(),
                        authentication.getAuthorities()
                );
        refreshedAuthentication.setDetails(authentication.getDetails());

        SecurityContext context = SecurityContextHolder.getContext();
        context.setAuthentication(refreshedAuthentication);
        persistSecurityContext(context);
    }

    private void persistSecurityContext(SecurityContext context) {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return;
        }

        HttpSession session = attributes.getRequest().getSession(false);
        if (session == null) {
            return;
        }

        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
    }

    public ResponseDto getUserDetail(Long userId, CustomUserDetails userDetails) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("해당 사용자를 찾을 수 없습니다."));

        UsersDto dto = UsersDto.toDetailDto(user);

        return Response.ok(dto);
    }

    // 사용자 퇴사 처리
    @Transactional
    public ResponseDto resignUser(Long userId, String resignDate, CustomUserDetails userDetails) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("해당 사용자를 찾을 수 없습니다."));
        user.setActivated(UserStatus.QUIT);
        usersRepository.save(user);
        return Response.ok(true);
    }

    private String buildProfileImg(Users user) {
        int randomNo = ThreadLocalRandom.current().nextInt(1, 11);
        String defaultImg = "/images/users/avatar-" + randomNo + ".jpg";
        return defaultImg;
    }

    private static String limitText(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private static LocalDate parseAssignDate(String assignDate) {
        if (assignDate == null || assignDate.isBlank()) {
            throw new IllegalArgumentException("assignDate는 필수입니다.");
        }
        return LocalDate.parse(assignDate.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
    }

    private static boolean eq(Long a, Long b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.equals(b);
    }
}
