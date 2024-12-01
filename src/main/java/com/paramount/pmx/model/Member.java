package com.paramount.pmx.model;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "MEMBER")
@NoArgsConstructor
@Getter
@ToString(exclude = {})
@EqualsAndHashCode(of = { "id", "login" })
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 회원순번
    private String login; // 회원ID(로그인)
    private String password; // 비밀번호
    private String role;
    private String zipcode;
    private String address;
    private String birthday;
    private String email;
    private String name;
    private String sex;
    private String tel1;
    private String tel2;
    private String tel3;
    @Column(name = "delete_yn")
    private String deleteYn;
    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "created_at" , updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
