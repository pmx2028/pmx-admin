package com.paramount.pmx.repository.lesson;

import com.paramount.pmx.model.lesson.LessonConfirmed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface LessonConfirmedRepository extends JpaRepository<LessonConfirmed, Long>, JpaSpecificationExecutor<LessonConfirmed> {

    List<LessonConfirmed> findByYearAndMonthAndApartId(String year, String month, Long apartId);

    // 아파트 목록(Specification/Page) 조회 후 강습확정 정보를 배치로 병합할 때 사용
    List<LessonConfirmed> findByYearAndMonthAndApartIdIn(String year, String month, List<Long> apartIds);

    @Query(value = """
            SELECT
                a.id AS apartId,
                a.name AS apartName,
                a.address_id AS addressId,
                a.address_id1 AS addressId1,
                a.activated AS apartActivated,
                lc.id AS lessonConfirmedId,
                COALESCE(lc.year, :year) AS year,
                COALESCE(lc.month, :month) AS month,
                lc.confirmed AS confirmed,
                lc.activated AS confirmedActivated,
                lc.created_at AS createdAt,
                lc.updated_at AS updatedAt
            FROM aparts a
            LEFT JOIN lesson_confirmed lc
                ON lc.apart_id = a.id
                AND lc.year = :year
                AND lc.month = :month
                AND (:confirmed IS NULL OR lc.confirmed = :confirmed)
            WHERE (:apartId IS NULL OR a.id = :apartId)
                AND (:addressId IS NULL OR a.address_id = :addressId)
                AND (:addressId1 IS NULL OR a.address_id1 = :addressId1)
                AND (:name IS NULL OR LOWER(a.name) LIKE CONCAT('%', LOWER(:name), '%'))
                AND (:unregistered = false OR lc.id IS NULL)
                AND (:confirmed IS NULL OR lc.id IS NOT NULL)
            """, nativeQuery = true)
    List<Map<String, Object>> findApartWithLessonConfirmed(
            @Param("year") String year,
            @Param("month") String month,
            @Param("apartId") Long apartId,
            @Param("confirmed") Long confirmed,
            @Param("addressId") Long addressId,
            @Param("addressId1") Long addressId1,
            @Param("name") String name,
            @Param("unregistered") boolean unregistered
    );

}
