package com.hyfive.backend.auth.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GoogleLoginDebugExceptionHandler {

    @ExceptionHandler(GoogleLoginDebugException.class)
    public ResponseEntity<Map<String, Object>> handleGoogleLoginDebugException(
            GoogleLoginDebugException exception
    ) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("code", exception.getCode());
        body.put("message", exception.getMessage());
        body.put("debug", exception.getDebug());

        return ResponseEntity
                .status(exception.getStatus())
                .body(body);
    }
}
