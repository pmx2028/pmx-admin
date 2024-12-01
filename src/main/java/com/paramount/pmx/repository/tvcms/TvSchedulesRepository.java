package com.paramount.pmx.repository.tvcms;

import com.paramount.pmx.model.tvcms.TvSchedules;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TvSchedulesRepository extends JpaRepository<TvSchedules, Long>, JpaSpecificationExecutor<TvSchedules> {
    // 사용중인 TV프로그램 목록
    //List<TvSchedules> findAllByBroadFlagAndViewFlagOrderBySeqAscCreatedAtDesc(String broadFlag , String viewFlag);

    @Query("SELECT tvSchedules FROM TvSchedules tvSchedules WHERE tvSchedules.scheduleDay BETWEEN :startDt AND :endDt ORDER BY tvSchedules.scheduleDay ASC , tvSchedules.scheduleStTime ASC" )
    List<TvSchedules> findTvSchedulesByStartDtEndDt(@Param("startDt") String startDt, @Param("endDt") String endDt);

    List<TvSchedules> findAllByScheduleDayOrderByScheduleStTimeDesc(String scheduleDay);

}
