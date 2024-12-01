package com.paramount.pmx.repository.tvcms;

import com.paramount.pmx.model.tvcms.TvVods;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TvVodsRepository extends JpaRepository<TvVods, Long>, JpaSpecificationExecutor<TvVods> {
    //TV 프로그램 정보
    //List<TvPrograms> findAllByUseFlagOrderBySeqAsc(String useFlag);

}
