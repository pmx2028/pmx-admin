package com.paramount.pmx.repository.management;


import com.paramount.pmx.model.management.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long>, JpaSpecificationExecutor<Address> {

    @Query("""
        select a
        from Address a
        where a.depth = 1
        order by a.sortOrder asc, a.id asc
    """)
    List<Address> findDepthOne();


    @Query("""
        select a
        from Address a
        where a.depth = 2
              AND a.parentId = :addressId
        order by a.sortOrder asc, a.id asc
    """)
    List<Address> findDepthTwo(@Param("addressId") Long addressId);
}
