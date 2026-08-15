package com.paramount.pmx.repository.category;

import com.paramount.pmx.model.category.CategoryDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryDetailRepository extends JpaRepository<CategoryDetail, Long> {
}
