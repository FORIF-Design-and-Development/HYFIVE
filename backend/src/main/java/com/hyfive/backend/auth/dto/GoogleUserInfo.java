package com.hyfive.backend.auth.dto;

public record GoogleUserInfo(
        String providerId,
        String email,
        String name,
        boolean emailVerified
){
}
