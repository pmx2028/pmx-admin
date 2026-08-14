package com.paramount.pmx.model.user;

import com.paramount.pmx.model.enums.UserStatus;
import com.paramount.pmx.utils.S3UrlHelper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@ToString
@Accessors(chain = true)
public class UsersDto {

    private Long id;
    private String login;
    private String rawPassword;
    private Long level;
    private Long roleId;
    private String roleName;
    private String password;
    private String name;
    private String email;
    private String mobile;
    private String zipcode;
    private String address;
    private String sex;
    private String birthday;
    private UserStatus activated;
    private String createdAt;
    private String updatedAt;
    private Long coverId;
    private String coverImageUrl;
    private String coverImageTitle;
    private Long coverId1;
    private String coverImageUrl1;
    private String coverImageTitle1;
    private List<String>  btnActions;

    public static UsersDto toDto(Users users) {
        return UsersDto.builder()
                .id(users.getId())
                .login(users.getLogin())
                .rawPassword(users.getRawPassword())
                .level(users.getLevel())
                .roleId(users.getRoleId())
                .password(users.getPassword())
                .name(users.getName())
                .email(users.getEmail())
                .mobile(users.getMobile())
                .zipcode(users.getZipcode())
                .address(users.getAddress())
                .sex(users.getSex())
                .birthday(users.getBirthday())
                .activated(users.getActivated())
                .createdAt(users.getCreatedAt().toLocalDate().toString()+ " " + users.getCreatedAt().toLocalTime().toString())
                .updatedAt(users.getUpdatedAt().toLocalDate().toString()+ " " + users.getUpdatedAt().toLocalTime().toString())
                .build();
    }

    public static UsersDto toDetailDto(Users users){
        String coverImageUrl = "";
        String coverImageTitle = "";
        String coverImageUrl1 = "";
        String coverImageTitle1 = "";
        if (users.getCover() != null) {
            coverImageUrl = S3UrlHelper.getCoverThumbUrl(users.getCover().getExtUrl());
            coverImageTitle = users.getCover().getOriginalFilename();
        }

        if (users.getCover1() != null) {
            coverImageUrl1 = S3UrlHelper.getCoverThumbUrl(users.getCover1().getExtUrl());
            coverImageTitle1 = users.getCover1().getOriginalFilename();
        }


        return UsersDto.builder()
                .id(users.getId())
                .login(users.getLogin())
                .rawPassword(users.getRawPassword())
                .password(users.getPassword())
                .level(users.getLevel())
                .roleId(users.getRoleId())
                .name(users.getName())
                .email(users.getEmail())
                .mobile(users.getMobile())
                .zipcode(users.getZipcode())
                .address(users.getAddress())
                .sex(users.getSex())
                .birthday(users.getBirthday())
                .coverId(users.getCoverId())
                .coverImageUrl(coverImageUrl)
                .coverImageTitle(coverImageTitle)
                .coverId1(users.getCoverId1())
                .coverImageUrl1(coverImageUrl1)
                .coverImageTitle1(coverImageTitle1)
                .activated(users.getActivated())
                .createdAt(users.getCreatedAt().toLocalDate().toString()+ " " + users.getCreatedAt().toLocalTime().toString())
                .updatedAt(users.getUpdatedAt().toLocalDate().toString()+ " " + users.getUpdatedAt().toLocalTime().toString())
                .build();
    }

    public static UsersDto toListDto(Users users){

        List<String> btnActions = new ArrayList<>();
        btnActions.add("EDIT");
        if (!users.getActivated().equals(UserStatus.QUIT)) {
                btnActions.add("RESIGN");
        }

        // 회원 구분
        String roleName = "-";
        if (users.getRole() !=null) {
            roleName = users.getRole().getName();
        }

        return UsersDto.builder()
                .id(users.getId())
                .login(users.getLogin())
                .name(users.getName())
                .email(users.getEmail())
                .mobile(users.getMobile())
                .roleName(roleName)
                .zipcode(users.getZipcode())
                .address(users.getAddress())
                .sex(users.getSex())
                .birthday(users.getBirthday())
                .activated(users.getActivated())
                .createdAt(users.getCreatedAt().toLocalDate().toString()+ " " + users.getCreatedAt().toLocalTime().toString())
                .updatedAt(users.getUpdatedAt().toLocalDate().toString()+ " " + users.getUpdatedAt().toLocalTime().toString())
                .btnActions(btnActions)
                .build();
    }

    // 권한관리 > 사용자별 권한 관리 사용자 목록 정보
    public static UsersDto toManageUserPermission(Users users){
        // 역활명
        String roleName = "-";
        if (users.getRole() !=null) {
            roleName = users.getRole().getName();
        }

        return UsersDto.builder()
                .id(users.getId())
                .name(users.getName())
                .roleName(roleName)
                .build();
    }

}
