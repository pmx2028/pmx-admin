package com.paramount.pmx.repository.order;

import com.paramount.pmx.model.order.PaymentCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface PaymentCardRepository extends JpaRepository<PaymentCard, Long>, JpaSpecificationExecutor<PaymentCard> {

    List<PaymentCard> findByMemberIdAndIsDeletedOrderByIsDefaultDescIdDesc(Long memberId, Integer isDeleted);

    Optional<PaymentCard> findByMemberIdAndIsDefaultAndIsDeleted(Long memberId, Integer isDefault, Integer isDeleted);

    Optional<PaymentCard> findByBillingKey(String billingKey);
}
