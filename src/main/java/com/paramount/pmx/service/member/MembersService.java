package com.paramount.pmx.service.member;

import com.paramount.pmx.model.DatatableDto;
import com.paramount.pmx.model.member.Member;
import com.paramount.pmx.model.member.MemberDto;
import com.paramount.pmx.model.member.MemberReqDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.member.MemberRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.specs.member.SearchMemberSpec;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembersService {

    private final MemberRepository memberRepository;

    public ResponseDto getAllMemberList(Map<String, Object> requestParams, CustomUserDetails userDetails) {
        Sort defaultSort = Sort.by(
                Sort.Order.desc("activated"),
                Sort.Order.asc("confirmed"),
                Sort.Order.desc("id")
        );
        DatatableDto datatableDto = new DatatableDto(requestParams, defaultSort, SearchMemberSpec::getValidSortKey);

        Specification<Member> spec = SearchMemberSpec.createSpecification(datatableDto.getSearch(), List.of());
        Page<Member> page = memberRepository.findAll(spec, datatableDto.getPageable());

        List<MemberDto> result = page.getContent().stream()
                .map(MemberDto::toListDto)
                .toList();

        long recordsTotal = memberRepository.count(SearchMemberSpec.createSpecification(new HashMap<>(), List.of()));

        return Response.ok(
                result,
                datatableDto.getDraw(),
                recordsTotal,
                page.getTotalElements()
        );
    }

    @Transactional
    public ResponseDto createMember(MemberReqDto reqDto, CustomUserDetails userDetails) {
        validateCreate(reqDto);

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        Member member = Member.builder()
                .login(reqDto.login())
                .password(passwordEncoder.encode(reqDto.password()))
                .name(reqDto.name())
                .email(reqDto.email())
                .mobile(reqDto.mobile())
                .apartId(reqDto.apartId())
                .address(reqDto.address())
                .zipcode(reqDto.zipcode())
                .sex(reqDto.sex())
                .birthday(reqDto.birthday())
                .confirmed(reqDto.confirmed() == null ? 0 : reqDto.confirmed())
                .activated(reqDto.activated() == null ? 1 : reqDto.activated())
                .build();

        memberRepository.save(member);
        return Response.ok(true);
    }

    @Transactional
    public ResponseDto changePassword(MemberReqDto reqDto, CustomUserDetails userDetails) {
        if (reqDto == null || reqDto.login() == null || reqDto.login().isBlank()) {
            throw new IllegalArgumentException("아이디가 필요합니다.");
        }
        if (reqDto.currentPassword() == null || reqDto.currentPassword().isBlank()) {
            throw new IllegalArgumentException("현재 비밀번호가 필요합니다.");
        }
        String nextPassword = reqDto.newPassword() == null ? reqDto.password() : reqDto.newPassword();
        if (nextPassword == null || nextPassword.isBlank()) {
            throw new IllegalArgumentException("새 비밀번호가 필요합니다.");
        }

        Member member = memberRepository.findByLoginAndActivated(reqDto.login(), 1)
                .orElseThrow(() -> new NoSuchElementException("해당 회원을 찾을 수 없습니다."));

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        if (!passwordEncoder.matches(reqDto.currentPassword(), member.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        member.setPassword(passwordEncoder.encode(nextPassword));
        memberRepository.save(member);
        return Response.ok(true);
    }

    public ResponseDto getMemberDetail(Long memberId, CustomUserDetails userDetails) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NoSuchElementException("해당 회원을 찾을 수 없습니다."));

        return Response.ok(MemberDto.toDetailDto(member));
    }

    @Transactional
    public ResponseDto updateMemberConfirmed(Long memberId, MemberReqDto reqDto, CustomUserDetails userDetails) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NoSuchElementException("해당 회원을 찾을 수 없습니다."));

        if (reqDto.password() != null && !reqDto.password().isBlank()) {
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            member.setPassword(passwordEncoder.encode(reqDto.password()));
        }

        member.setName(reqDto.name());
        member.setEmail(reqDto.email());
        member.setMobile(reqDto.mobile());
        member.setApartId(reqDto.apartId());
        member.setAddress(reqDto.address());
        member.setZipcode(reqDto.zipcode());
        member.setSex(reqDto.sex());
        member.setBirthday(reqDto.birthday());
        member.setConfirmed(reqDto.confirmed() == null ? member.getConfirmed() : reqDto.confirmed());
        member.setActivated(reqDto.activated() == null ? member.getActivated() : reqDto.activated());
        memberRepository.save(member);

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto confirmMember(Long memberId, CustomUserDetails userDetails) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NoSuchElementException("해당 회원을 찾을 수 없습니다."));
        member.setConfirmed(1);
        memberRepository.save(member);
        return Response.ok(true);
    }

    @Transactional
    public ResponseDto resignMember(Long memberId, String resignDate, CustomUserDetails userDetails) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NoSuchElementException("해당 회원을 찾을 수 없습니다."));
        member.setActivated(0);
        memberRepository.save(member);
        return Response.ok(true);
    }

    private void validateCreate(MemberReqDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("요청 정보가 없습니다.");
        }
        if (reqDto.login() == null || reqDto.login().isBlank()) {
            throw new IllegalArgumentException("아이디를 입력해 주세요.");
        }
        if (reqDto.password() == null || reqDto.password().isBlank()) {
            throw new IllegalArgumentException("비밀번호를 입력해 주세요.");
        }
        if (memberRepository.existsByLogin(reqDto.login())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
    }
}
