package com.hyfive.backend.medical.service;

import com.hyfive.backend.medical.dto.MedicalRecordDto;
import com.hyfive.backend.medical.entity.MedicalRecord;
import com.hyfive.backend.medical.repository.MedicalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BaseMedicalService implements MedicalService {

    private final MedicalRepository medicalRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MedicalRecordDto> getMedicalRecords(Long petId) {
        List<MedicalRecord> medicalRecords = medicalRepository.findAllByPetId(petId);

        if (medicalRecords.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "진료 기록을 찾을 수 없습니다.");
        }

        return medicalRecords.stream()
                .map(MedicalRecordDto::new)
                .toList();
    }
}
