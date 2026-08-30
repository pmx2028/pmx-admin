package com.paramount.pmx.repository.lesson;

import com.paramount.pmx.model.lesson.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Map;

public interface LessonRepository extends JpaRepository<Lesson, Long>, JpaSpecificationExecutor<Lesson> {

    boolean existsByYearAndMonthAndWeekdayCodeAndTimeCodeAndApartIdAndUserId(String year, String month, Long weekdayCode, String timeCode, Long apartId, Long userId);

    List<Lesson> findByYearAndMonthAndWeekdayCodeAndTimeCodeAndApartIdAndCategoryId(String year, String month, Long weekdayCode, String timeCode, Long apartId, Long categoryId);

    List<Lesson> findByYearAndMonthAndApartIdAndCategoryId(String year, String month, Long apartId, Long categoryId);

    List<Lesson> findByYearAndMonthAndApartIdAndCategoryIdIn(String year, String month, Long apartId, Collection<Long> categoryIds);

    List<Lesson> findByApartId(Long apartId);

    List<Lesson> findByUserId(Long userId);

    @Query(value = """
            SELECT
                au.apart_id AS apartId,
                au.user_id AS userId,
                u.name AS userName,
                au.category_id AS categoryId,
                ca.name AS categoryName,
                au.category_id1 AS categoryId1,
                ca1.name AS categoryName1,
                COALESCE(l.year, :year) AS year,
                COALESCE(l.month, :month) AS month,
                l.id AS lessonId,
                l.activated AS lessonActivated,
                au.activated AS apartUserActivated,
                CASE
                    WHEN l.id IS NOT NULL THEN l.commission
                    ELSE au.commission
                END AS commission,
                CASE
                    WHEN l.id IS NOT NULL THEN l.lesson_price
                    ELSE au.lesson_price
                END AS lessonPrice,
                CASE
                    WHEN l.id IS NOT NULL THEN l.lesson_cnt
                    ELSE au.lesson_cnt
                END AS lessonCnt
            FROM apart_users au
            JOIN users u
                ON u.id = au.user_id
            JOIN categories ca
                ON ca.id = au.category_id
            JOIN categories ca1
                ON ca1.id = au.category_id1
            LEFT JOIN lessons l
                ON l.apart_id = au.apart_id
                AND l.user_id = au.user_id
                AND l.category_id = au.category_id
                AND l.category_id1 = au.category_id1
                AND l.year = :year
                AND l.month = :month
            WHERE au.apart_id = :apartId
              AND au.category_id = :categoryId;
            """, nativeQuery = true)
    List<Map<String, Object>> findLessonApartUserRows(
            @Param("year") String year,
            @Param("month") String month,
            @Param("apartId") Long apartId,
            @Param("categoryId") Long categoryId
    );
}
