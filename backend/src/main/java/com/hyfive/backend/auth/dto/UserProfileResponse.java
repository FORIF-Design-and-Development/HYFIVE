package com.hyfive.backend.auth.dto;

import java.time.LocalDateTime;

public record UserProfileResponse(
        String email,
        String name,
        String nickname,
        LocalDateTime createdAt
) {
}
