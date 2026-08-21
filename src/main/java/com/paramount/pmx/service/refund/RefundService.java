package com.paramount.pmx.service.refund;

import com.paramount.pmx.model.DatatableDto;
import com.paramount.pmx.model.order.Orders;
import com.paramount.pmx.model.order.Payment;
import com.paramount.pmx.model.refund.Refund;
import com.paramount.pmx.model.refund.RefundDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.order.OrdersRepository;
import com.paramount.pmx.repository.order.PaymentRepository;
import com.paramount.pmx.repository.refund.RefundRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.specs.order.SearchRefundSpec;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefundService {

    private final RefundRepository refundRepository;
    private final PaymentRepository paymentRepository;
    private final OrdersRepository ordersRepository;

    public ResponseDto getAllRefundList(Map<String, Object> requestParams, CustomUserDetails userDetails) {
        Sort defaultSort = Sort.by(Sort.Order.desc("id"));
        DatatableDto datatableDto = new DatatableDto(requestParams, defaultSort, SearchRefundSpec::getValidSortKey);

        Specification<Refund> spec = SearchRefundSpec.createSpecification(datatableDto.getSearch(), List.of());
        Page<Refund> page = refundRepository.findAll(spec, datatableDto.getPageable());

        List<RefundDto> result = page.getContent().stream()
                .map(RefundDto::toListDto)
                .toList();

        long recordsTotal = refundRepository.count(SearchRefundSpec.createSpecification(new HashMap<>(), List.of()));

        return Response.ok(
                result,
                datatableDto.getDraw(),
                recordsTotal,
                page.getTotalElements()
        );
    }

    public ResponseDto getRefundDetail(Long refundId, CustomUserDetails userDetails) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new NoSuchElementException("해당 환불을 찾을 수 없습니다."));

        return Response.ok(RefundDto.toDetailDto(refund));
    }

    @Transactional
    public ResponseDto createRefund(RefundDto reqDto, CustomUserDetails userDetails) {
        validateCreate(reqDto);

        Payment payment = paymentRepository.findById(reqDto.getPaymentId())
                .orElseThrow(() -> new NoSuchElementException("해당 결제를 찾을 수 없습니다."));

        if (!"DONE".equals(payment.getPaymentStatus())) {
            throw new IllegalArgumentException("승인된 결제만 환불할 수 있습니다.");
        }

        Orders order = ordersRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new NoSuchElementException("해당 주문을 찾을 수 없습니다."));

        Refund refund = Refund.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .memberId(order.getMemberId())
                .refundAmount(reqDto.getRefundAmount())
                .refundReasonCode(reqDto.getRefundReasonCode())
                .refundReason(reqDto.getRefundReason())
                .requestedBy(userDetails == null ? null : userDetails.getId())
                .build();

        refundRepository.save(refund);
        return Response.ok(true);
    }

    @Transactional
    public ResponseDto processRefund(Long refundId, CustomUserDetails userDetails) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new NoSuchElementException("해당 환불을 찾을 수 없습니다."));

        refund.setRefundStatus("PROCESSING");
        refundRepository.save(refund);

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto completeRefund(Long refundId, RefundDto reqDto, CustomUserDetails userDetails) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new NoSuchElementException("해당 환불을 찾을 수 없습니다."));

        refund.setRefundStatus("COMPLETED");
        refund.setPgCancelId(reqDto.getPgCancelId());
        refund.setResultCode(reqDto.getResultCode());
        refund.setResultMessage(reqDto.getResultMessage());
        refund.setCompletedAt(LocalDateTime.now());
        refundRepository.save(refund);

        Payment payment = paymentRepository.findById(refund.getPaymentId())
                .orElseThrow(() -> new NoSuchElementException("해당 결제를 찾을 수 없습니다."));
        // payments.payment_status에는 부분취소 상태값이 없어 전액 환불일 때만 CANCELLED로 전환한다.
        if (refund.getRefundAmount() >= payment.getAmount()) {
            payment.setPaymentStatus("CANCELLED");
            paymentRepository.save(payment);
        }

        Orders order = ordersRepository.findById(refund.getOrderId())
                .orElseThrow(() -> new NoSuchElementException("해당 주문을 찾을 수 없습니다."));
        order.setOrderStatus("REFUNDED");
        ordersRepository.save(order);

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto failRefund(Long refundId, RefundDto reqDto, CustomUserDetails userDetails) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new NoSuchElementException("해당 환불을 찾을 수 없습니다."));

        refund.setRefundStatus("FAILED");
        refund.setResultCode(reqDto.getResultCode());
        refund.setResultMessage(reqDto.getResultMessage());
        refundRepository.save(refund);

        return Response.ok(true);
    }

    private void validateCreate(RefundDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("요청 정보가 없습니다.");
        }
        if (reqDto.getPaymentId() == null) {
            throw new IllegalArgumentException("결제를 선택해 주세요.");
        }
        if (reqDto.getRefundAmount() == null) {
            throw new IllegalArgumentException("환불 금액을 입력해 주세요.");
        }
    }
}
