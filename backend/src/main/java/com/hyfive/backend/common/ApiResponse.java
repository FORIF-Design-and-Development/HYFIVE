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
}
