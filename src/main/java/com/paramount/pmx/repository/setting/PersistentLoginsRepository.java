package com.paramount.pmx.repository.setting;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.paramount.pmx.model.setting.PersistentLogins;

public interface PersistentLoginsRepository extends JpaRepository<PersistentLogins, String>, JpaSpecificationExecutor<PersistentLogins>{
    List<PersistentLogins> findByUsernameOrderByLastUsedDesc(String username);
}
