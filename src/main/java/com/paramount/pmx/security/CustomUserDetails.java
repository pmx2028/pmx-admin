package com.paramount.pmx.security;

import com.paramount.pmx.model.enums.AuthorityCode;
import com.paramount.pmx.model.enums.UserStatus;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "userId") //중복체크 key
public class CustomUserDetails implements UserDetails {

    private static final long serialVersionUID = 709359402528581339L;
    private Long id;
    private String userId;
    private String password;
    private Long level;
    private Long roleId;
    private String roleName;
    private String name;
    private String email;
    private String mobile;
    private String zipcode;
    private String address;
    private String sex;
    private String birthday;
    private UserStatus status;
    private Set<GrantedAuthority> authorities;
    private String profileImg;

    public CustomUserDetails(
            Long id,
            String userId,                              //?�원 로그?�ID
            String password, // 비�?번호
            Long level,
            Long roleId,
            String roleName,
            String name,
            String email,
            String mobile,
            String zipcode,
            String address,
            String sex,
            String birthday,
            UserStatus status,
            String profileImg,
            Collection<? extends GrantedAuthority> authorities

        ) {
        this.id = id;
        this.userId = userId;
        this.password = password;
        this.level = level;
        this.roleId = roleId;
        this.roleName = roleName;
        this.name = name;
        this.email = email;
        this.mobile = mobile;
        this.zipcode = zipcode;
        this.address = address;
        this.sex = sex;
        this.birthday = birthday;
        this.status = status;
        this.profileImg = profileImg;
        this.authorities = Collections.unmodifiableSet(sortAuthorities(authorities));
    }

    // null-safe
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.authorities != null ? this.authorities : Collections.emptySet();
    }

    /*
     * Spring Security ?��? 메서??     * 로그?????�용?��? ?�별?�기 ?�해 Security ?��??�서 ?�출??     * */
    @Override
    public String getUsername() {
        return this.userId;
    }

    /*
     * Spring Security ?��? 메서??     * 로그?????�력??비�?번호?� DB???�?�된 ?�호?�된 비�?번호�?비교?�기 ?�해 ?�용??     * */
    @Override
    public String getPassword() {
        return this.password;
    }

    // ?�용???�직?�태 ?��? ?�인
    @Override
    public boolean isEnabled() {
        return this.status.equals(UserStatus.valueOf("NORMAL"));
    }

    private static SortedSet<GrantedAuthority> sortAuthorities(Collection<? extends GrantedAuthority> authorities) {
        SortedSet<GrantedAuthority> sorted = new TreeSet<>(new AuthorityComparator());
        if (authorities != null) {
            for (GrantedAuthority ga : authorities) if (ga != null) sorted.add(ga);
        }
        return sorted;
    }

    private static class AuthorityComparator implements Comparator<GrantedAuthority>, Serializable {

        public int compare(GrantedAuthority g1, GrantedAuthority g2) {
            if(g2.getAuthority() == null) {
                return -1;
            }

            if (g1.getAuthority() == null) {
                return 1;
            }

            return g1.getAuthority().compareTo(g2.getAuthority());
        }
    }

    // ?�?� ??권한 ?�퍼???�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    private Set<String> getAuthorityNames() {
        return getAuthorities().stream()
                .filter(Objects::nonNull)
                .map(GrantedAuthority::getAuthority)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }


    /** ?�일 권한 보유 ?��? */
    public boolean hasAuthority(AuthorityCode authorityCode) {
        return authorityCode != null && getAuthorityNames().contains(authorityCode.name());
    }

    /**
     * ?�러 권한 �??�나?�도 보유?�고 ?�는지 검??     */
    public boolean hasAnyAuthority(AuthorityCode... codes) {
        if (codes == null || codes.length == 0) return false;
        Set<String> names = getAuthorityNames();
        for (AuthorityCode code : codes) {
            if (code != null && names.contains(code.name())) return true;
        }
        return false;
    }

    /** ?�근권한???�는 ?�용??(NO_PRIVILEGE) ?��? */
    public boolean hasNoPrivilege() {
        return hasAuthority(AuthorityCode.NO_PRIVILEGE);
    }

    /** 관리자 ??�� ?��? */
    public boolean hasAdminRole() {
        return hasAnyAuthority(AuthorityCode.ROLE_ADMIN, AuthorityCode.ADMIN);
    }
}
