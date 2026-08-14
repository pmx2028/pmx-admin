package com.paramount.pmx.utils;


import jakarta.servlet.http.HttpServletRequest;
import ua_parser.Client;
import ua_parser.Parser;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;


public class HttpServletUtils {

    // 사용자의 IP를 가져온다.
    // 보통은 HttpServletRequest.getRemoteAddr()를 하면은 서비스를 요청한 Client의 IP정보가 나온다. 하지만 서버 구성이 L4 스위치, 프록시 서버, 로드밸런서등이 구성 되어 있으면 다른 Header를 통해 ip를 접근해야 하는 경우도 생긴다. 구글링을 해보니 위의 코드 정도면은 예상 되는 Case를 Filtering 하여 Client IP를 구할 수 있다
    public static Object getClientIp(HttpServletRequest request) {
 
        String ip = request.getHeader("X-FORWARDED-FOR"); 
        
         if (ip == null || ip.length() == 0) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0) {
            ip = request.getHeader("WL-Proxy-Client-IP"); // 웹로직
        }
        if (ip == null || ip.length() == 0) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.length() == 0) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.length() == 0) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    // 사용자 agent 정보
    public static Object getClientAgent(HttpServletRequest request){
        String userAgent = request.getHeader("user-agent");
        Map<String, String> agentResult = new HashMap<>();
        Parser parser = new Parser();        // regexes.yaml 로드(싱글턴으로 재사용 권장)
        Client client = parser.parse(userAgent);


        agentResult.put("browserName", client.userAgent.family);   // 예: Chrome
        agentResult.put("osName",      client.os.family);          // 예: Windows
        return agentResult;
    }

    // 전체 Header 출력
    public static String printAllHeader(HttpServletRequest request) {
        String str = "";
        Enumeration<String> headerNames = request.getHeaderNames();
        while(headerNames.hasMoreElements()){
            String name = (String)headerNames.nextElement();
            String value = request.getHeader(name);
            str += name + " : " + value + "\n";
        }
        return str;
    }

    // AJAX 호출인지를 구분
    public static boolean isAjax(HttpServletRequest request) {
        String ajaxHeader = request.getHeader("X-Requested-With");
        String acceptHeader = request.getHeader("Accept");
        return (
                (ajaxHeader != null && "XMLHttpRequest".equals(ajaxHeader)) ||
                (acceptHeader != null && acceptHeader.contains("application/json"))
            );
    }

}