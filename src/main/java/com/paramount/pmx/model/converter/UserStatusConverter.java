package com.paramount.pmx.model.converter;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

import com.paramount.pmx.model.enums.UserStatus;

@Converter
public class UserStatusConverter implements AttributeConverter<UserStatus, String> {

    @Override
    public String convertToDatabaseColumn(UserStatus attribute) {
        return attribute.getCode();
    }

    @Override
    public UserStatus convertToEntityAttribute(String dbData) {
        return UserStatus.ofCode(dbData);
    }

}
