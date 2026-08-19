package com.paramount.pmx.repository.member;

import com.paramount.pmx.model.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long>, JpaSpecificationExecutor<Member> {

    boolean existsByLogin(String login);

    Optional<Member> findByLoginAndActivated(String login, Integer activated);
}
