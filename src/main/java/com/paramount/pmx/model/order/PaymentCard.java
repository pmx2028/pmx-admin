package com.paramount.pmx.model.order;

import com.paramount.pmx.model.member.Member;
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

// payment_cards: 회원이 등록한 빌링키 카드(간편결제용). 결제건별 카드 상세는 payments.payment_card_id로 참조한다.
@Entity(name = "PaymentCard")
@EntityListeners(AuditingEntityListener.class)
@Table(name = "payment_cards")
@NoArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode(of = { "id", "billingKey" })
@AllArgsConstructor
@Builder
public class PaymentCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "billing_key", nullable = false, unique = true)
    private String billingKey;

    @Column(name = "card_company")
    private String cardCompany;

    @Column(name = "card_bin")
    private String cardBin;

    @Column(name = "card_last4")
    private String cardLast4;

    @Column(name = "card_type")
    private String cardType;

    @Column(name = "is_default", nullable = false)
    private Integer isDefault;

    @Column(name = "is_deleted", nullable = false)
    private Integer isDeleted;

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", insertable = false, updatable = false)
    private Member member;

    @PrePersist
    protected void onCreate() {
        if (isDefault == null) {
            isDefault = 0;
        }
        if (isDeleted == null) {
            isDeleted = 0;
        }
        if (registeredAt == null) {
            registeredAt = LocalDateTime.now();
        }
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
