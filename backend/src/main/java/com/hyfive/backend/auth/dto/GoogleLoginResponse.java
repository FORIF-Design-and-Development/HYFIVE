package com.hyfive.backend.auth.dto;

public record GoogleLoginResponse(
        String accessToken,
        String refreshToken,
        Long userId,
        String email,
        String name,
        boolean isNewUser
) {
}

