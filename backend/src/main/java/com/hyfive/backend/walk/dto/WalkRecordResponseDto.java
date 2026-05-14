package com.hyfive.backend.walk.dto;

import com.hyfive.backend.walk.entity.WalkRecord;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class WalkRecordResponseDto {

    private Long walkId;
    private Long petId;
    private LocalDateTime startAt;
    private LocalDateTime endedAt;
    private Float distanceKm;
    private Integer calories;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WalkRecordResponseDto(WalkRecord walkRecord) {
        this.walkId = walkRecord.getWalkId();
        this.petId = walkRecord.getPetId();
        this.startAt = walkRecord.getStartAt();
        this.endedAt = walkRecord.getEndedAt();
        this.distanceKm = walkRecord.getDistanceKm();
        this.calories = walkRecord.getCalories();
        this.createdAt = walkRecord.getCreatedAt();
        this.updatedAt = walkRecord.getUpdatedAt();
    }
}