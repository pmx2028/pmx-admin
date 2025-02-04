package com.paramount.pmx.controller.setting;

import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.service.setting.KrxesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/setting")
public class SettingController {

    @Autowired
    private KrxesService krxesService;

    //프로그램 사용중 리스트
    @GetMapping(value = "/krxes/list", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> krxesNameListAjax(@RequestParam String krxeName) {
        ResponseDto responseDto = krxesService.getKrxesNameListAjax(krxeName);
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }
}
