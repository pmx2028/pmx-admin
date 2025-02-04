package com.paramount.pmx.model.cms;

import javax.persistence.*;

import com.paramount.pmx.model.enums.UserStatus;
import com.paramount.pmx.model.setting.Krxes;
import com.paramount.pmx.model.tvcms.TvVods;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.paramount.pmx.model.converter.UserStatusConverter;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "USERS")
@NoArgsConstructor
@Getter
@ToString(exclude = {})
@EqualsAndHashCode(of = { "id", "login" })
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 회원순번
    private String login; // 회원ID(로그인)
    private String password; // 비밀번호
    private String salt; // 비밀번호 조합키
    private String name; // 이름
    private String title; // 직함
    private Long level; // 직원접속등급 (10이상)

    @Convert(converter = UserStatusConverter.class)
    private UserStatus activated; // 퇴사여부 [0 : 탈퇴 or 퇴사 / 1 : 정상]

    @ManyToOne(optional = false, fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST })
    // @NotFound(action = NotFoundAction.IGNORE)
    @JoinColumn(name = "team_id", referencedColumnName = "ID")
    private Teams team;

    @OneToMany(mappedBy = "users", cascade = CascadeType.ALL)
    private List<TvVods> tvVods = new ArrayList<>();

    @PostLoad
    public void PostLoad() { // team id = 0 존재.
        if (this.getTeam() != null && this.getTeam().getId() == 0) {
            this.team = null;
        }
    }
}
