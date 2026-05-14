package com.hyfive.backend.health.dto;

import com.hyfive.backend.health.entity.HealthRecord;
import com.hyfive.backend.health.entity.HealthRecord.BowelStatus;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
public class HealthRecordListResponseDto {

    private Long healthRecordId;
    private Long petId;
    private Double weight;
    private BowelStatus bowelStatus;
    private List<RecentWeightDto> recentWeights;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public HealthRecordListResponseDto(HealthRecord healthRecord,
                                       List<RecentWeightDto> recentWeights) {
        this.healthRecordId = healthRecord.getHealthRecordId();
        this.petId = healthRecord.getPetId();
        this.weight = healthRecord.getWeight();
        this.bowelStatus = healthRecord.getBowelStatus();
        this.recentWeights = recentWeights;
        this.createdAt = healthRecord.getCreatedAt();
        this.updatedAt = healthRecord.getUpdatedAt();
    }

    @Getter
    public static class RecentWeightDto {
        private Double weight;
        private LocalDate createdAt;

        public RecentWeightDto(Double weight, LocalDateTime createdAt) {
            this.weight = weight;
            this.createdAt = createdAt.toLocalDate();
        }
    }
}