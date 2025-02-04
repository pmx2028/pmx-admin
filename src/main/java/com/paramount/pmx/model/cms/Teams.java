package com.paramount.pmx.model.cms;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "TEAMS")
@NoArgsConstructor
@Getter
@ToString(exclude = {})
@EqualsAndHashCode(of = {"id"})
public class Teams {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;            //팀 순번
    private String name;        //팀 이름

    // 조인 정보 (user)
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "team", cascade = {CascadeType.REFRESH, CascadeType.MERGE}, orphanRemoval=false)
    private List<Users> users;
}
