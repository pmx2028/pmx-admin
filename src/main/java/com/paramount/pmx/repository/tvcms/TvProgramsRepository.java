package com.paramount.pmx.repository.tvcms;

import com.paramount.pmx.model.tvcms.TvPrograms;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface TvProgramsRepository extends JpaRepository<TvPrograms, Long>, JpaSpecificationExecutor<TvPrograms> {
    // 사용중인 TV프로그램 목록
    List<TvPrograms> findAllByBroadFlagAndViewFlagOrderBySeqAscCreatedAtDesc(String broadFlag , String viewFlag);

}
