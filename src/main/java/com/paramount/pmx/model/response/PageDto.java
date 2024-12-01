package com.paramount.pmx.model.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class PageDto {
    private int nowPageNo;    //페이지번호
    private int pageSize;        //페이지크기
    private long totalCount;    //전체 행의 갯수
    private long totalPage;    //전체 페이지 수

    private int pageBlockSize;    //네비게이션에 보여줄 페이지 수
    private long minPageNumber;    //시작 페이지 번호
    private long maxPageNumber;    //끝 페이지 번호
    private long prevPageNumber;    //이전 페이지 번호
    private long nextPageNumber;    //다음 페이지 번호
    private long firstPageNumber;    //첫목록
    private long lastPageNumber;    //끝목록
}

