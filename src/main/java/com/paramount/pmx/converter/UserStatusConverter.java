package com.paramount.pmx.converter;


import com.paramount.pmx.model.enums.UserStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

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
