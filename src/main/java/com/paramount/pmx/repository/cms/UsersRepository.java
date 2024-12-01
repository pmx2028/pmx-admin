package com.paramount.pmx.repository.cms;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.paramount.pmx.model.cms.Users;
import com.paramount.pmx.model.enums.UserStatus;

public interface UsersRepository extends JpaRepository<Users, Long>{
    //회원가입시 아이디 중복확인
    Long countByLogin(String userId);

    //회원 로그인 (직원)
    Optional<Users> findByLoginAndActivatedAndLevelGreaterThanEqual(String userId, UserStatus userStatus, Long level);

    //login 기준 회원정보 select
    Optional<Users> findByLogin(String userId);
}
