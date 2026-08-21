package com.paramount.pmx.model.order;

import com.paramount.pmx.model.apart.Apart;
import com.paramount.pmx.model.lesson.Lesson;
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

// 클래스명은 "orders" 예약어 충돌을 피하기 위해 Users 엔티티와 동일한 방식으로 복수형(Orders)을 사용한다.
@Entity(name = "Orders")
@EntityListeners(AuditingEntityListener.class)
@Table(name = "orders")
@NoArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode(of = { "id", "orderNo" })
@AllArgsConstructor
@Builder
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", nullable = false)
    private String orderNo;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "apart_id")
    private Long apartId;

    @Column(name = "lesson_id")
    private Long lessonId;

    @Column(name = "order_name", nullable = false)
    private String orderName;

    @Column(name = "order_amount", nullable = false)
    private Integer orderAmount;

    @Column(name = "discount_amount", nullable = false)
    private Integer discountAmount;

    @Column(name = "payment_amount", nullable = false)
    private Integer paymentAmount;

    @Column(name = "order_status", nullable = false)
    private String orderStatus;

    @Column(name = "ordered_at", nullable = false)
    private LocalDateTime orderedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", insertable = false, updatable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apart_id", insertable = false, updatable = false)
    private Apart apart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", insertable = false, updatable = false)
    private Lesson lesson;

    @PrePersist
    protected void onCreate() {
        if (orderNo == null || orderNo.isBlank()) {
            orderNo = "ORD" + System.currentTimeMillis();
        }
        if (orderStatus == null || orderStatus.isBlank()) {
            orderStatus = "READY";
        }
        if (discountAmount == null) {
            discountAmount = 0;
        }
        if (orderedAt == null) {
            orderedAt = LocalDateTime.now();
        }
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
