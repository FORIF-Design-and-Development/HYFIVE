package com.hyfive.backend.auth.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class GoogleLoginDebugException extends RuntimeException {

    private final HttpStatus status;
    private final String code;
    private final Map<String, Object> debug;

    public GoogleLoginDebugException(
            HttpStatus status,
            String code,
            String message,
            Map<String, Object> debug
    ) {
        super(message);
        this.status = status;
        this.code = code;
        this.debug = debug;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public Map<String, Object> getDebug() {
        return debug;
    }
}
