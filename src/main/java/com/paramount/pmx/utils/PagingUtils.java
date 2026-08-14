package com.paramount.pmx.utils;

import com.paramount.pmx.model.response.PageDto;

public class PagingUtils {
    public static PageDto pageList(Integer nowPageNo, Long totalCount, int pageListSize, int pageBlockSize){

        PageDto pageDto = new PageDto();
        pageDto.setNowPageNo(nowPageNo);
        pageDto.setTotalCount(totalCount);
        pageDto.setPageSize(pageListSize);
        pageDto.setTotalPage((long)Math.ceil((double)totalCount/(double)pageListSize));
        pageDto.setPageBlockSize(pageBlockSize);

        double minPageNo;
        if(nowPageNo % pageBlockSize == 0){
            minPageNo = Math.floor((double)nowPageNo / pageBlockSize) * pageBlockSize - (pageBlockSize-1);
        }else{
            minPageNo = Math.floor((double)nowPageNo / pageBlockSize) * pageBlockSize + 1;
        }

        double pageCnt = Math.ceil((double)totalCount/(double)pageListSize) - minPageNo;

        if(pageCnt >= pageBlockSize){
            pageCnt = pageBlockSize - 1;
        } 

        double maxPageNo = minPageNo + pageCnt;

        pageDto.setMinPageNumber((long) minPageNo);
        pageDto.setMaxPageNumber((long) maxPageNo);
        if(nowPageNo <= pageBlockSize){
            pageDto.setPrevPageNumber(0);
            pageDto.setFirstPageNumber(0);
        } else{
            pageDto.setPrevPageNumber(pageDto.getMinPageNumber() - pageBlockSize);
            pageDto.setFirstPageNumber(1);
        }

        if(pageDto.getMinPageNumber() + pageBlockSize > pageDto.getTotalPage())
        {
            pageDto.setNextPageNumber(0);
            // pageDto.setLastPageNumber(0);
        }else{
            //this.nextPageNumber = this.maxPageNumber + 1;
            pageDto.setNextPageNumber(pageDto.getMaxPageNumber() + 1);
        }

        pageDto.setLastPageNumber(pageDto.getTotalPage());
        if (pageDto.getMaxPageNumber() <= 0){
            pageDto.setMaxPageNumber(1);
        }

        //범위 밖의 페이지 호출 시 << < nowPageNo > >>
        if(pageDto.getLastPageNumber()<nowPageNo || nowPageNo < pageDto.getFirstPageNumber()){
            pageDto.setPrevPageNumber(0);
            pageDto.setNextPageNumber(0);
            pageDto.setMinPageNumber(nowPageNo);
            pageDto.setMaxPageNumber(nowPageNo);
        }
        return pageDto;
    }
}
