package com.paramount.pmx.utils;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import eu.bitwalker.useragentutils.UserAgent;
// import net.sf.uadetector.UserAgentStringParser;
// import net.sf.uadetector.service.UADetectorServiceFactory;

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
        /*
        // User-Agent 데이터베이스를 로드하여 파써를 초기화한다. 초기화는 소모적인 작업이므로 Spring 환경의 경우 Bean으로 관리하는 것을 추천한다.
        UserAgentStringParser parser = UADetectorServiceFactory.getResourceModuleParser();

        // ReadableDevieCategory.Category를 반환한다.
        // PERSONAL_COMPUTER, SMARTPHONE, TABLET, SMART_TV, WEARABLE_COMPUTER, GAME_CONSOLE, PDA, OTHER, UNKNOWN을 반환한다.
        agentResult.put("userDevice", parser.parse(userAgent).getDeviceCategory().getCategory().toString());

        // ReadableOperatingSystemFamily.OperatingSystemFamily을 반환한다.
        // WINDOWS, MAC_OS, BSD, LINUX, ANDROID, IOS, BLACKBERRY_OS, UNKNOWN 등을 반환한다.
        agentResult.put("userOs", parser.parse(userAgent).getOperatingSystem().getFamily().toString());

        // UserAgentType을 반환한다.
        // BROWSER, MOBILE_BROWSER, OFFLINE_BROWSER, ROBOT, LIBRARY, UNKNOWN 등을 반환한다.
        agentResult.put("userViewType", parser.parse(userAgent).getType().toString());
        agentResult.put("userProducer", parser.parse(userAgent).getProducer().toString());
        agentResult.put("userDeviceName", parser.parse(userAgent).getDeviceCategory().getName().toString());
        agentResult.put("userOsName", parser.parse(userAgent).getOperatingSystem().getFamilyName().toString());

        // UserAgentFamily를 반환한다.
        // CHROME, CHROME_MOBILE, FIREFOX, MOBILE_FIREFOX, SAFARI, MOBILE_SAFARI, IE, IE_MOBILE, UNKNOWN 등을 반환한다.
        agentResult.put("userBrower", parser.parse(userAgent).getFamily().toString());
        */
        UserAgent ua = UserAgent.parseUserAgentString(userAgent);
        agentResult.put("browserName", ua.getBrowser().toString());
        agentResult.put("OsName", ua.getOperatingSystem().getName().toString());

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
