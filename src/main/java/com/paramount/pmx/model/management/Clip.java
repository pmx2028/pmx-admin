package com.paramount.pmx.model.management;

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
@Table(name = "clips")
@ToString
public class Clip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(length = 191)
    private String hashkey;

    @Column(name = "original_filename", length = 191)
    private String originalFilename;

    @Column(length = 191)
    private String filename;

    @Column(name = "content_type", length = 191)
    private String contentType;

    @Column(length = 191)
    private String filesize;

    @Column(length = 191)
    private String caption;

    @Column(name = "ext_url", length = 191)
    private String extUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}
