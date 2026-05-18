package com.hyfive.backend.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    // service 계층에서 controller 거치지 않고 exception 던질 시, 프론트에서 잘못된 error code 받는 경우가 있어 설정함

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Object>> handleResponseStatusException(ResponseStatusException e) {
        return ResponseEntity
                .status(e.getStatusCode())
                .body(ApiResponse.error(
                        e.getStatusCode().value(),
                        e.getReason() != null ? e.getReason() : "요청 처리 중 오류가 발생했습니다."
                ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(
                        HttpStatus.BAD_REQUEST.value(),
                        e.getMessage() != null ? e.getMessage() : "요청 값이 올바르지 않습니다."
                ));
    }
}
