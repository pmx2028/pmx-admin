package com.paramount.pmx.utils;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Base64;

public class HectoSignatureUtil {

    // ⚠ 알고리즘/모드(ECB, PKCS5Padding)는 통상적인 국내 PG AES256 연동 규격을 가정한 것으로,
    // 헥토파이낸셜 공식 매뉴얼로 재검증 필요.
    private static final String AES_TRANSFORMATION = "AES/ECB/PKCS5Padding";
    private static final String AES_ALGORITHM = "AES";

    private HectoSignatureUtil() {
    }

    public static String sha256Hex(String plainText) {
        try {
            StringBuffer sb = new StringBuffer();
            MessageDigest sh = MessageDigest.getInstance("SHA-256");
            if (plainText != null) {
                sh.update(plainText.getBytes("UTF-8"));
                byte[] byteData = sh.digest();
                for (int i = 0; i < byteData.length; i++) {
                    sb.append(Integer.toString((byteData[i] & 0xff) + 0x100, 16).substring(1));
                }
                return sb.toString();
            }
            return null;
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 알고리즘을 사용할 수 없습니다.", e);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    // AES256/ECB/PKCS5Padding 암호화. key는 UTF-8 바이트 기준 32byte(AES-256)여야 한다.
    public static byte[] aes256EncryptEcb(String sKey, String sText) {
        try {
            byte[] key = null;
            byte[] text = null;
            byte[] encrypted = null;
            final int AES_KEY_SIZE_256 = 256;
            // UTF-8
            key = sKey.getBytes("UTF-8");
            // Key size (256bit, 16byte)
            key = Arrays.copyOf(key, AES_KEY_SIZE_256 / 8);
            // UTF-8
            text = sText.getBytes("UTF-8");
            // AES/EBC/PKCS5Padding
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"));
            encrypted = cipher.doFinal(text);

            return encrypted;
        } catch (GeneralSecurityException | UnsupportedEncodingException e) {
            throw new IllegalStateException("AES256 암호화에 실패했습니다.", e);
        }
    }

    public static String encodeBase64(byte[] bytes) {
        if (bytes == null) {
            return null;
        }
        return Base64.getEncoder().encodeToString(bytes);
    }
}
