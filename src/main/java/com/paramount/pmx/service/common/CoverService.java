package com.paramount.pmx.service.common;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.paramount.pmx.model.photo.Cover;
import com.paramount.pmx.model.photo.CoverDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.photo.CoverRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.utils.ImageIOUtils;
import com.paramount.pmx.utils.S3UploadResultDto;
import com.paramount.pmx.utils.S3UrlHelper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoverService {

    private final CoverRepository coverRepository;
    private final S3StorageService s3StorageService;
    private final ObjectMapper objectMapper;


    @Value("${cloud.aws.s3.url}")
    private String s3Url;

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    private boolean isGifExt(String ext) {
        return ".gif".equalsIgnoreCase(ext);
    }

    private void saveIdenticalVariants(byte[] bytes, String baseKey, String ext, String contentType) throws IOException {
        s3StorageService.s3FileBtesSave(bytes, baseKey + "original" + ext, contentType);
        s3StorageService.s3FileBtesSave(bytes, baseKey + "thumb" + ext, contentType);
        s3StorageService.s3FileBtesSave(bytes, baseKey + "medium" + ext, contentType);
        s3StorageService.s3FileBtesSave(bytes, baseKey + "small" + ext, contentType);
    }

    private Map<String, Long> buildUniformFilesize(long size) {
        Map<String, Long> filesize = new LinkedHashMap<>();
        filesize.put("original", size);
        filesize.put("thumb", size);
        filesize.put("medium", size);
        filesize.put("small", size);
        return filesize;
    }

    private Map<String, String> buildUniformDimensions(String dimension) {
        Map<String, String> dimensions = new LinkedHashMap<>();
        dimensions.put("original", dimension);
        dimensions.put("thumb", dimension);
        dimensions.put("medium", dimension);
        dimensions.put("small", dimension);
        return dimensions;
    }

    @Transactional
    public ResponseDto create(MultipartFile file, CustomUserDetails userDetails) {

        // 1) S3 업로드 + 메타 생성
        S3UploadResultDto s3 = coverUploadToS3(file, "covers");

        // 2) DB 저장
        Cover cover = Cover.builder()
                .userId(userDetails.getId())
                .hashkey(s3.hashkey())
                .originalFilename(s3.originalFilename())
                .filename(s3.filename())
                .contentType(s3.contentType())
                .filesize(s3.filesizeJson())
                .dimensions(s3.dimensionsJson())
                .positions(null)
                .details(s3.detailsJson())
                .colors(s3.colorsJson())
                .extUrl(s3.originalKey())   // originalKey 그대로 저장
                .revision(0)
                .articlesCount(0)
                .keywords(null)
                .build();

        coverRepository.save(cover);

        // 3) 응답 DTO
        CoverDto coverDto = CoverDto.builder()
                .id(cover.getId())
                .url(s3Url + "/" + s3.thumbKey()) // 썸네일 URL
                .originalUrl(s3Url + "/" + s3.originalKey())
                .thumbUrl(s3Url + "/" + s3.thumbKey())
                .mediumUrl(s3Url + "/" + s3.mediumKey())
                .title(s3.filename())
                .hashkey(s3.hashkey())
                .build();
        return Response.ok(coverDto);

    }

    public  ResponseDto getCoverDetail(Long coverId, CustomUserDetails userDetails) {
        Cover cover = coverRepository.findById(coverId)
                .orElseThrow(() -> new RuntimeException("cover not found"));

        CoverDto coverDto = CoverDto.builder()
                .id(cover.getId())
                .fileName(cover.getOriginalFilename())
                .url(S3UrlHelper.getCoverOriginalUrl(cover.getExtUrl())) // 썸네일 URL
                .hashkey(cover.getHashkey())
                .build();

        return Response.ok(coverDto);
    }


    // 업로드 유틸 함수
    public S3UploadResultDto coverUploadToS3(MultipartFile file, String folderName) {

        // 파일 존재 여부/비어있는지 검증
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        // 1) 기본 키/파일 정보 세팅
        String hk = UUID.randomUUID().toString().replace("-", "");

        String baseKey = buildBaseKey(folderName, hk); // 기존 서비스에서 쓰던 거 그대로 사용
        String originalFilename = file.getOriginalFilename();
        String ext = ImageIOUtils.extOf(originalFilename);
        if (ext.isEmpty()) {
            ext = ".jpg"; // 확장자 없으면 JPEG 로 저장
        }
        String contentType = ImageIOUtils.contentTypeOfExt(ext);
        String filename = System.currentTimeMillis() + ext;
        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            throw new IllegalArgumentException("파일 바이트를 읽을 수 없습니다.", e);
        }
        boolean isGif = isGifExt(ext);

        // 2) 원본 로딩
        // BufferedImage 변환 시 에러/지원하지 않는 포맷 처리
        BufferedImage original;
        try {
            original = ImageIOUtils.readToBufferedImage(fileBytes);
        } catch (Exception e) {
            log.error("이미지 파일을 BufferedImage로 읽는 중 오류 발생. filename={}, contentType={}",
                    originalFilename, file.getContentType(), e);
            throw new IllegalArgumentException("이미지 파일을 읽는 중 오류가 발생했습니다. 파일을 확인해 주세요.");
        }

        if (original == null) {
            log.warn("지원하지 않는 이미지 포맷 또는 손상된 파일 업로드. filename={}, contentType={}",
                    originalFilename, file.getContentType());
            throw new IllegalArgumentException("지원하지 않는 이미지 형식이거나 손상된 파일입니다.");
        }

        try {
            int w = original.getWidth();
            int h = original.getHeight();
            int frameCount = isGif ? ImageIOUtils.frameCountOf(fileBytes) : 1;

            // === original ===
            String originalKey = baseKey + "original" + ext;
            String thumbKey = baseKey + "thumb" + ext;
            String mediumKey = baseKey + "medium" + ext;
            String smallKey = baseKey + "small" + ext;
            byte[] originalBytes;
            byte[] thumbBytes;
            byte[] mediumBytes;
            byte[] smallBytes;
            BufferedImage thumb;
            BufferedImage medium;
            BufferedImage small;

            if (isGif) {
                saveIdenticalVariants(fileBytes, baseKey, ext, contentType);
                originalBytes = fileBytes;
                thumbBytes = fileBytes;
                mediumBytes = fileBytes;
                smallBytes = fileBytes;
                thumb = original;
                medium = original;
                small = original;
            } else {
                originalBytes = ImageIOUtils.writeByExt(original, ext, 0.92f);
                s3StorageService.s3FileBtesSave(originalBytes, originalKey, contentType);

                // === thumb(755) ===
                thumb = ImageIOUtils.resizeKeepRatio(original, 755);
                thumbBytes = ImageIOUtils.writeByExt(thumb, ext, 1.0f);
                s3StorageService.s3FileBtesSave(thumbBytes, thumbKey, contentType);

            // === medium(420) ===
            // BufferedImage medium;
            // try {
            //     Mat mat = ImageIOUtils.toMatBGR(original);
            //     //Rect face = faceCropService.detectLargestFace(mat); //큰인물 기준
            //     Rect face = faceCropService.detectDominantFocusedFace(mat);
            //     if (face != null) {
            //
            //         // 디버그 박스 저장( 얼굴 저장 이미지 확인용)
            //         /**
            //          Mat dbg = mat.clone();
            //          Imgproc.rectangle(dbg, face, new Scalar(0, 255, 0), 2);
            //          String ts = "debug_face_box_" + System.currentTimeMillis() + ".jpg";
            //          Imgcodecs.imwrite(ts, dbg);
            //          System.out.println("face=" + face);
            //          System.out.println(new java.io.File(ts).getAbsolutePath());
            //          */
            //
            //         // 상단 편향 정사각 크롭
            //         //Rect r = faceCropService.squareCropAroundFace(mat, face, 0.30); //
            //         //사람이 함명인경우와 사람한명이 포커스일경우
            //         Rect r = faceCropService.squareCropUpperBody(mat, face, 2.8, 0.45); //
            //         Rectangle rr = new Rectangle(r.x, r.y, r.width, r.height);
            //         BufferedImage cropped = ImageIOUtils.crop(original, rr);
            //         medium = ImageIOUtils.resizeExact(cropped, 420, 420);
            //     } else {
            //         medium = ImageIOUtils.resizeKeepRatio(original, 420);
            //     }
            // } catch (Throwable t) {
            //     // 실패 시 일반 리사이즈
            //     medium = ImageIOUtils.resizeKeepRatio(original, 420);
            // }

                medium = ImageIOUtils.resizeKeepRatio(original, 420);
                mediumBytes = ImageIOUtils.writeByExt(medium, ext, 1.0f);
                s3StorageService.s3FileBtesSave(mediumBytes, mediumKey, contentType);


                // === small(80) ===
                small = ImageIOUtils.resizeKeepRatio(original, 80);
                smallBytes = ImageIOUtils.writeByExt(small, ext, 1.0f);
                s3StorageService.s3FileBtesSave(smallBytes, smallKey, contentType);
            }

            // 3) 메타 JSON 생성
            Map<String, Long> filesize = isGif
                    ? buildUniformFilesize(originalBytes.length)
                    : new LinkedHashMap<>();
            if (!isGif) {
                filesize.put("original", (long) originalBytes.length);
                filesize.put("thumb", (long) thumbBytes.length);
                filesize.put("medium", (long) mediumBytes.length);
                filesize.put("small", (long) smallBytes.length);
            }
            String filesizeJson = objectMapper.writeValueAsString(filesize);

            Map<String, String> dimensions = isGif
                    ? buildUniformDimensions(ImageIOUtils.dimStr(original))
                    : new LinkedHashMap<>();
            if (!isGif) {
                dimensions.put("original", ImageIOUtils.dimStr(original));
                dimensions.put("thumb", ImageIOUtils.dimStr(thumb));
                dimensions.put("medium", ImageIOUtils.dimStr(medium));
                dimensions.put("small", ImageIOUtils.dimStr(small));
            }
            String dimensionsJson = objectMapper.writeValueAsString(dimensions);

            Map<String, Object> details = new LinkedHashMap<>();
            details.put("ratio", h / (double) w * 100.0);           // Ruby 동일 식
            details.put("type", ext.replace(".", "").toUpperCase()); // PNG/JPG/WEBP
            details.put("frames", frameCount);
            details.put("mime_type", contentType);
            details.put("shape", ImageIOUtils.shape(w, h));
            String detailsJson = objectMapper.writeValueAsString(details);

            Map<String, Object> colors = ImageIOUtils.dominantColor(original);
            String colorsJson = objectMapper.writeValueAsString(colors);

            return new S3UploadResultDto(
                    hk,
                    originalFilename,
                    filename,
                    contentType,
                    ext,
                    originalKey,
                    thumbKey,
                    mediumKey,
                    smallKey,
                    filesizeJson,
                    dimensionsJson,
                    detailsJson,
                    colorsJson
            );
        } catch (Exception e) {
            // writeByExt, s3FileBtesSave, writeValueAsString 등에서 발생하는 예외 한 번에 처리
            log.error("이미지 업로드 처리 중 오류 발생. filename={}, contentType={}",
                    originalFilename, contentType, e);
            throw new RuntimeException("이미지 업로드 처리 중 오류가 발생했습니다.", e);
        }
    }

    private String buildBaseKey(String baseFolderName, String hashkey) {
        String datePath = LocalDate.now().format(
                DateTimeFormatter.ofPattern(isProdProfile() ? "yyyy/MM/dd" : "yyyy'-dev'/MM/dd")
        );
        return baseFolderName + "/" + datePath  + "/" + hashkey + "/";
    }

    private boolean isProdProfile() {
        if (activeProfiles == null || activeProfiles.isBlank()) return false;
        return Arrays.stream(activeProfiles.split(","))
                .map(String::trim)
                .anyMatch(p -> p.equalsIgnoreCase("prod"));
    }



    /**
     * 운영에서는 Jackson ObjectMapper로 정확하게 파싱하세요.
     * 지금은 “Ruby rescue 무시” 처럼, 대충 뽑아오다 실패해도 전체 로직이 죽지 않게 최소화한 예시입니다.
     */
    static class JsonMini {
        static String pick(String json, String key) {
            // 아주 단순한 "key":"value" 추출 (정확도 낮음)
            Pattern p = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"(.*?)\"");
            Matcher m = p.matcher(json);
            return m.find() ? unescape(m.group(1)) : null;
        }
        static String unescape(String s) {
            return s.replace("\\n", "\n").replace("\\\"", "\"").replace("\\/", "/");
        }
    }

}
