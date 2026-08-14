package com.paramount.pmx.repository.management;


import com.paramount.pmx.model.management.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    List<RolePermission> findByRoleId(Long roleId);

    void deleteByRoleId(Long roleId);
}

