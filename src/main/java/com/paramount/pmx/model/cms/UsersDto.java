package com.paramount.pmx.model.cms;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.Accessors;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@ToString
@Accessors(chain = true)
public class UsersDto {

    private Long id;                        //회원순번
    private String login;                   //회원ID(로그인)
    private String password;                //비밀번호
    private String salt;                    //비밀번호 조합키
    private String name;                    //이름
    private String title;                   //직함
    private Long level;                     //직원접속등급
    private Long activated;                 //퇴사여부 [0 : 탈퇴 or 퇴사 / 1 : 정상]
}
