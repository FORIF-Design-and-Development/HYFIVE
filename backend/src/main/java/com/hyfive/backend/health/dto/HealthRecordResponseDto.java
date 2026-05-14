package com.hyfive.backend.health.dto;

import com.hyfive.backend.health.entity.HealthRecord;
import com.hyfive.backend.health.entity.HealthRecord.BowelStatus;
import com.hyfive.backend.health.entity.Medication;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 건강기록 단건 조회 / 등록 / 수정 응답 DTO
 * medications, symptoms 전체 포함
 */
@Getter
public class HealthRecordResponseDto {

    private Long healthRecordId;
    private Long petId;
    private Double weight;
    private BowelStatus bowelStatus;
    private List<MedicationDto> medications;
    private List<String> symptoms;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public HealthRecordResponseDto(HealthRecord healthRecord) {
        this.healthRecordId = healthRecord.getHealthRecordId();
        this.petId = healthRecord.getPetId();
        this.weight = healthRecord.getWeight();
        this.bowelStatus = healthRecord.getBowelStatus();
        this.medications = healthRecord.getMedications().stream()
                .map(MedicationDto::new)
                .collect(Collectors.toList());
        this.symptoms = List.copyOf(healthRecord.getSymptoms());
        this.createdAt = healthRecord.getCreatedAt();
        this.updatedAt = healthRecord.getUpdatedAt();
    }

    @Getter
    public static class MedicationDto {
        private String name;
        private Boolean isTaken;

        public MedicationDto(Medication medication) {
            this.name = medication.getName();
            this.isTaken = medication.getIsTaken();
        }
    }
}
