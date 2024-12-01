package com.paramount.pmx.security;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javax.xml.bind.DatatypeConverter;

public class Sha1PasswordEncoder implements PasswordEncoder {

    public static String encrypt(String rawPassword){
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            md.reset();
            md.update(rawPassword.getBytes());
            byte[] digest = md.digest();
            String myHash = DatatypeConverter.printHexBinary(digest).toLowerCase();
            return myHash;
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return rawPassword;
        }
    }

    @Override
    public String encode(CharSequence rawPassword) {
        String rawPasswordStr = (String) rawPassword;
        return encrypt(rawPasswordStr);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        String rawPasswordStr = (String) rawPassword;
        String encodePassword = encode(rawPasswordStr);

        return encodedPassword.equals(encodePassword);
    }
}
