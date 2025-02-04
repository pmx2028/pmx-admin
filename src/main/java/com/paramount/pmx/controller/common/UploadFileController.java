package com.paramount.pmx.controller.common;

import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.service.common.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Controller
public class UploadFileController {
    @Autowired
    private S3Service s3Service;

    //파일  업로드
    @PostMapping(value = "/common/fileUpload", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> fileUpload(
        @RequestParam MultipartFile[] addFile,
        @RequestParam(required = false) String filePath
    ) throws IOException {
        try {
            return new ResponseEntity<>(
                s3Service.upload(addFile , filePath ),
                HttpStatus.OK
            );
        } catch (MaxUploadSizeExceededException e) {
            return new ResponseEntity<>(
                null,
                HttpStatus.OK
            );
        }
    }

    //파일 삭제
    @PostMapping(value = "/common/fileDelete", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ResponseDto> fileDelete(String path, String fileName ) {
        return new ResponseEntity<>(
            s3Service.delete(path, fileName ),
            HttpStatus.OK
        );
    }

    // //파일 다운로드
    // @GetMapping(value = "/clips/{id}/download", produces = { MediaType.APPLICATION_JSON_VALUE })
    // public void clipFileDownload(
    //       @PathVariable(required = false) Long id,
    //       HttpServletRequest request,
    //       HttpServletResponse response
    // ) throws IOException {
    //         companyService.clipsFileDownload(id, request, response);
    // }
}
