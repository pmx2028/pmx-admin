package com.paramount.pmx.repository.photo;



import com.paramount.pmx.model.photo.Cover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CoverRepository extends JpaRepository<Cover, Long>, JpaSpecificationExecutor<Cover> {

}
