package com.paramount.pmx.model.member;

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
public class MemberDto {

    private Long id;
    private String login;
    private String name;
    private String email;
    private String mobile;
    private Long apartId;
    private String apartName;
    private String address;
    private String zipcode;
    private String sex;
    private String birthday;
    private Integer confirmed;
    private Integer activated;
    private String createdAt;
    private String updatedAt;
    private List<String> btnActions;

    public static MemberDto toDto(Member member) {
        return from(member, false);
    }

    public static MemberDto toDetailDto(Member member) {
        return from(member, false);
    }

    public static MemberDto toListDto(Member member) {
        return from(member, true);
    }

    private static MemberDto from(Member member, boolean includeActions) {
        if (member == null) {
            return null;
        }

        List<String> btnActions = new ArrayList<>();
        if (includeActions) {
            btnActions.add("EDIT");
            if (!Integer.valueOf(1).equals(member.getConfirmed())) {
                btnActions.add("CONFIRMED");
            }
            if (!Integer.valueOf(0).equals(member.getActivated())) {
                btnActions.add("RESIGN");
            }
        }

        return MemberDto.builder()
                .id(member.getId())
                .login(member.getLogin())
                .name(member.getName())
                .email(member.getEmail())
                .mobile(member.getMobile())
                .apartId(member.getApartId())
                .apartName(member.getApart() == null ? null : member.getApart().getName())
                .address(member.getAddress())
                .zipcode(member.getZipcode())
                .sex(member.getSex())
                .birthday(member.getBirthday())
                .confirmed(member.getConfirmed())
                .activated(member.getActivated())
                .createdAt(formatDateTime(member.getCreatedAt()))
                .updatedAt(formatDateTime(member.getUpdatedAt()))
                .btnActions(btnActions)
                .build();
    }

    private static String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.toLocalDate() + " " + value.toLocalTime();
    }
}
