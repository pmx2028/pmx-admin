package com.paramount.pmx.utils;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import java.beans.PropertyDescriptor;


import java.util.HashSet;
import java.util.Set;

public class BeanUtil {
    /**
     * source 객체에서 값이 null인 프로퍼티 이름만 모아서 리턴
     */
    public static String[] getNullPropertyNames(Object source) {
        BeanWrapper wrapped = new BeanWrapperImpl(source);
        PropertyDescriptor[] pds = wrapped.getPropertyDescriptors();

        Set<String> emptyNames = new HashSet<>();
        for (PropertyDescriptor pd : pds) {
            // getPropertyValue() 호출 가능한 프로퍼티만 검사
            Object value = wrapped.getPropertyValue(pd.getName());
            if (value == null) {
                emptyNames.add(pd.getName());
            }
        }
        String[] result = new String[emptyNames.size()];
        return emptyNames.toArray(result);
    }

    /**
     * dto → entity 복사하면서 dto의 null 프로퍼티는 무시
     */
    public static <T> void copyNonNullProperties(Object src, T target) {
        String[] nullProps = getNullPropertyNames(src);
        BeanUtils.copyProperties(src, target, nullProps);
    }
}
