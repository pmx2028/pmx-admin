package com.paramount.pmx.utils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.DecimalFormat;

public final class LegacyPasswordHashUtils {

    // ============================================================
    // ruby CSM user.rb에서 사용했던 비밀번호 암호화 방식 그대로 구현함
    // ============================================================


    // 유틸 클래스: 인스턴스화 방지
    private LegacyPasswordHashUtils() {}

    public static String md5Hex(String s) {
        return hex(digest("MD5", s));
    }

    public static String sha1Hex(String s) {
        return hex(digest("SHA-1", s));
    }

    private static byte[] digest(String alg, String s) {
        try {
            MessageDigest md = MessageDigest.getInstance(alg);
            return md.digest(s.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("Digest error", e);
        }
    }

    private static String hex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    /** Ruby Time.now.to_f.to_s → MD5 */
    public static String generateSalt() {
        double seconds = System.currentTimeMillis() / 1000.0;
        String floatStr = new DecimalFormat("0.############").format(seconds);
        return md5Hex(floatStr);
    }
}
