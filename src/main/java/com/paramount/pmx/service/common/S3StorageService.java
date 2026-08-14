package com.paramount.pmx.service.common;


import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3StorageService {

    @Value("${cloud.aws.region.static}")
    private String region;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    private final S3Client s3Client;


    public void s3FileSave(MultipartFile file ,String key ,String contentType ) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("empty file");
        // 업로드
        PutObjectRequest req = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                // 퍼블릭 접근이 필요하면 ACL 지정. 버킷 정책 또는 OAI/OPA 사용 시 제거 가능.
                .acl(ObjectCannedACL.PUBLIC_READ)
                .build();
        s3Client.putObject(req, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

    }

    public void s3FileBtesSave(byte[] bytes ,String key , String contentType) throws IOException {
        if (bytes == null || bytes.length == 0) {
            throw new IllegalArgumentException("bytes is empty");
        }
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("key is blank");
        }
        if (key.startsWith("/")) key = key.substring(1);
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        PutObjectRequest req = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                // 퍼블릭 접근이 필요하면 ACL 지정. 버킷 정책 또는 OAI/OPA 사용 시 제거 가능.
                .acl(ObjectCannedACL.PUBLIC_READ)
                .build();
        s3Client.putObject(req, RequestBody.fromBytes(bytes));
    }

    public Instant getFileLastModified(String key) {
        if (key == null || key.isBlank()) {
            return null;
        }

        if (key.startsWith("/")) {
            key = key.substring(1);
        }

        try {
            HeadObjectResponse response = s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build()
            );
            return response.lastModified();
        } catch (NoSuchKeyException e) {
            return null;
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                return null;
            }
            throw e;
        }
    }

    public List<S3Object> listObjects(String prefix) {
        if (prefix == null || prefix.isBlank()) {
            return List.of();
        }

        if (prefix.startsWith("/")) {
            prefix = prefix.substring(1);
        }

        List<S3Object> objects = new ArrayList<>();
        String continuationToken = null;

        do {
            ListObjectsV2Request.Builder requestBuilder = ListObjectsV2Request.builder()
                    .bucket(bucket)
                    .prefix(prefix);

            if (continuationToken != null) {
                requestBuilder.continuationToken(continuationToken);
            }

            ListObjectsV2Response response = s3Client.listObjectsV2(requestBuilder.build());
            if (response.contents() != null && !response.contents().isEmpty()) {
                objects.addAll(response.contents());
            }

            continuationToken = response.nextContinuationToken();
        } while (continuationToken != null);

        return objects;
    }


    public ResponseDto upload(MultipartFile[] files , String filePath) throws IOException {
        List<Map<String, String>> resultFiles = new ArrayList<>();
        String hashkey = UUID.randomUUID().toString().replace("-", "");
        String finalPath = StringUtils.isNotBlank(filePath)
                ? ("/regs/program".equals(filePath) ? filePath : filePath + "/" + hashkey)
                : "/regs/" + hashkey;

        int i = 1;
        for (MultipartFile file : files) {
            String originalFileName = file.getOriginalFilename();
            String extension = FilenameUtils.getExtension(originalFileName).toLowerCase();
            String fileName = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "_" + i + "." + extension;
            String mimeType = new Tika().detect(file.getInputStream());

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(finalPath + "/" + fileName)
                    .contentType(mimeType)
                    .acl(ObjectCannedACL.PUBLIC_READ)
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            Map<String, String> resultFile = new HashMap<>();
            resultFile.put("newFileName", fileName);
            resultFile.put("originalFileName", originalFileName);
            resultFile.put("size", String.valueOf(file.getSize()));
            resultFile.put("extension", extension);
            resultFile.put("hashkey", hashkey);
            resultFile.put("filePath", finalPath);
            resultFile.put("fullUrl", String.format("https://%s.s3.%s.amazonaws.com/%s/%s", bucket, region, finalPath, fileName));

            resultFiles.add(resultFile);
            log.info(i + "번째 파일 업로드 : {}", resultFile);
            i++;
        }

        return Response.ok(resultFiles);
    }

    //파일 삭제
    public ResponseDto delete(String path, String key ) {
        Boolean result = true;
        String fullKey = StringUtils.isNotBlank(path) ? path + "/" + key : key;
        // 먼저 HeadObject로 존재 여부 확인
        try {
            s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(bucket)
                    .key(fullKey)
                    .build());
        } catch (S3Exception e) {
            log.error("파일이 존재하지 않습니다: {}/{}", bucket, fullKey);
            return Response.ok(false);
        }

        try {
            // 실제 삭제 요청
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(fullKey)
                    .build());
            log.info("S3 파일 삭제 성공: {}/{}", bucket, fullKey);
            return Response.ok(true);



        } catch (S3Exception  e) {
            // The call was transmitted successfully, but Amazon S3 couldn't process 
            // it, so it returned an error response.
            //e.printStackTrace();
            log.error("S3 파일 삭제 중 오류 발생." + e);
            return Response.ok(false);
        }

    }

    //파일 다운로드(db에 저장되어 있는 파일)
    public ResponseEntity<?> download(String extUrl, String downloadFilename) {
        try {
            // 1. 파일 존재 여부 확인
            s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(bucket)
                    .key(extUrl)
                    .build());

            // 2. 파일 다운로드
            ResponseBytes<?> objectBytes = s3Client.getObjectAsBytes(
                    GetObjectRequest.builder()
                            .bucket(bucket)
                            .key(extUrl)
                            .build()
            );

            // 3. 헤더 설정
            String encoded = URLEncoder.encode(downloadFilename, StandardCharsets.UTF_8)
                    .replaceAll("\\+", "%20");

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + encoded + "\"; filename*=UTF-8''" + encoded);
            headers.add(HttpHeaders.CONTENT_TYPE, "application/octet-stream");

            return new ResponseEntity<>(objectBytes.asByteArray(), headers, HttpStatus.OK);

        } catch (NoSuchKeyException e) {
            log.error("파일이 존재하지 않음: {}/{}", bucket, extUrl);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Response.error("파일을 찾을 수 없습니다."));
        } catch (Exception e) {
            log.error("파일 다운로드 오류", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Response.error("파일 다운로드 중 오류가 발생했습니다."));
        }
    }

} 

