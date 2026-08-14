package com.paramount.pmx.repository.management;


import com.paramount.pmx.model.management.Clip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ClipRepository extends JpaRepository<Clip, Long>, JpaSpecificationExecutor<Clip> {

}
