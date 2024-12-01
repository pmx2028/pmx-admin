package com.paramount.pmx.component;

import java.io.IOException;
import java.io.StringWriter;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import freemarker.template.Configuration;
import freemarker.template.TemplateException;

@Service
public class EmailSender {

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private Configuration configuration;

    @Value("#{${EMAIL_TEMPLATES}}")
    private Map<String, String> EMAIL_TEMPLATES;

    @Value("${spring.application.paramount.siteurl}")
    private String PRODUCTION_SITE_URL;

    @Value("${spring.mail.username}")
    private String EMAIL_SENDER;

    public void sendEmail(String email, Map<String, String> content, String type) throws MessagingException, IOException, TemplateException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);
        helper.setFrom(EMAIL_SENDER); // 메일 보내는 주소 (수신인)

        // 메일 제목
        switch(type){
            case "DORMANCY_UPCOMING" :
                helper.setSubject("[DealSite Plus] 휴면회원 전환 예정 안내");
                break;
            case "DORMANCY_COMPLETE" :
                helper.setSubject("[DealSite Plus] 휴면회원 전환 안내");
                break;
            case "PROMOTION_EXPIRE_UPCOMING" :
                helper.setSubject("[DealSite Plus] 프로모션 기간 종료 예정 안내");
                break;
            case "ACCOUNT_LEAVE_CONFIRM" :
                helper.setSubject("[Dealsite Plus] 회원 탈퇴 안내");
                break;
        }

        helper.setTo(email);    // 받는 사람
        // 메일컨텐츠
        String emailContent = getEmailContent(content, type);
        helper.setText(emailContent, true);

        // 메일 보내기
        javaMailSender.send(mimeMessage);
    }

    // 이메일 컨텐츠
    String getEmailContent(Map<String, String> content, String type) throws IOException, TemplateException {
        StringWriter stringWriter = new StringWriter();
        Map<String, Object> model = new HashMap<>();

        // 공통으로 들어가는 것
        model.put("mailTemplate", EMAIL_TEMPLATES.get(type));                   // 메일 템플릿
        model.put("now", LocalDate.now());                                      // 현재시간
        model.put("_url", PRODUCTION_SITE_URL);

        model.put("userLogin", content.get("userLogin"));                       // 유저 id (login)
        model.put("userEmail", content.get("userEmail"));                       // 유저 email
        switch(type){
            case "DORMANCY_UPCOMING" :
                model.put("dormancyDt", content.get("dormancyDt"));             // 휴면 전환 예정 날짜
                break;
            case "DORMANCY_COMPLETE" :
                model.put("dormancyDt", content.get("dormancyDt"));             // 휴면 전환 날짜
                break;
            case "PROMOTION_EXPIRE_UPCOMING" :
                model.put("promotionStartDt", content.get("promotionStartDt")); // 프로모션 시작일
                model.put("promotionEndDt", content.get("promotionEndDt"));     // 프로모션 종료일
                model.put("currentProducts", content.get("currentProducts"));   // 현재 구독중인 상품 종류
                model.put("currentOrders", content.get("currentOrders"));       // 현재 구독중인 상품 이름
                model.put("onlyBundle", content.get("onlyBundle"));             // 구독중인 상품이 번들만 있는지
                model.put("totalPrice", content.get("totalPrice"));             // 상품 가격
                break;
            case "ACCOUNT_LEAVE_CONFIRM" :
                model.put("quitConfirmAt", content.get("quitConfirmAt"));       // 회원 탈퇴 일자
                break;
        }
        configuration.getTemplate("/mail/index.ftl").process(model, stringWriter);

        return stringWriter.getBuffer().toString();
    }

}
