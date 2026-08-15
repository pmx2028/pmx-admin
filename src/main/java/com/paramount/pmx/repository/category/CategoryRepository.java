package com.paramount.pmx.repository.category;

import com.paramount.pmx.model.category.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // 특정 parent_id 기준으로 자식 카테고리 + 활성화된 것만
    List<Category> findByParentIdAndActivatedOrderByPosition(Long parentId, Integer activated);
    List<Category> findByParentIdIsNull();

    @Query("SELECT MAX(c.position) FROM Category c WHERE c.parentId = :parentId")
    Integer findMaxPositionByParentId(@Param("parentId") Long parentId);

    // 특정 parent_id 기준으로 자식 카테고리
    @Query("""
    SELECT cc
    FROM Category pc, Category cc
    WHERE pc.id = cc.parentId
      AND pc.name = :name
    ORDER BY cc.id ASC
    """)
    List<Category> findChildrenByParentName(@Param("name") String name);

    @Query("SELECT c.id FROM Category c WHERE c.depth = 2 AND c.name IN :names")
    List<Long> findDepth2IdsByNames(@Param("names") List<String> names);
}
