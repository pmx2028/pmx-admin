package com.paramount.pmx.utils;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;

public class DateUtils {
    //type에 따라 날짜 사이 구하기. (end 불포함)
    public static Long dateDiff(String start, String end, String type) {
        DateFormat format = new SimpleDateFormat("yyyyMMdd");
        Long result = 0L;
        try {
            Date toDate = format.parse(start.replace("-",""));
            Date fromDate = format.parse(end.replace("-",""));
    
            Long baseHour = (long) (60 * 60 * 1000);         // 시
            Long baseDay = 24 * baseHour; 	        // 일
            Long baseMonth = baseDay * 30;		    // 월
            Long baseYear = baseMonth * 12;		    // 년
            // from 일자와 to 일자의 시간 차이를 계산한다.
            Long calDate = fromDate.getTime() - toDate.getTime();

            if (type.equals("HOURS")){
                result = calDate / baseHour;
            }

            if (type.equals("DAYS")){
                result = calDate / baseDay;
            }

            if (type.equals("MONTHS")){
                result = calDate / baseMonth;
            }

            if (type.equals("YEARS")){
                result = calDate / baseYear;
            }

        } catch (Exception e) {
		}

        return result;
    }

    //type에 따라 날짜 사이 구하기.(end 날짜 포함)
    public static Long dateDiffPlus(String start, String end, String type, Long dummy) {
        DateFormat format = new SimpleDateFormat("yyyyMMdd");
        Long result = 0L;
        try {
            Date toDate = format.parse(start.replace("-",""));
            Date fromDate = format.parse(end.replace("-",""));
    
            Long baseHour = (long) (60 * 60 * 1000);         // 시
            Long baseDay = 24 * baseHour; 	        // 일
            Long baseMonth = baseDay * 30;		    // 월
            Long baseYear = baseMonth * 12;		    // 년
            // from 일자와 to 일자의 시간 차이를 계산한다.
            Long calDate = fromDate.getTime() - toDate.getTime();

            if (type.equals("HOURS")){
                result = calDate / baseHour;
            }

            if (type.equals("DAYS")){
                result = calDate / baseDay;
            }

            if (type.equals("MONTHS")){
                result = calDate / baseMonth;
            }

            if (type.equals("YEARS")){
                result = calDate / baseYear;
            }

        } catch (Exception e) {
		}

        return result + dummy;
    }

    // //두날짜사이 잔여일수, 잔여시간 구하기.
    // public static Long hourDayDiff(String start, String end, String type){
    //     Long result = 0L;
    //     LocalDate startDt = LocalDate.parse(start);
    //     LocalDate endDt = LocalDate.parse(end);

    //     if (type.equals("HOURS")){
    //             result = (Long) Duration.between
    //                         (
    //                                 startDt.atStartOfDay()
    //                             , endDt.plusDays(1).atStartOfDay()
    //                         ).toHours();
    //     }

    //     if (type.equals("DAYS")){
    //         result = (Long) Duration.between
    //                         (
    //                                 startDt.atStartOfDay()
    //                             , endDt.plusDays(1).atStartOfDay()
    //                         ).toDays();
    //     }
        
    //     return result;
    // }

    //LocalDate -> LocalDateTime으로 변경
    public static LocalDateTime dateToDateTime (LocalDate date, String type){

        LocalDateTime dateTime = LocalDateTime.now();

        if (type.equals("START")){
            dateTime = LocalDateTime.of(date, LocalTime.of(00, 00, 00, 000000));
        }

        if (type.equals("END")){
            dateTime = LocalDateTime.of(date, LocalTime.of(23, 59, 59, 999999));

        }
        return dateTime;
    }
}
