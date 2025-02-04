package com.paramount.pmx.model.setting;

import java.io.Serializable;

import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.Id;
import javax.persistence.Table;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "PERSISTENT_LOGINS")
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
