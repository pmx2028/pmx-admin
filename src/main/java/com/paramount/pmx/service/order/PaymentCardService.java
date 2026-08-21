package com.paramount.pmx.service.order;

import com.paramount.pmx.model.order.PaymentCard;
import com.paramount.pmx.model.order.PaymentCardDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.order.PaymentCardRepository;
import com.paramount.pmx.security.CustomUserDetails;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

// payment_cards: 회원이 등록한 빌링키 카드 관리.
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentCardService {

    private final PaymentCardRepository paymentCardRepository;

    public ResponseDto getCardListByMember(Long memberId, CustomUserDetails userDetails) {
        List<PaymentCardDto> result = paymentCardRepository
                .findByMemberIdAndIsDeletedOrderByIsDefaultDescIdDesc(memberId, 0).stream()
                .map(PaymentCardDto::toListDto)
                .toList();

        return Response.ok(result);
    }

    @Transactional
    public ResponseDto createCard(PaymentCardDto reqDto, CustomUserDetails userDetails) {
        validateCreate(reqDto);

        if (paymentCardRepository.findByBillingKey(reqDto.getBillingKey()).isPresent()) {
            throw new IllegalArgumentException("이미 등록된 빌링키입니다.");
        }

        boolean isFirstCard = paymentCardRepository
                .findByMemberIdAndIsDeletedOrderByIsDefaultDescIdDesc(reqDto.getMemberId(), 0).isEmpty();

        PaymentCard card = PaymentCard.builder()
                .memberId(reqDto.getMemberId())
                .billingKey(reqDto.getBillingKey())
                .cardCompany(reqDto.getCardCompany())
                .cardBin(reqDto.getCardBin())
                .cardLast4(reqDto.getCardLast4())
                .cardType(reqDto.getCardType())
                .isDefault(isFirstCard ? 1 : 0)
                .isDeleted(0)
                .build();

        paymentCardRepository.save(card);
        return Response.ok(true);
    }

    @Transactional
    public ResponseDto setDefaultCard(Long cardId, CustomUserDetails userDetails) {
        PaymentCard card = paymentCardRepository.findById(cardId)
                .orElseThrow(() -> new NoSuchElementException("해당 카드를 찾을 수 없습니다."));

        paymentCardRepository.findByMemberIdAndIsDefaultAndIsDeleted(card.getMemberId(), 1, 0)
                .filter(existing -> !existing.getId().equals(card.getId()))
                .ifPresent(existing -> {
                    existing.setIsDefault(0);
                    paymentCardRepository.save(existing);
                });

        card.setIsDefault(1);
        paymentCardRepository.save(card);

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto deleteCard(Long cardId, CustomUserDetails userDetails) {
        PaymentCard card = paymentCardRepository.findById(cardId)
                .orElseThrow(() -> new NoSuchElementException("해당 카드를 찾을 수 없습니다."));

        card.setIsDeleted(1);
        card.setIsDefault(0);
        card.setDeletedAt(LocalDateTime.now());
        paymentCardRepository.save(card);

        return Response.ok(true);
    }

    private void validateCreate(PaymentCardDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("요청 정보가 없습니다.");
        }
        if (reqDto.getMemberId() == null) {
            throw new IllegalArgumentException("회원을 선택해 주세요.");
        }
        if (reqDto.getBillingKey() == null || reqDto.getBillingKey().isBlank()) {
            throw new IllegalArgumentException("빌링키가 필요합니다.");
        }
    }
}
