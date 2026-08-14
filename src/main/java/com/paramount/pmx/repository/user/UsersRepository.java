package com.paramount.pmx.repository.user;


import com.paramount.pmx.model.enums.UserStatus;
import com.paramount.pmx.model.user.Users;
import com.paramount.pmx.repository.projection.UserSimpleRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UsersRepository extends JpaRepository<Users, Long> , JpaSpecificationExecutor<Users> {

    @Query("select u.email from Users u where u.id = :id")
    String findEmailById(@Param("id") Long id);

    //회원가입시 아이디 중복확인
    boolean existsByLogin(String loginId);

    //login 기준 재직 회원정보
    Optional<Users> findByLoginAndActivated(String login, UserStatus activated);

    @Query("select u.id as id, u.name as name from Users u where u.id in :ids")
    List<UserSimpleRow> findSimpleUsers(@Param("ids") Set<Long> ids);

    // role 조회
    @Query("""
        SELECT DISTINCT r.code
        FROM Users u
        JOIN u.role r
        WHERE u.id = :userId
          AND r.activated = true
    """)
    List<String> findRoleCodesByUserId(@Param("userId") Long userId);

    // Role 부여된 권한 조회
    @Query("""
        SELECT DISTINCT p.code
        FROM Users u
        JOIN u.role r
        JOIN RolePermission rp ON rp.role = r
        JOIN rp.permission p
        WHERE u.id = :userId
          AND r.activated = true
          AND p.activated = true
    """)
    List<String> findRolePermissionCodesByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT DISTINCT u.id
        FROM Users u
        JOIN u.role r
        JOIN RolePermission rp ON rp.role = r
        JOIN rp.permission p
        WHERE r.activated = true
          AND p.activated = true
          AND p.code = :permissionCode
    """)
    List<Long> findUserIdsByPermissionCode(@Param("permissionCode") String permissionCode);
}
