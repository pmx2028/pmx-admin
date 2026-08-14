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
@Table(name = "roles",
        uniqueConstraints = @UniqueConstraint(name = "uk_roles_code", columnNames = "code"))
public class Role {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 120, nullable = false, unique = true)
    private String code;

    @Column(length = 200, nullable = false)
    private String name;

    private Integer position;

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
