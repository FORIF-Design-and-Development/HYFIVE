package com.hyfive.backend.medical.service;

import com.hyfive.backend.medical.dto.MedicalRecordDto;
import com.hyfive.backend.medical.dto.MedicalRecordSaveRequestDto;

import java.util.List;

public interface MedicalService {

    List<MedicalRecordDto> getMedicalRecords(Long petId);

    void saveMedicalRecord(MedicalRecordSaveRequestDto requestDto);
}
