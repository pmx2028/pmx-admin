package com.paramount.pmx.repository;


import com.paramount.pmx.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    //회원가입시 아이디 중복확인
    Long countByLogin(String userId);

    //회원 로그인 (직원)
    Optional<Member> findByLoginAndRoleGreaterThanEqual(String memberId, String role);

    //login 기준 회원정보 select
    Optional<Member> findByLogin(String memberId);
}
