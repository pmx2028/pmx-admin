package com.paramount.pmx.service.common;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import javax.annotation.PostConstruct;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.internal.Mimetypes;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.amazonaws.util.IOUtils;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;

import org.apache.commons.io.FilenameUtils;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.NoArgsConstructor;

@Service
@NoArgsConstructor
public class S3Service {
    @Autowired
    private AmazonS3 s3Client;

    @Value("${cloud.aws.credentials.accessKey}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secretKey}")
    private String secretKey;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${cloud.aws.s3.bucket.regs}")
    private String bucketRegs;

    @Value("${cloud.aws.s3.bucket.xmls}")
    private String bucketXmls;

    @Value("${cloud.aws.region.static}")
    private String region;

    private final Logger logger = LoggerFactory.getLogger(getClass());

    @PostConstruct
    public void setS3Client() {

        AWSCredentials credentials = new BasicAWSCredentials(this.accessKey, this.secretKey);
        s3Client = AmazonS3ClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withRegion(this.region)
                .build();
    }

    //파일 업로드
    //public List<HashMap<String, String>> upload(MultipartFile[] files) throws IOException {
    public ResponseDto upload(MultipartFile[] files , String filePath) throws IOException {
        ArrayList<HashMap<String, String>> resultFiles = new ArrayList<>();
        ObjectMetadata objMeta = new ObjectMetadata();
        String originalFileName = "";
        String extension = "";
        Long size = (long)0;
        String fileName = "";

        String hashkey = (UUID.randomUUID().toString()).replace("-","");

        String filePathStr = "";
        if (StringUtils.isNotBlank(filePath) ) {
            if ("/regs/program".equals(filePath)) {
                filePathStr = bucket + filePath ;
            } else {
                filePath = filePath + "/"  + hashkey;
                filePathStr = bucket + filePath;
            }
        } else {
            filePath = "/regs/"  + hashkey;
            filePathStr = bucket +filePath;
        }
        Integer i = 1;

        for(MultipartFile file : files){
            HashMap<String, String> resultFile = new HashMap<>();
            originalFileName = file.getOriginalFilename();
            extension = FilenameUtils.getExtension(originalFileName).toLowerCase();
            size = file.getSize();

            fileName = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")).toString()+"_"+i.toString()+"."+extension;

            objMeta = new ObjectMetadata();
            objMeta.setContentType(Mimetypes.getInstance().getMimetype(fileName));
            byte[] bytes = IOUtils.toByteArray(file.getInputStream());
            objMeta.setContentLength(bytes.length);

            s3Client.putObject(new PutObjectRequest(filePathStr, fileName, file.getInputStream(), objMeta)
                    .withCannedAcl(CannedAccessControlList.PublicRead));
            resultFile.put("newFileName",fileName);
            resultFile.put("originalFileName",originalFileName);
            resultFile.put("size",size.toString());
            resultFile.put("extension",extension);
            resultFile.put("hashkey",hashkey);
            resultFile.put("filePath",filePath);
            resultFile.put("fullUrl",s3Client.getUrl(filePathStr, fileName).toString());
            resultFiles.add(resultFile);

            //로그작성
            logger.info(i+"번째 파일 업로드 : " + resultFile + " | "+LocalDateTime.now());
            i++;
        }
        return Response.ok(resultFiles);
    }

    //파일 삭제
    public ResponseDto delete(String path, String key ) {
        Boolean result = true;
        try {
            String filePath = bucket;

            if (StringUtils.isNotBlank(path)) {
                filePath = filePath+ "/" + path;
            }

            boolean isExistObject = s3Client.doesObjectExist(filePath, key);
            if (isExistObject == true) {
                s3Client.deleteObject(new DeleteObjectRequest(filePath, key));
                result = true;
            } else {
                logger.error("파일이 존재하지 않습니다." + filePath+"/"+key);
                result = false;
            }

        } catch (AmazonServiceException e) {
            // The call was transmitted successfully, but Amazon S3 couldn't process
            // it, so it returned an error response.
            //e.printStackTrace();
            logger.error("AmazonServiceException." + e);
            result = false;
        } catch (SdkClientException e) {
            // Amazon S3 couldn't be contacted for a response, or the client
            // couldn't parse the response from Amazon S3.
            //e.printStackTrace();
            logger.error("SdkClientException." + e);
            result = false;
        }

        return Response.ok(result);
    }

    //파일 다운로드(db에 저장되어 있는 파일)
    public ResponseEntity<byte[]> download(String path, String key) throws IOException {
        boolean isExistObject = s3Client.doesObjectExist(bucket+path, key);
        HttpHeaders httpHeaders = new HttpHeaders();
        byte[] bytes = null;
        if (isExistObject){
            GetObjectRequest getObjectRequest = new GetObjectRequest(bucket+path, key);

            S3Object s3Object = s3Client.getObject(getObjectRequest);

            S3ObjectInputStream objectInputStream = s3Object.getObjectContent();

            bytes = IOUtils.toByteArray(objectInputStream);
        } else {
            logger.error("파일이 존재하지 않습니다." + bucket+path+"/"+key);
        }
        return new ResponseEntity<>(bytes, httpHeaders, HttpStatus.OK);
    }

    //파일 읽기 - 기사 내용 string으로 읽기. (rss 기사 하나씩 읽기 위해 사용)
    public String read(String path, String key) throws IOException {
        boolean isExistObject = s3Client.doesObjectExist(bucketXmls+"/"+path, key);
        String result = "";

        if (isExistObject){
            result = s3Client.getObjectAsString(bucketXmls+"/"+path, key);
        } else {
            logger.error("파일이 존재하지 않습니다." + bucketXmls+"/"+path+"/"+key);
        }
        return result;
    }

    //파일 읽기 - inputstream으로 버퍼 저장. (rss 템플릿 열기 위해 사용)
    public BufferedReader readStream(String path, String key) throws IOException {
        boolean isExistObject = s3Client.doesObjectExist(bucketXmls+"/"+path, key);
        BufferedReader reader = null;

        if (isExistObject){
            GetObjectRequest getObjectRequest = new GetObjectRequest(bucketXmls+"/"+path, key);
            S3Object s3Object = s3Client.getObject(getObjectRequest);
            S3ObjectInputStream result = s3Object.getObjectContent();
            reader = new BufferedReader(new java.io.InputStreamReader(result));
        } else {
            logger.error("파일이 존재하지 않습니다." + bucketXmls+"/"+path+"/"+key);
        }
        return reader;
    }
}

