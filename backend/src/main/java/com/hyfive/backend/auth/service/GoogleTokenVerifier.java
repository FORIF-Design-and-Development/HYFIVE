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
        debug.put("backendGoogleClientIdVisible", visibleValue(googleClientId));
        debug.put("backendGoogleClientIdLength", lengthOf(googleClientId));
        debug.put("backendGoogleClientIdTrimmedLength", trimmedLengthOf(googleClientId));
        debug.put("backendGoogleClientIdSuffix", suffix(googleClientId));
        debug.put("backendGoogleClientIdHasLeadingWhitespace", hasLeadingWhitespace(googleClientId));
        debug.put("backendGoogleClientIdHasTrailingWhitespace", hasTrailingWhitespace(googleClientId));
        debug.put("backendGoogleClientIdContainsQuote", containsQuote(googleClientId));
        debug.put("backendGoogleClientIdContainsLineBreak", containsLineBreak(googleClientId));

        String envGoogleClientId = System.getenv("GOOGLE_CLIENT_ID");
        debug.put("envGoogleClientIdPresent", envGoogleClientId != null && !envGoogleClientId.isBlank());
        debug.put("envGoogleClientIdVisible", visibleValue(envGoogleClientId));
        debug.put("envGoogleClientIdLength", lengthOf(envGoogleClientId));
        debug.put("springPropertyEqualsEnv", safeEquals(googleClientId, envGoogleClientId));

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
            addAudienceComparisonDiagnostics(debug, audience);
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
                    .anyMatch(audienceValue -> safeEquals(googleClientId, audienceValue));
        }

        return false;
    }

    private void addAudienceComparisonDiagnostics(Map<String, Object> debug, Object audience) {
        if (!(audience instanceof String tokenAudience)) {
            debug.put("tokenAudienceIsString", false);
            debug.put("clientIdMismatchReasonHint", "TOKEN_AUDIENCE_IS_NOT_STRING");
            return;
        }

        debug.put("tokenAudienceIsString", true);
        debug.put("tokenAudienceLength", tokenAudience.length());
        debug.put("equalsAfterTrim", safeEquals(trimToNull(googleClientId), tokenAudience));
        debug.put(
                "equalsAfterRemovingWrappingQuotes",
                safeEquals(removeWrappingQuotes(googleClientId), tokenAudience)
        );
        debug.put(
                "equalsAfterRemovingAllWhitespace",
                safeEquals(removeAllWhitespace(googleClientId), removeAllWhitespace(tokenAudience))
        );

        int mismatchIndex = firstMismatchIndex(googleClientId, tokenAudience);
        debug.put("firstMismatchIndex", mismatchIndex);
        debug.put("backendMismatchChar", mismatchChar(googleClientId, mismatchIndex));
        debug.put("backendMismatchCharCode", mismatchCharCode(googleClientId, mismatchIndex));
        debug.put("tokenAudienceMismatchChar", mismatchChar(tokenAudience, mismatchIndex));
        debug.put("tokenAudienceMismatchCharCode", mismatchCharCode(tokenAudience, mismatchIndex));
        debug.put("clientIdMismatchReasonHint", clientIdMismatchReasonHint(googleClientId, tokenAudience));
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

    private String clientIdMismatchReasonHint(String backendClientId, String tokenAudience) {
        if (backendClientId == null || backendClientId.isBlank()) {
            return "BACKEND_GOOGLE_CLIENT_ID_MISSING_OR_BLANK";
        }

        if (safeEquals(backendClientId, tokenAudience)) {
            return "MATCHES";
        }

        if (safeEquals(trimToNull(backendClientId), tokenAudience)) {
            return "BACKEND_GOOGLE_CLIENT_ID_HAS_LEADING_OR_TRAILING_WHITESPACE";
        }

        if (safeEquals(removeWrappingQuotes(backendClientId), tokenAudience)) {
            return "BACKEND_GOOGLE_CLIENT_ID_HAS_WRAPPING_QUOTES";
        }

        if (safeEquals(removeAllWhitespace(backendClientId), removeAllWhitespace(tokenAudience))) {
            return "BACKEND_GOOGLE_CLIENT_ID_HAS_WHITESPACE_OR_LINE_BREAK";
        }

        return "DIFFERENT_GOOGLE_CLIENT_ID";
    }

    private int firstMismatchIndex(String left, String right) {
        if (left == null || right == null) {
            return 0;
        }

        int minLength = Math.min(left.length(), right.length());
        for (int index = 0; index < minLength; index++) {
            if (left.charAt(index) != right.charAt(index)) {
                return index;
            }
        }

        if (left.length() != right.length()) {
            return minLength;
        }

        return -1;
    }

    private String mismatchChar(String value, int index) {
        if (value == null || index < 0 || index >= value.length()) {
            return null;
        }

        return visibleCharacter(value.charAt(index));
    }

    private Integer mismatchCharCode(String value, int index) {
        if (value == null || index < 0 || index >= value.length()) {
            return null;
        }

        return (int) value.charAt(index);
    }

    private String visibleCharacter(char character) {
        return switch (character) {
            case ' ' -> "[space]";
            case '\t' -> "\\t";
            case '\n' -> "\\n";
            case '\r' -> "\\r";
            default -> String.valueOf(character);
        };
    }

    private String visibleValue(String value) {
        if (value == null) {
            return null;
        }

        return value
                .replace("\r", "\\r")
                .replace("\n", "\\n")
                .replace("\t", "\\t");
    }

    private boolean safeEquals(String left, String right) {
        if (left == null) {
            return right == null;
        }

        return left.equals(right);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        return value.trim();
    }

    private String removeWrappingQuotes(String value) {
        if (value == null || value.length() < 2) {
            return value;
        }

        boolean wrappedWithDoubleQuotes = value.startsWith("\"") && value.endsWith("\"");
        boolean wrappedWithSingleQuotes = value.startsWith("'") && value.endsWith("'");
        if (wrappedWithDoubleQuotes || wrappedWithSingleQuotes) {
            return value.substring(1, value.length() - 1);
        }

        return value;
    }

    private String removeAllWhitespace(String value) {
        if (value == null) {
            return null;
        }

        return value.replaceAll("\\s+", "");
    }

    private Integer lengthOf(String value) {
        return value == null ? null : value.length();
    }

    private Integer trimmedLengthOf(String value) {
        return value == null ? null : value.trim().length();
    }

    private boolean hasLeadingWhitespace(String value) {
        return value != null
                && !value.isEmpty()
                && Character.isWhitespace(value.charAt(0));
    }

    private boolean hasTrailingWhitespace(String value) {
        return value != null
                && !value.isEmpty()
                && Character.isWhitespace(value.charAt(value.length() - 1));
    }

    private boolean containsQuote(String value) {
        return value != null && (value.contains("\"") || value.contains("'"));
    }

    private boolean containsLineBreak(String value) {
        return value != null && (value.contains("\n") || value.contains("\r"));
    }
}
