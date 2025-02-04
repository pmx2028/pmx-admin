package com.paramount.pmx.utils;

import java.util.Iterator;

import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.domain.Sort.Order;

public class SpecUtils {
    // Sort에 새로운 Sort를 추가하는 function (기존에 존재하는 경우 무시)
    public static Sort addSortDistinct (Sort sort, Direction direction, String properties) {
        boolean containFlag = false;
        for (Iterator<Order> it = sort.iterator(); it.hasNext(); ) {
            Order order = it.next();
            //log.info(order.getProperty() + "," +order.getDirection());
            if(properties.equals(order.getProperty())){
                containFlag = true;
            }
        }
        if(!containFlag) {
            sort = sort.and(Sort.by(direction,properties));
        }
        return sort;
    }
}
