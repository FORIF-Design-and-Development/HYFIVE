package com.hyfive.backend.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private T data;
    private Object error;
    private Object meta;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data, null, null);
    }

    public static ApiResponse<Object> error(int code, String message) {
        return new ApiResponse<>(
                null,
                new ErrorResponse(code, message),
                null
        );
    }

    @Getter
    @AllArgsConstructor
    public static class ErrorResponse {
        private int code;
        private String message;
    }
}
