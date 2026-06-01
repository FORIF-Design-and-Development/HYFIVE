package com.hyfive.backend.medical.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class MedicalOcrRequestDto {

    private String visitDate;
    private String type;
    private List<String> image;
}
