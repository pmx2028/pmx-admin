package com.paramount.pmx.repository.order;

import com.paramount.pmx.model.order.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface OrdersRepository extends JpaRepository<Orders, Long>, JpaSpecificationExecutor<Orders> {

    boolean existsByOrderNo(String orderNo);

    Optional<Orders> findByOrderNo(String orderNo);

    List<Orders> findByMemberId(Long memberId);

    List<Orders> findByApartId(Long apartId);

    List<Orders> findByLessonId(Long lessonId);
}
