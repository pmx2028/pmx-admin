package com.paramount.pmx.service.pay;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paramount.pmx.config.HectoProperties;
import com.paramount.pmx.model.member.Member;
import com.paramount.pmx.model.order.Orders;
import com.paramount.pmx.model.order.Payment;
import com.paramount.pmx.model.order.PaymentDto;
import com.paramount.pmx.model.pay.HectoPayRequestDto;
import com.paramount.pmx.repository.member.MemberRepository;
import com.paramount.pmx.repository.order.OrdersRepository;
import com.paramount.pmx.repository.order.PaymentRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.refund.PaymentService;
import com.paramount.pmx.utils.HectoSignatureUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.NoSuchElementException;

// 헥토파이낸셜(SettlePG) 결제창(https://tbnpg.settlebank.co.kr/resources/js/v1/SettlePG_v1.2.js) 연동
//
// ⚠ 아래 pktHash 산출식과 notify 콜백 파라미터명은 SettlePG_v1.2.js 클라이언트 스크립트만으로는
// 확인할 수 없는 "가맹점 서버가 직접 계산/검증"하는 영역이라, 통상적인 PG 연동 규격을 가정해 작성했다.
// 반드시 헥토파이낸셜 공식 연동 매뉴얼로 필드 순서/해시 알고리즘/notify 파라미터명을 재검증한 뒤
// 운영에 반영할 것. 매뉴얼과 다르면 결제창에서 "위변조 오류"로 거절되거나 notify가 무시될 수 있다.
@Service
@RequiredArgsConstructor
@Slf4j
public class HectoPayService {

    private static final DateTimeFormatter TRD_DT_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter TRD_TM_FORMAT = DateTimeFormatter.ofPattern("HHmmss");

    private final HectoProperties hectoProperties;
    private final PaymentRepository paymentRepository;
    private final OrdersRepository ordersRepository;
    private final MemberRepository memberRepository;
    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    @Value("${app.base-url:http://localhost:7022}")
    private String appBaseUrl;

    // 결제창(SETTLE_PG.pay) 호출에 필요한 결제요청 정보를 생성한다.
    // mcht_trd_no는 payments 등록(PaymentService.createPayment) 시점에 이미 채번되어 있으므로 여기서는 재사용만 한다.
    @Transactional
    public HectoPayRequestDto buildPayRequest(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NoSuchElementException("해당 결제를 찾을 수 없습니다."));

        if (!"READY".equals(payment.getPaymentStatus()) && !"IN_PROGRESS".equals(payment.getPaymentStatus())) {
            throw new IllegalArgumentException("결제 요청이 가능한 상태가 아닙니다.");
        }

        Orders order = ordersRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new NoSuchElementException("해당 주문을 찾을 수 없습니다."));

        Member member = memberRepository.findById(order.getMemberId())
                .orElseThrow(() -> new NoSuchElementException("해당 회원을 찾을 수 없습니다."));

        LocalDateTime now = LocalDateTime.now();
        String trdDt = now.format(TRD_DT_FORMAT);
        String trdTm = now.format(TRD_TM_FORMAT);
        String mchtTrdNo = payment.getMchtTrdNo();
        String method = toHectoMethod(payment.getPaymentMethod());
        String trdAmt = String.valueOf(payment.getAmount());
        String mchtId = hectoProperties.mid();

        String pktHash = HectoSignatureUtil.sha256Hex(
                mchtId + method + mchtTrdNo + trdDt + trdTm + trdAmt + hectoProperties.hashKey()
        );

        byte[] aes256TrdAmt = HectoSignatureUtil.aes256EncryptEcb(hectoProperties.encryptionKey(), trdAmt);
        String encTrdAmt = HectoSignatureUtil.encodeBase64(aes256TrdAmt);

        byte[] aes256CustName = HectoSignatureUtil.aes256EncryptEcb(hectoProperties.encryptionKey(), member.getName());
        String encCustName = HectoSignatureUtil.encodeBase64(aes256CustName);

        payment.setMchtId(mchtId);
        payment.setPktHash(pktHash);
        payment.setPaymentStatus("IN_PROGRESS");
        paymentRepository.save(payment);

        HectoPayRequestDto dto = HectoPayRequestDto.builder()
                .env(hectoProperties.hectoUrl())
                .uiType("iframe")
                .mchtId(mchtId)
                .method(method)
                .trdDt(trdDt)
                .trdTm(trdTm)
                .mchtTrdNo(mchtTrdNo)
                .mchtName("딜사이트")
                .mchtEName("dealsite")
                //.pmtPrdtNm(order.getOrderName())
                .pmtPrdtNm("딜사이트상품")
                .trdAmt(encTrdAmt)
                .mchtCustNm(encCustName)
                .mchtCustId(String.valueOf(member.getId()))
                .notiUrl(appBaseUrl + "/api/pay/hecto/notify")
                .nextUrl(appBaseUrl + "/pay/return/next")
                .cancUrl(appBaseUrl + "/pay/return/cancel")
                .mchtParam("")
                .pktHash(pktHash)
                .build();

        log.info("HectoPayRequestDto {}", dto);
        return dto;
    }

    // 헥토파이낸셜 서버 → 가맹점 서버(notiUrl) 결제결과 통보 처리.
    // ⚠ 파라미터명(resultCode/trdNo 등)과 응답 포맷("OK" 등)은 실제 매뉴얼 기준으로 재검증 필요.
    @Transactional
    public String handleNotify(Map<String, String> params) {
        log.info("[HECTO notify] {}", params);

        String mchtTrdNo = params.get("mchtTrdNo");
        if (mchtTrdNo == null || mchtTrdNo.isBlank()) {
            log.warn("[HECTO notify] mchtTrdNo가 없습니다: {}", params);
            return "FAIL";
        }

        Payment payment = paymentRepository.findByMchtTrdNo(mchtTrdNo.trim()).orElse(null);
        if (payment == null) {
            log.warn("[HECTO notify] mchtTrdNo에 해당하는 결제를 찾을 수 없습니다: {}", mchtTrdNo);
            return "FAIL";
        }

        String resultCode = params.getOrDefault("resultCode", params.get("RESULT_CODE"));
        String resultMsg = params.getOrDefault("resultMsg", params.get("RESULT_MSG"));
        boolean approved = "0000".equals(resultCode) || "success".equalsIgnoreCase(resultCode);

        PaymentDto reqDto = PaymentDto.builder()
                .trdNo(params.get("trdNo"))
                .trdDt(params.get("trdDt"))
                .trdTm(params.get("trdTm"))
                .resultCode(resultCode)
                .resultMessage(resultMsg)
                .rawResponse(toRawResponseJson(params))
                .build();

        if (approved) {
            paymentService.approvePayment(payment.getId(), reqDto, (CustomUserDetails) null);
        } else {
            paymentService.failPayment(payment.getId(), reqDto, (CustomUserDetails) null);
        }

        return "OK";
    }

    private String toRawResponseJson(Map<String, String> params) {
        try {
            return objectMapper.writeValueAsString(params);
        } catch (Exception e) {
            log.warn("notify 파라미터를 JSON으로 변환하지 못했습니다: {}", params, e);
            return params.toString();
        }
    }

    private String toHectoMethod(String paymentMethod) {
        return paymentMethod == null ? "card" : paymentMethod.toLowerCase();
    }
}
