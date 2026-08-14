package com.paramount.pmx.security;

import com.paramount.pmx.model.enums.AuthorityCode;
import com.paramount.pmx.model.enums.UserLevel;
import com.paramount.pmx.model.enums.UserStatus;
import com.paramount.pmx.model.user.Users;
import com.paramount.pmx.repository.user.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

@Service("customUserDetailsService")
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UsersRepository usersRepository;
    private final EffectivePermissionService effectivePermissionService;


    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {

        // 1. 사용자 조회 (재직중인 사람만, 퇴사자 제외)
        Users user = usersRepository.findByLoginAndActivated(login, UserStatus.NORMAL)
                .orElseThrow(() -> new UsernameNotFoundException("존재하지 않는 사용자: " + login));

        log.info("▶ 로그인 시도: {}", user.getLogin());
        log.info(" - 이름: {}", user.getName());

        // 2. 권한 조회
        Set<String> permissionCodes = effectivePermissionService.resolveEffectivePermissionCodes(user);
        log.info("▶ permissionCodes: {}", permissionCodes);

        if (permissionCodes.isEmpty()) {
            log.info("⚠️ 유저 [{}] 권한 없음 (occupation_id={}, position_id={})",
                    user.getLogin(),
                    user.getRole() != null ? user.getRole().getId() : null);
        }

        // 3. GrantedAuthority 리스트로 변환 (Role + Permission)
        Set<GrantedAuthority> authorities = new LinkedHashSet<>();

        if (UserLevel.LEVEL_0.getCode().equals(user.getLevel())) {
            // 🔒 level이 0이면 '권한없음' 상태로 고정
            authorities.add(new SimpleGrantedAuthority(AuthorityCode.NO_PRIVILEGE.getCode()));
            log.warn("⚠️ 유저 [{}] 권한없음 상태(level=0). NO_PRIVILEGE 권한만 부여.", user.getLogin());
        } else {
            // ✅ Permission 추가
            for (String permCode : permissionCodes) {
                if (permCode == null || permCode.isBlank()) continue;
                authorities.add(new SimpleGrantedAuthority(permCode));
            }
        }

        log.info("✅ Final authorities for [{}]: {}", user.getLogin(), authorities);

        // 기본 랜덤 프로필 이미지 (static 정적 파일)
        int randomNo = ThreadLocalRandom.current().nextInt(1, 11);
        String profileImg = "/images/users/avatar-" + randomNo + ".jpg";


        // 4. CustomUserDetails 생성
        return new CustomUserDetails(
                user.getId(),
                user.getLogin(),
                user.getPassword(),
                user.getLevel(),
                user.getRoleId(),
                user.getRoleId()!=null && user.getRole()!=null ? user.getRole().getName() : null ,
                user.getName(),
                user.getEmail(),
                user.getMobile(),
                user.getZipcode(),
                user.getAddress(),
                user.getSex(),
                user.getBirthday(),
                user.getActivated(), // UserStatus
                profileImg,
                authorities
        );
    }
}
