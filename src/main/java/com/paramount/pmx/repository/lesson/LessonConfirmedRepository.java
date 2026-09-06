package com.paramount.pmx.repository.lesson;

import com.paramount.pmx.model.lesson.LessonConfirmed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface LessonConfirmedRepository extends JpaRepository<LessonConfirmed, Long>, JpaSpecificationExecutor<LessonConfirmed> {

    LessonConfirmed findByYearAndMonthAndApartIdAndCategoryId(String year, String month, Long apartId , Long categoryId);

    // 아파트 목록(Specification/Page) 조회 후 강습확정 정보를 배치로 병합할 때 사용
    List<LessonConfirmed> findByYearAndMonthAndApartIdIn(String year, String month, List<Long> apartIds);

    @Query(value = """
            SELECT
           a.id AS apartId,
           a.name AS apartName,
           a.address_id AS addressId,
           ad.name AS addressName,
           a.address_id1 AS addressId1,
           ad1.name AS addressName1,
           a.activated AS apartActivated,
           :year AS year,
           :month AS month,
           COALESCE(\s
               (SELECT lc.confirmed
                   FROM lesson_confirmed lc
                   WHERE lc.apart_id  = a.id
                     AND lc.year = :year
                     AND lc.month = :month
                     AND lc.category_id = 1
               ), ''   ) AS gxConfirmed ,
          COALESCE(
               (SELECT lc.confirmed
                   FROM lesson_confirmed lc
                  WHERE lc.apart_id  = a.id
                     AND lc.year = :year
                     AND lc.month = :month
                     AND lc.category_id = 2
               ), ''   ) AS healthConfirmed ,
          COALESCE(
               (SELECT lc.confirmed
                   FROM lesson_confirmed lc
                   WHERE lc.apart_id  = a.id
                     AND lc.year = :year
                     AND lc.month = :month
                     AND lc.category_id = 3
               ), ''   ) AS golfConfirmed , 
          COALESCE(
               (SELECT lc.confirmed
                   FROM lesson_confirmed lc
                   WHERE lc.apart_id  = a.id
                     AND lc.year = :year
                     AND lc.month = :month
                     AND lc.category_id =4
               ), ''   ) AS tuniConfirmed         
       FROM aparts a
       LEFT JOIN addresses ad
           ON ad.id = a.address_id
       LEFT JOIN addresses ad1
           ON ad1.id = a.address_id1
       WHERE (:apartId IS NULL OR a.id = :apartId)
           AND (:addressId IS NULL OR a.address_id = :addressId)
           AND (:addressId1 IS NULL OR a.address_id1 = :addressId1)
           AND (:name IS NULL OR LOWER(a.name) LIKE CONCAT('%', LOWER(:name), '%'));
            """, nativeQuery = true)
    List<Map<String , Object>> findApartWithLessonConfirmed(
            @Param("year") String year,
            @Param("month") String month,
            @Param("apartId") Long apartId,
            @Param("addressId") Long addressId,
            @Param("addressId1") Long addressId1,
            @Param("name") String name
    );

}
