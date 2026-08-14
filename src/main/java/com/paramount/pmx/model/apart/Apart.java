package com.paramount.pmx.model.apart;

import com.paramount.pmx.model.management.Address;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity(name = "Aparts")
@EntityListeners(AuditingEntityListener.class)
@Table(name = "aparts")
@NoArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode(of = { "id" })
@AllArgsConstructor
@Builder
public class Apart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 아파트 번호 (PK)

    @Column(name = "address_id")
    private Integer addressId; // 행정구역코드

    @Column(name = "address_id1")
    private Integer addressId1; // 시군구 코드

    @NotBlank(message = "아파트명은 꼭 필요합니다")
    @Size(max = 100, message = "아파트명은 100자 이하로 입력해 주세요")
    @Column(nullable = false, length = 100)
    private String name; // 아파트명

    @Column(name = "hos_cnt")
    private Integer hosCnt; // 세대수

    @Column(name = "gx_cnt")
    private Integer gxCnt; // GX가용인원

    @Column(name = "run_cnt")
    private Integer runCnt; // 런닝머신수

    @Column(name = "wet_cnt")
    private Integer wetCnt; // 웨이트머신수

    @Column(name = "inby_yn")
    private Integer inbyYn; // 인바디여부 (0:미보유, 1:보유)

    @Column(name = "golf_cnt")
    private Integer golfCnt; // 총타석수

    @Column(name = "scr_cnt")
    private Integer scrCnt; // 스크린타석수

    @Column(name = "scr_golf_cnt")
    private Integer scrGolfCnt; // 스크린골프타석수

    @Column(name = "user_id")
    private Long userId; // 생성자

    @Column(nullable = false)
    private Integer activated; // 삭제 여부 (0:삭제, 1:사용중)

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    // 조회용 연관관계 (읽기 전용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", insertable = false, updatable = false)
    private Address address;


    // 조회용 연관관계 (읽기 전용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id1", insertable = false, updatable = false)
    private Address address1;

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
