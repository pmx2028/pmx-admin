package com.paramount.pmx.repository.apart;


import com.paramount.pmx.model.apart.Apart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;


public interface ApartRepository extends JpaRepository<Apart, Long> , JpaSpecificationExecutor<Apart> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);
}
