package com.paramount.pmx.security;

import com.paramount.pmx.model.enums.UserStatus;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.util.*;

@Getter
@ToString
@EqualsAndHashCode(of = "userId") //중복체크 key
public class CustomUserDetails implements UserDetails {

    private static final long serialVersionUID = 709359402528581339L;
    private Long id;
    private String userId;                              //회원 로그인ID
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
    private Set<GrantedAuthority> authorities;

    // @AllArgsConstructor를 사용하지 않고 지정하는 이유는 CustomUserDetails가 ADMIN, USER 양쪽에서 다 쓰일 수 있기에 이름에 통일성이 없기 때문
    public CustomUserDetails(
            Long id,
            String userId,                              //회원 로그인ID
            String password, // 비밀번호
            String role,
            String zipcode,
            String address,
            String birthday,
            String email,
            String name,
            String sex,
            String tel1,
            String tel2,
            String tel3,
            String deleteYn
            //Collection<? extends GrantedAuthority> authorities
        ) {
        this.id = id;
        this.userId = userId;
        this.password = password;
        this.role = role;
        this.zipcode = zipcode;
        this.address = address;
        this.birthday = birthday;
        this.email = email;
        this.name = name;
        this.sex = sex;
        this.tel1 = tel1;
        this.tel2 = tel2;
        this.tel3 = tel3;
        this.deleteYn = deleteYn;
        //this.authorities = Collections.unmodifiableSet(sortAuthorities(authorities));
    }

    public void setPassword(String password) {
        this.password = password;
    }

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.authorities;
    }

    public void setAuthorities(Collection<? extends GrantedAuthority> authorities) {
        this.authorities = Collections.unmodifiableSet(sortAuthorities(authorities));
    }

    @Override
    public String getUsername() {
        return this.userId;
    }

	@Override
	public String getPassword() {
		return this.password;
    }

    public String setName(){
        return this.name;
    }

    /**
     * 계정 만료 여부
     * true : 만료 안됨
     * false : 만료
     * @return
     */
    @Override
	public boolean isAccountNonExpired() {
        //LocalDateTime nowDt = LocalDateTime.now();
		//return (this.expiredAt == null) || (nowDt.isAfter(this.startAt) && nowDt.isBefore(this.expiredAt));
        return true;
	}

    /**
     * 계정 잠김 여부
     * true : 잠기지 않음
     * false : 잠김
     * @return
     */
	@Override
	public boolean isAccountNonLocked() {
        //return this.status == null ? false : this.status.equals(UserStatus.valueOf("NORMAL"));
        //return this.status.equals(UserStatus.valueOf("NORMAL"));
        return true;
	}

    /**
     * 비밀번호 만료 여부
     * true : 만료 안됨
     * false : 만료
     * @return
     */
	@Override
	public boolean isCredentialsNonExpired() {
        //비밀번호 만료일자가 없으므로 무조건 true
        return true;
	}

    /**
     * 사용자 활성화 여부
     * ture : 활성화
     * false : 비활성화
     * @return
     */
	@Override
	public boolean isEnabled() {
        //return this.status.equals(UserStatus.valueOf("NORMAL"));
        return true;
    }

    private static SortedSet<GrantedAuthority> sortAuthorities(Collection<? extends GrantedAuthority> authorities) {
        SortedSet<GrantedAuthority> sortedAuthorities = new TreeSet<>(new AuthorityComparator());

        for (GrantedAuthority grantedAuthority : authorities) {
            if(grantedAuthority != null) {
                sortedAuthorities.add(grantedAuthority);
            }
        }

        return sortedAuthorities;
    }

    private static class AuthorityComparator implements Comparator<GrantedAuthority>, Serializable {

        //private static final long serialVersionUID = SpringSecurityCoreVersion.SERIAL_VERSION_UID;

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
}
