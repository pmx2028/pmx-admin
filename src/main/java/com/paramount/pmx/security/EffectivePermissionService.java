package com.paramount.pmx.security;


import com.paramount.pmx.model.enums.UserLevel;
import com.paramount.pmx.model.user.Users;
import com.paramount.pmx.repository.user.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class EffectivePermissionService {

    private final UsersRepository usersRepository;

    /**
     * 최종 유효 권한코드 집합 계산
     * 우선순위: Role(base) → Org(additive only) → User(ALLOW) → User(DENY)
     */
    public Set<String> resolveEffectivePermissionCodes(Users user) {
        // 레벨 0 차단 -> 로그인은 가능하나 내기사 영역만 보임
        if (UserLevel.LEVEL_0.getCode().equals(user.getLevel())) {
            return Set.of();
        }

        // 1) 역할(Role) 기반 기본 권한
        List<String> base = usersRepository.findRolePermissionCodesByUserId(user.getId());
        LinkedHashSet<String> effective = new LinkedHashSet<>(base);

        // 1-1) 가지고 있는 role 정보 저장
        List<String> role = usersRepository.findRoleCodesByUserId(user.getId());
        effective.addAll(role);

        return Collections.unmodifiableSet(effective);
    }
}
