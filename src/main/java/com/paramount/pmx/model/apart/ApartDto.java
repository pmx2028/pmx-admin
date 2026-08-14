package com.paramount.pmx.model.apart;

import com.paramount.pmx.model.enums.UsedYn;
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
public class ApartDto {

    private Long id;
    private Integer addressId;
    private String  addressName;
    private Integer addressId1;
    private String  addressName1;
    private String name;
    private Integer hosCnt;
    private Integer gxCnt;
    private Integer runCnt;
    private Integer wetCnt;
    private Integer inbyYn;
    private String inbyYnName;
    private Integer golfCnt;
    private Integer scrCnt;
    private Integer scrGolfCnt;
    private Long userId;
    private Integer activated;
    private String createdAt;
    private String updatedAt;
    private List<String> btnActions;

    public static ApartDto toDto(Apart apart) {
        return from(apart, false);
    }

    public static ApartDto toDetailDto(Apart apart) {
        return from(apart, false);
    }

    public static ApartDto toListDto(Apart apart) {
        return from(apart, true);
    }

    private static ApartDto from(Apart apart, boolean includeActions) {
        if (apart == null) {
            return null;
        }

        List<String> btnActions = new ArrayList<>();
        if (includeActions) {
            btnActions.add("EDIT");
            if (!Integer.valueOf(0).equals(apart.getActivated())) {
                btnActions.add("DELETE");
            }
        }
        String addressName = null;
        if (apart.getAddress() != null) {
            addressName = apart.getAddress().getName();
        }
        String addressName1 = null;
        if (apart.getAddress1() != null) {
            addressName1 = apart.getAddress1().getName();
        }

        return ApartDto.builder()
                .id(apart.getId())
                .addressId(apart.getAddressId())
                .addressName(addressName)
                .addressId1(apart.getAddressId1())
                .addressName1(addressName1)
                .name(apart.getName())
                .hosCnt(apart.getHosCnt())
                .gxCnt(apart.getGxCnt())
                .runCnt(apart.getRunCnt())
                .wetCnt(apart.getWetCnt())
                .inbyYn(apart.getInbyYn())
                .inbyYnName(getUsedYnDescription(apart.getInbyYn()))
                .golfCnt(apart.getGolfCnt())
                .scrCnt(apart.getScrCnt())
                .scrGolfCnt(apart.getScrGolfCnt())
                .userId(apart.getUserId())
                .activated(apart.getActivated())
                .createdAt(formatDateTime(apart.getCreatedAt()))
                .updatedAt(formatDateTime(apart.getUpdatedAt()))
                .btnActions(btnActions)
                .build();
    }

    private static String formatDateTime(LocalDateTime value) {
        return value == null ? null : value.toLocalDate() + " " + value.toLocalTime();
    }

    private static String getUsedYnDescription(Integer value) {
        if (value == null) {
            return null;
        }
        for (UsedYn usedYn : UsedYn.values()) {
            if (usedYn.getCode().equals(value.longValue())) {
                return usedYn.getDescription();
            }
        }
        return null;
    }
}
