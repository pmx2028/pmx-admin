package com.paramount.pmx.repository.setting;


import com.paramount.pmx.model.setting.Krxes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface KrxesRepository extends JpaRepository<Krxes, Long>, JpaSpecificationExecutor<Krxes> {
    List<Krxes> findAllByNameStartingWithOrderByNameAsc(String krxeName);
}
