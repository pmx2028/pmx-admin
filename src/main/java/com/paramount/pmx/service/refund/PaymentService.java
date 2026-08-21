package com.paramount.pmx.service.refund;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paramount.pmx.model.DatatableDto;
import com.paramount.pmx.model.order.Orders;
import com.paramount.pmx.model.order.Payment;
import com.paramount.pmx.model.order.PaymentDto;
import com.paramount.pmx.model.order.PaymentMethod;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.order.OrdersRepository;
import com.paramount.pmx.repository.order.PaymentMethodRepository;
import com.paramount.pmx.repository.order.PaymentRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.specs.order.SearchPaymentSpec;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private static final String MCHT_TRD_NO_PREFIX = "DEALSITE";

    private final PaymentRepository paymentRepository;
    private final OrdersRepository ordersRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final ObjectMapper objectMapper;

    public ResponseDto getAllPaymentList(Map<String, Object> requestParams, CustomUserDetails userDetails) {
        Sort defaultSort = Sort.by(Sort.Order.desc("id"));
        DatatableDto datatableDto = new DatatableDto(requestParams, defaultSort, SearchPaymentSpec::getValidSortKey);

        Specification<Payment> spec = SearchPaymentSpec.createSpecification(datatableDto.getSearch(), List.of());
        Page<Payment> page = paymentRepository.findAll(spec, datatableDto.getPageable());

        List<PaymentDto> result = page.getContent().stream()
                .map(PaymentDto::toListDto)
                .toList();

        long recordsTotal = paymentRepository.count(SearchPaymentSpec.createSpecification(new HashMap<>(), List.of()));

        return Response.ok(
                result,
                datatableDto.getDraw(),
                recordsTotal,
                page.getTotalElements()
        );
    }

    public ResponseDto getPaymentListByOrder(Long orderId, CustomUserDetails userDetails) {
        List<PaymentDto> result = paymentRepository.findByOrderIdOrderByIdDesc(orderId).stream()
                .map(PaymentDto::toListDto)
                .toList();

        return Response.ok(result);
    }

    public ResponseDto getPaymentDetail(Long paymentId, CustomUserDetails userDetails) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NoSuchElementException("해당 결제를 찾을 수 없습니다."));

        return Response.ok(PaymentDto.toDetailDto(payment));
    }

    @Transactional
    public ResponseDto createPayment(PaymentDto reqDto, CustomUserDetails userDetails) {
        validateCreate(reqDto);

        Orders order = ordersRepository.findById(reqDto.getOrderId())
                .orElseThrow(() -> new NoSuchElementException("해당 주문을 찾을 수 없습니다."));

        String methodCode = reqDto.getPaymentMethod().trim().toUpperCase();
        PaymentMethod method = paymentMethodRepository.findByCode(methodCode)
                .orElseThrow(() -> new IllegalArgumentException("지원하지 않는 결제수단입니다: " + methodCode));

        Payment payment = Payment.builder()
                .orderId(order.getId())
                .paymentMethodId(method.getId())
                .paymentCardId(reqDto.getPaymentCardId())
                .pgCompany(reqDto.getPgCompany())
                .mchtId(reqDto.getMchtId())
                .mchtTrdNo(generateMchtTrdNo())
                .paymentMethod(methodCode)
                .transactionType("PAYMENT")
                .paymentStatus("READY")
                .amount(reqDto.getAmount())
                .build();

        paymentRepository.save(payment);

        order.setOrderStatus("PAYMENT_PENDING");
        ordersRepository.save(order);

        return Response.ok(PaymentDto.toDetailDto(payment));
    }

    @Transactional
    public ResponseDto approvePayment(Long paymentId, PaymentDto reqDto, CustomUserDetails userDetails) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NoSuchElementException("해당 결제를 찾을 수 없습니다."));

        payment.setPaymentStatus("DONE");
        payment.setTrdNo(reqDto.getTrdNo());
        payment.setTrdDt(reqDto.getTrdDt());
        payment.setTrdTm(reqDto.getTrdTm());
        payment.setApprovedAt(LocalDateTime.now());
        payment.setResultCode(reqDto.getResultCode());
        payment.setResultMessage(reqDto.getResultMessage());
        payment.setRawResponse(toJsonOrNull(reqDto.getRawResponse()));
        paymentRepository.save(payment);

        Orders order = ordersRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new NoSuchElementException("해당 주문을 찾을 수 없습니다."));
        order.setOrderStatus("PAID");
        ordersRepository.save(order);

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto failPayment(Long paymentId, PaymentDto reqDto, CustomUserDetails userDetails) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NoSuchElementException("해당 결제를 찾을 수 없습니다."));

        payment.setPaymentStatus("FAILED");
        payment.setTrdNo(reqDto.getTrdNo());
        payment.setResultCode(reqDto.getResultCode());
        payment.setResultMessage(reqDto.getResultMessage());
        payment.setRawResponse(toJsonOrNull(reqDto.getRawResponse()));
        paymentRepository.save(payment);

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto cancelPayment(Long paymentId, CustomUserDetails userDetails) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NoSuchElementException("해당 결제를 찾을 수 없습니다."));

        payment.setPaymentStatus("CANCELLED");
        paymentRepository.save(payment);

        return Response.ok(true);
    }

    // payments.mcht_trd_no는 NOT NULL + UNIQUE라서 결제 등록 시점에 반드시 채번해야 한다.
    private String generateMchtTrdNo() {
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        String candidate = MCHT_TRD_NO_PREFIX + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + random;
        return paymentRepository.existsByMchtTrdNo(candidate) ? generateMchtTrdNo() : candidate;
    }

    // payments.raw_response는 MySQL json 컬럼이라 유효한 JSON이 아니면 저장 시점에 에러가 난다.
    // 호출부(예: HectoPayService의 notify 파라미터 Map.toString())가 JSON이 아닌 문자열을 넘기더라도
    // 데이터 유실 없이 JSON 문자열 값으로 감싸서 저장한다.
    private String toJsonOrNull(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return null;
        }
        try {
            objectMapper.readTree(rawResponse);
            return rawResponse;
        } catch (Exception e) {
            try {
                return objectMapper.writeValueAsString(rawResponse);
            } catch (Exception ex) {
                log.warn("raw_response를 JSON으로 변환하지 못했습니다: {}", rawResponse, ex);
                return null;
            }
        }
    }

    private void validateCreate(PaymentDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("요청 정보가 없습니다.");
        }
        if (reqDto.getOrderId() == null) {
            throw new IllegalArgumentException("주문을 선택해 주세요.");
        }
        if (reqDto.getPaymentMethod() == null || reqDto.getPaymentMethod().isBlank()) {
            throw new IllegalArgumentException("결제수단을 선택해 주세요.");
        }
        if (reqDto.getAmount() == null) {
            throw new IllegalArgumentException("결제 금액을 입력해 주세요.");
        }
    }
}
