package com.paramount.pmx.security;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.paramount.pmx.model.Member;
import com.paramount.pmx.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    MemberRepository memberRepository;

    @Value("#{${USER_ROLE}}")           //config.properites에 정의
    private Map<Long, String> USER_ROLE;


    // @Value("#{${USER_ROLE_BY_INDIVIDUAL}}")  //config.properites에 정의
    // private Map<Long, String> USER_ROLE_BY_INDIVIDUAL;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {

        //기존 user table에서 activated=1 and level >= 10
        Member user = memberRepository.findByLoginAndRoleGreaterThanEqual(login  , "2").orElse(null);

        //권한
        Set<GrantedAuthority> grantedAuthorities = new HashSet<>();
//        if (user != null) { //외부기고자(컬럼리스트) 제외
//            List<String> userRoleList = new ArrayList<>();
//            userRoleList.addAll(Arrays.asList(USER_ROLE.get(user.getLevel()).split(",")));
//            if (userRoleList.size() > 0) {
//                for (String userRole : userRoleList) {
//                        grantedAuthorities.add(new SimpleGrantedAuthority(userRole));
//                }
//            }
//        }

        Long id = 0L;
        String password = "";
        String role ="";
        String zipcode = "";
        String address = "";
        String birthday = "";
        String email = "";
        String name = "";
        String sex = "";
        String tel1 = "";
        String tel2 = "";
        String tel3 = "";
        String deleteYn ="";



        if (user != null){
            id = user.getId();
            login = user.getLogin();
            password = user.getPassword();
            role = user.getRole();
            zipcode = user.getZipcode();
            address = user.getAddress();
            birthday = user.getBirthday();
            email = user.getEmail();
            name = user.getName();
            sex = user.getSex();
            tel1 = user.getTel1();
            tel2 = user.getTel2();
            tel3 = user.getTel3();
            deleteYn = user.getDeleteYn();

        }
        return new CustomUserDetails(
            id,
            login,
            password,
            role,
            zipcode,
            address,
            birthday,
            email,
            name,
            sex,
            tel1,
            tel2,
            tel3,
            deleteYn
            //Collection<? extends GrantedAuthority> grantedAuthorities
        );
    }

}
