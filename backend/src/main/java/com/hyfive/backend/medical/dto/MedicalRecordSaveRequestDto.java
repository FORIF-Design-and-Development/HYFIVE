package com.hyfive.backend.medical.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class MedicalRecordSaveRequestDto {

    private String petId;
    private String type;
    private String clinicName;
    private String visitDate;
    private String content;
    private String diagnosis;
    private String totalCost;
    private List<String> image;
}
