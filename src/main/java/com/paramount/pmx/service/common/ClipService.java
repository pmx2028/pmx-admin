package com.paramount.pmx.service.common;

import com.paramount.pmx.model.management.Clip;
import com.paramount.pmx.model.management.ClipDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.management.ClipRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.utils.ImageIOUtils;
import com.paramount.pmx.utils.S3UploadResultDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClipService {

    private final S3StorageService s3StorageService;
    private final ClipRepository clipRepository;

    @Value("${cloud.aws.s3.url}")
    private String s3Url;

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    @Transactional
    public ResponseDto create(MultipartFile file, CustomUserDetails userDetails) {

        // 1) S3 업로드 + 메타 생성
        S3UploadResultDto s3 = clipUploadToS3(file, "clips");

        // 2) DB 저장
        Clip clip = Clip.builder()
                .userId(userDetails.getId())
                .hashkey(s3.hashkey())
                .originalFilename(s3.originalFilename())
                .filename(s3.filename())
                .contentType(s3.contentType())
                .filesize(s3.filesizeJson())
                .extUrl(s3.originalKey())
                .build();

        clipRepository.save(clip);

        return Response.ok(ClipDto.from(clip));
    }

    public S3UploadResultDto clipUploadToS3(MultipartFile file, String folderName) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        String originalFilename = file.getOriginalFilename();
        String ext = ImageIOUtils.extOf(originalFilename);  // 그냥 문자열 처리용
        String contentType = file.getContentType();         // null 가능

        String storedFilename = System.currentTimeMillis() + ext;

        // yyyy/MM/dd/hashkey/
        String hk = UUID.randomUUID().toString().replace("-", "");
        String keyPrefix = buildBaseKey(folderName, hk);
        String fileKey = keyPrefix + storedFilename;

        try {
            byte[] bytes = file.getBytes();
            long filesize = bytes.length;

            // S3 업로드
            s3StorageService.s3FileBtesSave(bytes, fileKey, contentType);

            // 필요한 메타만 반환
            return S3UploadResultDto.builder()
                    .hashkey(hk)
                    .originalFilename(originalFilename)
                    .filename(storedFilename)
                    .contentType(contentType)
                    .filesizeJson(String.valueOf(filesize))
                    .originalKey(fileKey)
                    .thumbKey(fileKey)
                    .build();

        } catch (Exception e) {
            log.error("파일 업로드 중 오류 발생. filename={}, contentType={}", originalFilename, contentType, e);
            throw new RuntimeException("파일 업로드 처리 중 오류가 발생했습니다.", e);
        }
    }

    private String buildBaseKey(String baseFolderName, String hashkey) {
        //운영과 개발이 같은 버킷일경우 사용
//        String datePath = LocalDate.now().format(
//        DateTimeFormatter.ofPattern(isProdProfile() ? "yyyy/MM/dd" : "yyyy'-dev'/MM/dd"));

        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        return baseFolderName + "/" + datePath  + "/" + hashkey + "/";
    }

    private boolean isProdProfile() {
        if (activeProfiles == null || activeProfiles.isBlank()) return false;
        return Arrays.stream(activeProfiles.split(","))
                .map(String::trim)
                .anyMatch(p -> p.equalsIgnoreCase("prod"));
    }
}
