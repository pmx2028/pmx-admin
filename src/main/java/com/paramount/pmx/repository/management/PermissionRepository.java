package com.paramount.pmx.repository.management;

import com.paramount.pmx.model.management.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByCode(String code);

    Optional<Permission> findByType(String type);
}
