package com.paramount.pmx.model.user;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "persistent_logins_pmx")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@ToString(exclude = {})
@EqualsAndHashCode(of = {"series"})
public class PersistentLogins implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String series;                      //시리즈번호
    private String token;                       //토큰
    private String username;                    //사용자아이디
    private String lastUsed;                    //최근사용일시
}

