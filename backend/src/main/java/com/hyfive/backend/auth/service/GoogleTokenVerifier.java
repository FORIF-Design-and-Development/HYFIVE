package com.hyfive.backend.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hyfive.backend.auth.dto.GoogleUserInfo;
import com.hyfive.backend.auth.exception.GoogleLoginDebugException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class GoogleTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(GoogleTokenVerifier.class);

    private final GoogleIdTokenVerifier verifier;
    private final String googleClientId;
    private final ObjectMapper objectMapper;

    public GoogleTokenVerifier(
            @Value("${google.client-id}") String googleClientId,
            ObjectMapper objectMapper
    ){
        this.googleClientId = googleClientId;
        this.objectMapper = objectMapper;
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
                Map<String, Object> debug = buildDebugInfo(idToken, null);
                log.warn("Google ID token verification returned null. debug={}", debug);
                throw new GoogleLoginDebugException(
                        HttpStatus.UNAUTHORIZED,
                        "GOOGLE_TOKEN_VERIFY_RETURNED_NULL",
                        "Google ID token verification returned null.",
                        debug
                );
            }

            GoogleIdToken.Payload payload=googleIdToken.getPayload();

            Boolean emailVerified=payload.getEmailVerified();

            if (!Boolean.TRUE.equals(emailVerified)) {
                Map<String, Object> debug = buildDebugInfo(idToken, null);
                debug.put("verifiedPayloadEmailVerified", emailVerified);
                log.warn("Google email is not verified. debug={}", debug);
                throw new GoogleLoginDebugException(
                        HttpStatus.UNAUTHORIZED,
                        "GOOGLE_EMAIL_NOT_VERIFIED",
                        "Google email is not verified.",
                        debug
                );
            }

            return new GoogleUserInfo(
                    payload.getSubject(),
                    payload.getEmail(),
                    (String) payload.get("name"),
                    true
            );
        } catch (GoogleLoginDebugException e) {
            throw e;
        } catch (Exception e) {
            Map<String, Object> debug = buildDebugInfo(idToken, e);
            log.warn("Google ID token verification failed with exception. debug={}", debug, e);
            throw new GoogleLoginDebugException(
                    HttpStatus.UNAUTHORIZED,
                    "GOOGLE_TOKEN_VERIFY_EXCEPTION",
                    "Google ID token verification failed with exception.",
                    debug
            );
        }
    }

    private Map<String, Object> buildDebugInfo(String idToken, Exception exception) {
        Map<String, Object> debug = new LinkedHashMap<>();
        debug.put("stage", "GOOGLE_ID_TOKEN_VERIFY");
        debug.put("idTokenPresent", idToken != null && !idToken.isBlank());
        debug.put("tokenLength", idToken == null ? 0 : idToken.length());
        debug.put("backendGoogleClientIdConfigured", googleClientId != null && !googleClientId.isBlank());
        debug.put("backendGoogleClientIdSuffix", suffix(googleClientId));

        if (exception != null) {
            debug.put("exceptionClass", exception.getClass().getName());
            debug.put("exceptionMessage", exception.getMessage());
        }

        addDecodedPayload(debug, idToken);
        return debug;
    }

    private void addDecodedPayload(Map<String, Object> debug, String idToken) {
        if (idToken == null || idToken.isBlank()) {
            return;
        }

        String[] tokenParts = idToken.split("\\.");
        if (tokenParts.length < 2) {
            debug.put("payloadDecodeError", "JWT payload part is missing.");
            return;
        }

        try {
            String payloadJson = new String(
                    Base64.getUrlDecoder().decode(tokenParts[1]),
                    StandardCharsets.UTF_8
            );
            Map<String, Object> payload = objectMapper.readValue(
                    payloadJson,
                    new TypeReference<>() {
                    }
            );

            Object audience = payload.get("aud");
            Object expiresAt = payload.get("exp");
            long serverNowEpochSeconds = Instant.now().getEpochSecond();

            debug.put("tokenIssuer", payload.get("iss"));
            debug.put("tokenAudience", audience);
            debug.put("tokenAuthorizedParty", payload.get("azp"));
            debug.put("tokenEmailVerified", payload.get("email_verified"));
            debug.put("tokenIssuedAt", payload.get("iat"));
            debug.put("tokenExpiresAt", expiresAt);
            debug.put("serverNowEpochSeconds", serverNowEpochSeconds);
            debug.put("tokenExpired", isExpired(expiresAt, serverNowEpochSeconds));
            debug.put("audMatchesBackendClientId", audienceMatchesBackendClientId(audience));
        } catch (Exception e) {
            debug.put(
                    "payloadDecodeError",
                    e.getClass().getSimpleName() + ": " + e.getMessage()
            );
        }
    }

    private boolean audienceMatchesBackendClientId(Object audience) {
        if (audience instanceof String audienceString) {
            return audienceString.equals(googleClientId);
        }

        if (audience instanceof Collection<?> audienceList) {
            return audienceList.stream()
                    .map(String::valueOf)
                    .anyMatch(googleClientId::equals);
        }

        return false;
    }

    private boolean isExpired(Object expiresAt, long serverNowEpochSeconds) {
        if (expiresAt instanceof Number expiresAtNumber) {
            return expiresAtNumber.longValue() < serverNowEpochSeconds;
        }

        return false;
    }

    private String suffix(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        int startIndex = Math.max(0, value.length() - 16);
        return value.substring(startIndex);
    }
}
