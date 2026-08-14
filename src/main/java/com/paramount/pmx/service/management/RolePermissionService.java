package com.paramount.pmx.service.management;


import com.paramount.pmx.model.management.*;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.model.user.Users;
import com.paramount.pmx.model.user.UsersDto;
import com.paramount.pmx.repository.management.PermissionRepository;
import com.paramount.pmx.repository.management.RolePermissionRepository;
import com.paramount.pmx.repository.management.RoleRepository;
import com.paramount.pmx.repository.management.UserPermissionRepository;
import com.paramount.pmx.repository.user.UsersRepository;
import com.paramount.pmx.security.CustomUserDetails;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RolePermissionService {
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final UsersRepository usersRepository;


    // 역할 조회
    public ResponseDto getRoleList(CustomUserDetails userDetails) {
        List<Role> roles = roleRepository.findAll(
                Sort.by(Sort.Direction.ASC, "position")
        );
        List<RoleDto> result = roles.stream()
                .map(RoleDto::from)
                .toList();
        return Response.ok(result);
    }

    // 권한 조회
    public ResponseDto getPermissionList(CustomUserDetails userDetails) {
        List<Permission> permissions = permissionRepository.findAll();
        List<PermissionDto> result = permissions.stream()
                .map(PermissionDto::from)
                .toList();
        return Response.ok(result);
    }


    public ResponseDto getPermissionByRoleId(Long roleId, CustomUserDetails userDetails) {
        List<RolePermission> rolePermissions = rolePermissionRepository.findByRoleId(roleId);
        List<Long> grantedIds = rolePermissions.stream()
                .map(rp -> rp.getPermission().getId())
                .toList();

        return Response.ok(grantedIds);
    }

    @Transactional
    public ResponseDto updateRolePermissions(Long roleId, List<Long> permissionIds, CustomUserDetails userDetails) {
        // 존재 확인 (예외 발생 시 바로 중단)
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 역할입니다."));

        // 기존 연결 삭제
        rolePermissionRepository.deleteByRoleId(roleId);

        // 새로 추가할 연결 엔티티 구성
        List<RolePermission> links = permissionIds.stream()
                .map(pid -> RolePermission.builder()
                        .role(role) // 이미 영속 상태
                        .permission(permissionRepository.getReferenceById(pid)) // 프록시
                        .build())
                .toList();

        // 벌크 저장
        rolePermissionRepository.saveAll(links);

        return Response.ok(true);
    }

    private Role findRole(Long roleId) {
        return roleRepository.findById(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Role not found: " + roleId));
    }


    // 사용자별 권한 부여 테이블에 존재하는 유저 리스트 조회
    public ResponseDto getDistinctUsersFromUserPermissions(CustomUserDetails userDetails) {
        List<Users> users = userPermissionRepository.findAllUsers();
        List<UsersDto> result = users.stream().map(UsersDto::toManageUserPermission).toList();
        return Response.ok(result);
    }

    // 특정 사용자(userId)에 대해 화면(Display)용 권한 뷰를 구성한다.
    public ResponseDto getUserPermissionViewByUserId(Long userId, CustomUserDetails userDetails) {
        // 1) 유저 검증
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자를 찾을 수 없습니다."));

        // 2) 기본(Role) 권한
        //      직군/직책에 따라 부여되는 권한 목록임
        List<String> defaultCodes = usersRepository.findRolePermissionCodesByUserId(userId);
        Set<String> defaultSet = new HashSet<>(defaultCodes);

        // 4) 사용자 오버라이드 권한 조회 (UserPermission)
        List<UserPermission> overrides = userPermissionRepository.findByUserId(userId);
        // permissionId -> Mode
        Map<Long, UserPermission.Mode> overrideMap = overrides.stream()
                .filter(up -> up.getPermission() != null)
                .collect(Collectors.toMap(up -> up.getPermission().getId(), UserPermission::getMode, (a, b) -> b));

        // 5) 전체 권한 목록
        List<Permission> all = permissionRepository.findAll();

        // 6) 최종 병합 규칙 적용
        //    - user DENY  (최우선 차단)
        //    - user ALLOW (그 다음 허용)
        //    - (defaultAllow || orgAllow)  (둘 중 하나라도 true면 허용)
        //    - 위 어떤 것도 아니면 false
        List<UserPermissionViewDto> rows = all.stream().map(p -> {
            Long   pid   = p.getId();
            String code  = p.getCode();
            boolean defaultAllow = defaultSet.contains(code);

            UserPermission.Mode mode = overrideMap.get(pid);
            String userEffect = (mode != null) ? mode.name() : null;

            // 최종 허용 여부 계산
            boolean effective;
            if (mode == UserPermission.Mode.DENY) {
                // (1) 사용자 명시적 차단: 기본/조직 허용과 무관하게 최종 불허
                effective = false;                 // 최우선 차단
            } else if (mode == UserPermission.Mode.ALLOW) {
                // (2) 사용자 명시적 허용: 기본/조직 불허와 무관하게 최종 허용
                effective = true;                  // 최우선 허용
            } else {
                // (3) 사용자 오버라이드가 없으면 기본 규칙 적용
                //     - 기본(Role) 허용 또는 조직 추가 허용 중 하나라도 true면 허용
                effective = (defaultAllow ); // 기본 or 조직추가
            }

            return new UserPermissionViewDto(
                    pid,
                    code,
                    p.getName(),
                    defaultAllow,
                    userEffect,
                    effective
            );
        }).toList();

        Map<String, Object> data = Map.of(
                "userId", userId,
                "permissions", rows
        );
        return Response.ok(data);
    }

    // 특정 사용자에 부여된 권한 업데이트
    @Transactional
    public ResponseDto updateUserPermissionByUserId(Long userId, List<UserPermissionUpdateReqDto> reqDtoList, CustomUserDetails userDetails) {
        // 기존 값 삭제
        userPermissionRepository.deleteByUserId(userId);
        // 새로운 값 insert
        List<UserPermission> newPermissions = reqDtoList.stream()
                .map(dto -> UserPermission.builder()
                        .userId(userId)
                        .permissionId(dto.permissionId())
                        .mode(dto.effect())
                        .build())
                .toList();
        userPermissionRepository.saveAll(newPermissions);
        return Response.ok(true);
    }

    // 특정 사용자에 부여된 권한 삭제
    @Transactional
    // 사용자별 권한 부여 테이블에 존재하는 사용자 삭제
    public ResponseDto deleteUserPermissionByUserId(Long userId, CustomUserDetails userDetails) {
        // 기존 값 삭제
        userPermissionRepository.deleteByUserId(userId);
        return Response.ok(true);
    }

}
