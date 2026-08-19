package com.paramount.pmx.repository.lesson;

import com.paramount.pmx.model.lesson.Lesson;
import com.paramount.pmx.model.lesson.LessonConfirmed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface LessonConfirmedRepository extends JpaRepository<LessonConfirmed, Long>, JpaSpecificationExecutor<LessonConfirmed> {

    List<LessonConfirmed> findByYearAndMonthAndApartId(String year, String month, Long apartId);

}
