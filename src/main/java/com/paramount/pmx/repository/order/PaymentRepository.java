package com.paramount.pmx.repository.order;

import com.paramount.pmx.model.order.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {

    List<Payment> findByOrderIdOrderByIdDesc(Long orderId);

    Optional<Payment> findByMchtTrdNo(String mchtTrdNo);

    Optional<Payment> findByTrdNo(String trdNo);

    boolean existsByMchtTrdNo(String mchtTrdNo);
}
