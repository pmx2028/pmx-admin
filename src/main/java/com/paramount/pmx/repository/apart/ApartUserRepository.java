package com.paramount.pmx.repository.apart;

import com.paramount.pmx.model.apart.ApartUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ApartUserRepository extends JpaRepository<ApartUser, Long>, JpaSpecificationExecutor<ApartUser> {

    boolean existsByApartIdAndUserId(Long apartId, Long userId);

    boolean existsByApartIdAndUserIdAndIdNot(Long apartId, Long userId, Long id);

    boolean existsByApartIdAndUserIdAndCategoryId1(Long apartId, Long userId , Long categoryId1);

    boolean existsByApartIdAndUserIdAndCategoryId1AndIdNot(Long apartId, Long userId, Long categoryId1 ,  Long id);

    List<ApartUser> findByApartId(Long apartId);

    List<ApartUser> findByApartIdAndActivated(Long apartId, Integer activated);

    List<ApartUser> findByUserId(Long userId);
}
