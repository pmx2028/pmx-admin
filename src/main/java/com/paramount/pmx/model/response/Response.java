package com.paramount.pmx.model.response;


public class Response {

    // 일반 ResponseDto
    public static ResponseDto ok(final Object data) {
        return ResponseDto.builder().data(data).success(true).message("").build();
    }

    // datatable용 ResponseDto
    public static ResponseDto ok(final Object data, int draw, long recordsTotal, long recordsFiltered) {
        return ResponseDto.builder().data(data).success(true).draw(draw).recordsTotal(recordsTotal).recordsFiltered(recordsFiltered).message("").build();
    }

    public static ResponseDto error(final String message) {
        return ResponseDto.builder().data(null).success(false).message(message).build();
    }

}
