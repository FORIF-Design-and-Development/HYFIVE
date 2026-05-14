package com.hyfive.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequest(
        @NotBlank(message = "구글 로그인 정보가 확인되지 않았습니다. 다시 시도해주세요.")
        String idToken
) {
}
