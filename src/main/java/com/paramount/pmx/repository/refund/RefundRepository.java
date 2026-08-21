package com.paramount.pmx.repository.refund;

import com.paramount.pmx.model.refund.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface RefundRepository extends JpaRepository<Refund, Long>, JpaSpecificationExecutor<Refund> {

    boolean existsByRefundNo(String refundNo);

    Optional<Refund> findByRefundNo(String refundNo);

    List<Refund> findByOrderIdOrderByIdDesc(Long orderId);

    List<Refund> findByPaymentIdOrderByIdDesc(Long paymentId);

    List<Refund> findByMemberIdOrderByIdDesc(Long memberId);
}
