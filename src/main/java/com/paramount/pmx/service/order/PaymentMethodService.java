package com.paramount.pmx.service.order;

import com.paramount.pmx.model.order.PaymentMethod;
import com.paramount.pmx.model.order.PaymentMethodDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.order.PaymentMethodRepository;
import com.paramount.pmx.security.CustomUserDetails;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

// payment_methods: 결제수단 코드(CARD, VBANK 등) 관리. 회원이 등록한 카드는 PaymentCardService를 참고.
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;

    public ResponseDto getActiveMethodList(CustomUserDetails userDetails) {
        List<PaymentMethodDto> result = paymentMethodRepository
                .findByIsActiveOrderBySortOrderAscIdAsc(1).stream()
                .map(PaymentMethodDto::toListDto)
                .toList();

        return Response.ok(result);
    }

    @Transactional
    public ResponseDto createMethod(PaymentMethodDto reqDto, CustomUserDetails userDetails) {
        validateCreate(reqDto);

        if (paymentMethodRepository.findByCode(reqDto.getCode()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 결제수단 코드입니다.");
        }

        PaymentMethod method = PaymentMethod.builder()
                .code(reqDto.getCode())
                .name(reqDto.getName())
                .isActive(reqDto.getIsActive() == null ? 1 : reqDto.getIsActive())
                .sortOrder(reqDto.getSortOrder() == null ? 0 : reqDto.getSortOrder())
                .build();

        paymentMethodRepository.save(method);
        return Response.ok(true);
    }

    @Transactional
    public ResponseDto updateMethod(Long methodId, PaymentMethodDto reqDto, CustomUserDetails userDetails) {
        PaymentMethod method = paymentMethodRepository.findById(methodId)
                .orElseThrow(() -> new NoSuchElementException("해당 결제수단을 찾을 수 없습니다."));

        method.setName(reqDto.getName() == null ? method.getName() : reqDto.getName());
        method.setSortOrder(reqDto.getSortOrder() == null ? method.getSortOrder() : reqDto.getSortOrder());
        method.setIsActive(reqDto.getIsActive() == null ? method.getIsActive() : reqDto.getIsActive());
        paymentMethodRepository.save(method);

        return Response.ok(true);
    }

    private void validateCreate(PaymentMethodDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("요청 정보가 없습니다.");
        }
        if (reqDto.getCode() == null || reqDto.getCode().isBlank()) {
            throw new IllegalArgumentException("결제수단 코드를 입력해 주세요.");
        }
        if (reqDto.getName() == null || reqDto.getName().isBlank()) {
            throw new IllegalArgumentException("결제수단명을 입력해 주세요.");
        }
    }
}
