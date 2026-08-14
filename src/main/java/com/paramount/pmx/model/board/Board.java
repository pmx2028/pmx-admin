package com.paramount.pmx.model.board;


import com.paramount.pmx.model.user.Users;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "boards")
public class Board {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 191)
    private String name;

    @Column(length = 191)
    private String code;

    @Column(name = "user_id")
    private Long userId;

    // 연관관계 (읽기 전용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private Users user;

    @Column(nullable = false)
    private Integer kindof;           // 게시판 종류 (BoardKindOf enum 참고)

    @Column(nullable = false)
    private Integer activated;        // 활성화 여부 (0: 비활성화, 1: 활성화)

    @Column(nullable = false)
    private Integer commented;        // 댓글 사용 여부 (0: 미사용, 1: 사용)

    @Column(nullable = false)
    private Integer anon;             // 작성자 노출

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}
