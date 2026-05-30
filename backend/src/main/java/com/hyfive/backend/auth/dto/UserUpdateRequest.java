package com.hyfive.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import software.amazon.awssdk.services.s3.internal.resource.S3BucketResource;

public record UserUpdateRequest(
        @NotBlank(message="이름은 필수입니다.")
        String name,
        String nickname
) {
}
