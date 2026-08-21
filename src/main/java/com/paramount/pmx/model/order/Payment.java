package com.paramount.pmx.model.order;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity(name = "Payment")
@EntityListeners(AuditingEntityListener.class)
@Table(name = "payments")
@NoArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode(of = { "id", "mchtTrdNo" })
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "payment_method_id", nullable = false)
    private Long paymentMethodId;

    @Column(name = "payment_card_id")
    private Long paymentCardId;

    @Column(name = "pg_company", nullable = false)
    private String pgCompany;

    @Column(name = "mcht_id")
    private String mchtId;

    // 가맹점 거래번호. 결제 요청(등록) 시 우리가 채번하는 유일값.
    @Column(name = "mcht_trd_no", nullable = false, unique = true)
    private String mchtTrdNo;

    // 헥토 발급 거래번호(TID). 승인 통보 후 채워짐.
    @Column(name = "trd_no")
    private String trdNo;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Column(name = "transaction_type", nullable = false)
    private String transactionType;

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus;

    @Column(nullable = false)
    private Integer amount;

    @Column(name = "vact_bank_cd")
    private String vactBankCd;

    @Column(name = "vact_no")
    private String vactNo;

    @Column(name = "vact_in_dt")
    private LocalDateTime vactInDt;

    @Column(name = "pkt_hash")
    private String pktHash;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    // 헥토 응답 거래일자(YYYYMMDD)/거래시각(HHMMSS) 원본 보관
    @Column(name = "trd_dt")
    private String trdDt;

    @Column(name = "trd_tm")
    private String trdTm;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "result_code")
    private String resultCode;

    @Column(name = "result_message")
    private String resultMessage;

    @Column(name = "raw_response", columnDefinition = "json")
    private String rawResponse;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Orders order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id", insertable = false, updatable = false)
    private PaymentMethod method;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_card_id", insertable = false, updatable = false)
    private PaymentCard card;

    @PrePersist
    protected void onCreate() {
        if (pgCompany == null || pgCompany.isBlank()) {
            pgCompany = "HECTO";
        }
        if (transactionType == null || transactionType.isBlank()) {
            transactionType = "PAYMENT";
        }
        if (paymentStatus == null || paymentStatus.isBlank()) {
            paymentStatus = "READY";
        }
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
