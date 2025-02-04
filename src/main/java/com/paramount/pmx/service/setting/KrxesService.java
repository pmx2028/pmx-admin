package com.paramount.pmx.service.setting;

import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.model.setting.KrxesDto;
import com.paramount.pmx.repository.setting.KrxesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

@Service
public class KrxesService {


    @Autowired
    private KrxesRepository krxesRepository;

    //프로그램 리스트(responseDto 전송 - ajax용)
    public ResponseDto getKrxesNameListAjax(String krxeName){
        return Response.ok(
                krxesRepository.findAllByNameStartingWithOrderByNameAsc(krxeName)
                        .stream()
                        .map(e-> KrxesDto.toDto(e))
                        .collect(Collectors.toList())
        );
    }
}
