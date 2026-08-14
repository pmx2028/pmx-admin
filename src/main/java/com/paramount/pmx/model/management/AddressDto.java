package com.paramount.pmx.model.management;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AddressDto {
    private Long id;
    private String code;
    private Long parentId;
    private String name;
    private Integer depth;
    private String type;
    private String useYn;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AddressDto> children;

    public static AddressDto from(Address division) {
        if (division == null) {
            return null;
        }
        return AddressDto.builder()
                .id(division.getId())
                .code(division.getCode())
                .parentId(division.getParentId())
                .name(division.getName())
                .depth(division.getDepth())
                .type(division.getType())
                .useYn(division.getUseYn())
                .sortOrder(division.getSortOrder())
                .createdAt(division.getCreatedAt())
                .updatedAt(division.getUpdatedAt())
                .build();
    }

    public static AddressDto fromWithChildren(Address division) {
        AddressDto dto = from(division);
        if (dto == null) {
            return null;
        }

        dto.setChildren(
                division.getChildren() == null
                        ? List.of()
                        : division.getChildren().stream()
                                .map(AddressDto::fromWithChildren)
                                .toList()
        );
        return dto;
    }
}
