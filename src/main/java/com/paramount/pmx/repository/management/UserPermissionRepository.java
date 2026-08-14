package com.paramount.pmx.repository.management;

import com.paramount.pmx.model.management.UserPermission;
import com.paramount.pmx.model.user.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserPermissionRepository extends JpaRepository<UserPermission, Long> {

    @Query("""
        SELECT DISTINCT u
        FROM Users u
        WHERE u.id IN (
            SELECT up.userId FROM UserPermission up
        )
    """)
    List<Users> findAllUsers();

    List<UserPermission> findByUserId(Long userId);

    void deleteByUserId(Long userId);

    @Query("""
        select distinct p.code
        from UserPermission up
        join up.permission p
        where up.userId = :userId
          and up.mode = com.paramount.pmx.model.management.UserPermission.Mode.ALLOW
          and p.activated = true
    """)
    List<String> findAllowedPermissionCodesByUserId(@Param("userId") Long userId);

    @Query("""
        select distinct p.code
        from UserPermission up
        join up.permission p
        where up.userId = :userId
          and up.mode = com.paramount.pmx.model.management.UserPermission.Mode.DENY
          and p.activated = true
    """)
    List<String> findDeniedPermissionCodesByUserId(@Param("userId") Long userId);
}
