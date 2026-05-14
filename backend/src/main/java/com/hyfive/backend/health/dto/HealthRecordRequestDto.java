package com.hyfive.backend.health.dto;

import com.hyfive.backend.health.entity.HealthRecord.BowelStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
public class HealthRecordRequestDto {

    @NotNull(message = "반려동물 ID는 필수 입력 항목입니다.")
    private Long petId;

    @NotNull(message = "체중은 필수 입력 항목입니다.")
    private Double weight;

    @NotNull(message = "배변 상태는 필수 입력 항목입니다.")
    private BowelStatus bowelStatus;

    private List<MedicationDto> medications = new ArrayList<>();

    private List<String> symptoms = new ArrayList<>();

    @Getter
    @NoArgsConstructor
    public static class MedicationDto {
        private String name;
        private Boolean isTaken;
    }
}
