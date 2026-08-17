package com.paramount.pmx.model.lesson;

import com.paramount.pmx.model.apart.Apart;
import com.paramount.pmx.model.category.Category;
import com.paramount.pmx.model.user.Users;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity(name = "Lesson")
@EntityListeners(AuditingEntityListener.class)
@Table(name = "lessons")
@NoArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode(of = { "id" })
@AllArgsConstructor
@Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String year;

    @Column
    private String month;

    @Column(name = "weekday_code", length = 10)
    private Long weekdayCode;

    @Column(name = "time_code", length = 10)
    private String timeCode;

    @Column(name = "apart_id", nullable = false)
    private Long apartId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "category_id1")
    private Long categoryId1;

    @Column
    private Long commission;

    @Column
    private Integer capacity;

    @Column(name = "min_capacity")
    private Integer minCapacity;

    @Column(name = "lesson_price")
    private Long LessonPrice;

    @Column(name = "lesson_cnt")
    private Integer LessonCnt;


    @Column(nullable = false)
    private Integer activated;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apart_id", insertable = false, updatable = false)
    private Apart apart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id1", insertable = false, updatable = false)
    private Category category1;

    @PrePersist
    protected void onCreate() {
        if (activated == null) {
            activated = 1;
        }
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
