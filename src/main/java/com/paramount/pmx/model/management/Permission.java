package com.paramount.pmx.model.management;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "permissions",
        uniqueConstraints = @UniqueConstraint(name = "uk_permissions_code", columnNames = "code"))
public class Permission {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 64, nullable = false)
    private String code;

    @Column(length = 64, nullable = false)
    private String name;

    @Column(length = 32, nullable = false)
    private String type;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private boolean activated = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
