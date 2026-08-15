package com.paramount.pmx.model.category;

import com.paramount.pmx.model.photo.Cover;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "category_details")
public class CategoryDetail {

    @Id
    @Column(name = "id")
    private Long id;

    private Integer price;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "usage_info", columnDefinition = "text")
    private String usageInfo;

    @Column(name = "cover_id")
    private Long coverId;

    // 조회용 연관관계 (읽기 전용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cover_id", insertable = false, updatable = false)
    private Cover cover;

    @Column(name = "cover_id1")
    private Long coverId1;

    // 조회용 연관관계 (읽기 전용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cover_id1", insertable = false, updatable = false)
    private Cover cover1;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
