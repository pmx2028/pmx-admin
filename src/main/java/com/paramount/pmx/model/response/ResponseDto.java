package com.paramount.pmx.model.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class ResponseDto {
    private boolean success;
    private int draw;
    private long recordsTotal;
    private long recordsFiltered;
    private String message;
    private Object data;
}
