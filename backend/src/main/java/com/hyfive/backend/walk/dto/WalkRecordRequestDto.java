package com.hyfive.backend.walk.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class WalkRecordRequestDto {

    @NotNull(message = "반려동물 ID는 필수 입력 항목입니다.")
    private Long petId;

    @NotNull(message = "산책 시작 시간은 필수 입력 항목입니다.")
    private LocalDateTime startAt;

    @NotNull(message = "산책 종료 시간은 필수 입력 항목입니다.")
    private LocalDateTime endedAt;

    private Float distanceKm;

    private Integer calories;
}