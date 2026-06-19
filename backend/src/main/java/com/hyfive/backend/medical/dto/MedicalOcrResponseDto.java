package com.hyfive.backend.medical.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class MedicalOcrResponseDto {

    private String rawText;
    private ExtractedMedicalRecordDto extracted;
    private List<String> imageUrls;
}
