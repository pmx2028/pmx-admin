package com.paramount.pmx.model.user;


import com.paramount.pmx.converter.UserStatusConverter;
import com.paramount.pmx.model.enums.UserStatus;
import com.paramount.pmx.model.management.Role;
import com.paramount.pmx.model.photo.Cover;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;


@Entity(name = "Users")
@EntityListeners(AuditingEntityListener.class)
@Table(name = "USERS")
@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = {})
@EqualsAndHashCode(of = { "id", "login" })
@AllArgsConstructor
@Builder
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 회원순번

    @NotBlank(message = "아이디는 꼭 필요합니다")
    @Size(min = 4, max = 50, message = "아이디는 4자 이상으로 만들어주세요")
    @Column(nullable = false, length = 50)
    private String login; // 회원ID(로그인)

    @Transient
    @NotBlank(message = "비밀번호가 꼭 필요합니다", groups = OnCreate.class)
    @Size(min = 8, max = 50, message = "비밀번호는 8자 이상으로 만들어주세요", groups = OnCreate.class)
    private String rawPassword;

    private Long level; // UserLevel enum 참고

    private String password; // 비밀번호

    @NotBlank(message = "이름이 꼭 필요합니다")
    @Column(nullable = false)
    private String name; // 이름

    @Column(unique = true)
    private String email;

    private String mobile;

    private String zipcode;

    private String address;

    private String sex;

    private String birthday;

    @Column(name = "role_id")
    private Long roleId;

    @Convert(converter = UserStatusConverter.class)
    private UserStatus activated; // 퇴사여부 [0 : 탈퇴 or 퇴사 / 1 : 정상]

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


    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", insertable = false, updatable = false)
    private Role role;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public interface OnCreate {}

}
