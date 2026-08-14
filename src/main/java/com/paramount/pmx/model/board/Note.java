package com.paramount.pmx.model.board;


import com.paramount.pmx.model.user.Users;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notes")
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    // 연관관계 (읽기 전용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private Users user;

    @Column(length = 191)
    private String title;

    @Lob
    private String content;

    @Column(name = "board_id", nullable = false)
    private Long boardId;

    @Column(name = "hits_count", nullable = false)
    private Integer hitsCount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 연관관계 (읽기 전용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", insertable = false, updatable = false)
    private Board board;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", insertable = false, updatable = false)
    private List<NoteClip> noteClipList;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", insertable = false, updatable = false)
    @OrderBy("createdAt ASC, id ASC")
    private List<NoteComment> noteCommentList;

}
