package com.paramount.pmx.repository.order;

import com.paramount.pmx.model.order.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long>, JpaSpecificationExecutor<PaymentMethod> {

    Optional<PaymentMethod> findByCode(String code);

    List<PaymentMethod> findByIsActiveOrderBySortOrderAscIdAsc(Integer isActive);
}
