package com.paramount.pmx.model.setting;

import lombok.*;
import lombok.experimental.Accessors;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@ToString
@Accessors(chain = true)
public class KrxesDto {
    private Long id;                    //krx ID
    private String name;                //krx 이름
    private String code;                //krx 코드
    private String kindof;              //krx 종류 (상장시장)
    private String createdAt;           //등록일자
    private String updatedAt;           //수정일자

    //dummy
    private String kindofUpper;         //상장시장 대문자

    public static KrxesDto toDto(Krxes krxes){
        return KrxesDto.builder()
            .id(krxes.getId())
            .name(krxes.getName())
            .code(krxes.getCode())
            .kindof(krxes.getKindof())
            .kindofUpper(krxes.getKindof().toUpperCase())
            .updatedAt(krxes.getUpdatedAt().toLocalDate().toString() + " " + krxes.getUpdatedAt().toLocalTime().toString())
            .build();
    }
}
