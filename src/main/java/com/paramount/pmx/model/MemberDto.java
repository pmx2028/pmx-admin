package com.paramount.pmx.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.Accessors;
import org.springframework.stereotype.Component;
import java.io.Serializable;
import java.time.LocalDateTime;


@Component
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@ToString
@Accessors(chain = true)
public class MemberDto implements Serializable {

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
    private String deleteYn;
    private Long createdBy;
    private Long updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
