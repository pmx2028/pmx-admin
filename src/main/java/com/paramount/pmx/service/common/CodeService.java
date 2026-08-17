package com.paramount.pmx.service.common;

import com.paramount.pmx.model.enums.CategoryCode;
import com.paramount.pmx.model.enums.UserRole;
import com.paramount.pmx.model.enums.WeekdayCode;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodeService {

    public ResponseDto getWeekdayCodes() {
        return Response.ok(Arrays.stream(WeekdayCode.values())
                .map(code -> Map.of(
                        "id", code.getCode(),
                        "name", code.getDescription()
                ))
                .toList());
    }

    public ResponseDto getUserRoles() {
        return Response.ok(Arrays.stream(UserRole.values())
                .map(role -> Map.of(
                        "id", role.getCode(),
                        "name", role.getDescription(),
                        "code", role.name()
                ))
                .toList());
    }

    public ResponseDto getCategoryCodes() {
        return Response.ok(Arrays.stream(CategoryCode.values())
                .map(code -> Map.of(
                        "id", code.getCode(),
                        "name", code.getDescription(),
                        "code", code.name()
                ))
                .toList());
    }
}
