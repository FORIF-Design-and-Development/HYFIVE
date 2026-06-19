package com.hyfive.backend.medical.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class ExtractedMedicalRecordDto {

    private String type;
    private String clinicName;
    private String visitDate;
    private String diagnosis;
    private String content;
    private String totalCost;
    private List<ExtractedPrescriptionDto> prescriptions;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ExtractedPrescriptionDto {
        private String content;
        private String period;
    }
}
