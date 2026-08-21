package com.paramount.pmx.model.refund;

import com.paramount.pmx.model.member.Member;
import com.paramount.pmx.model.order.Orders;
import com.paramount.pmx.model.order.Payment;
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

@Entity(name = "Refund")
@EntityListeners(AuditingEntityListener.class)
@Table(name = "refunds")
@NoArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode(of = { "id", "refundNo" })
@AllArgsConstructor
@Builder
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "refund_no", nullable = false)
    private String refundNo;

    @Column(name = "payment_id", nullable = false)
    private Long paymentId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "refund_amount", nullable = false)
    private Integer refundAmount;

    @Column(name = "refund_reason_code")
    private String refundReasonCode;

    @Column(name = "refund_reason")
    private String refundReason;

    @Column(name = "refund_status", nullable = false)
    private String refundStatus;

    @Column(name = "pg_cancel_id")
    private String pgCancelId;

    @Column(name = "result_code")
    private String resultCode;

    @Column(name = "result_message")
    private String resultMessage;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "requested_by")
    private Long requestedBy;

    @Column(name = "raw_response", columnDefinition = "json")
    private String rawResponse;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", insertable = false, updatable = false)
    private Payment payment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Orders order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", insertable = false, updatable = false)
    private Member member;

    @PrePersist
    protected void onCreate() {
        if (refundNo == null || refundNo.isBlank()) {
            refundNo = "REF" + System.currentTimeMillis();
        }
        if (refundStatus == null || refundStatus.isBlank()) {
            refundStatus = "REQUESTED";
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
