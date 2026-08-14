package com.paramount.pmx.model.response;

import lombok.*;

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