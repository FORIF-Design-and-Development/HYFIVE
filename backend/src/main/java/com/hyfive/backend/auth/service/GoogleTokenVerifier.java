package com.hyfive.backend.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.hyfive.backend.auth.dto.GoogleUserInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;

@Service
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(
            @Value("${google.client-id}") String googleClientId
    ){
        this.verifier=new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(googleClientId))
                .build();
    }

    public GoogleUserInfo verify(String idToken){
        try{
            GoogleIdToken googleIdToken = verifier.verify(idToken);

            if(googleIdToken==null){
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "구글 로그인 정보가 유효하지 않습니다. 다시 로그인해주세요"
                );
            }

            GoogleIdToken.Payload payload=googleIdToken.getPayload();

            Boolean emailVerified=payload.getEmailVerified();

            if (!Boolean.TRUE.equals(emailVerified)) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "구글 이메일 인증이 완료된 계정만 사용할 수 있습니다."
                );
            }

            return new GoogleUserInfo(
                    payload.getSubject(),
                    payload.getEmail(),
                    (String) payload.get("name"),
                    true
            );
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "구글 로그인 정보를 확인하지 못했습니다. 다시 시도해주세요."
            );
        }
    }
}