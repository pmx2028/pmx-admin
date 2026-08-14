package com.paramount.pmx.controller.api;

import com.paramount.pmx.service.common.S3StorageService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@Slf4j
@AllArgsConstructor
public class FileDownloadController {

    private S3StorageService s3StorageService;
    /**
     * S3 파일 다운로드 API
     * 예시: GET /api/files/download?key=clips/abcd/1234.docx&filename=고충처리보고서.docx
     */
    @GetMapping("/api/files/download")
    public ResponseEntity<?> downloadFile(
            @RequestParam("key") String key,
            @RequestParam("filename") String filename
    ) throws IOException {
        return s3StorageService.download(key, filename);
    }
}
