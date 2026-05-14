package com.hyfive.backend.health.service;

import com.hyfive.backend.health.dto.HealthRecordListResponseDto;
import com.hyfive.backend.health.dto.HealthRecordListResponseDto.RecentWeightDto;
import com.hyfive.backend.health.dto.HealthRecordRequestDto;
import com.hyfive.backend.health.dto.HealthRecordResponseDto;
import com.hyfive.backend.health.entity.HealthRecord;
import com.hyfive.backend.health.entity.Medication;
import com.hyfive.backend.health.repository.HealthRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthRecordService {

    private final HealthRecordRepository healthRecordRepository;

    @Transactional
    public HealthRecordResponseDto createHealthRecord(HealthRecordRequestDto requestDto) {
        List<Medication> medications = toMedicationEntities(requestDto.getMedications());

        HealthRecord healthRecord = HealthRecord.builder()
                .petId(requestDto.getPetId())
                .weight(requestDto.getWeight())
                .bowelStatus(requestDto.getBowelStatus())
                .medications(medications)
                .symptoms(requestDto.getSymptoms() != null
                        ? requestDto.getSymptoms()
                        : List.of())
                .build();

        return new HealthRecordResponseDto(healthRecordRepository.save(healthRecord));
    }

    @Transactional(readOnly = true)
    public List<HealthRecordListResponseDto> getHealthRecords(Long petId) {
        List<HealthRecord> records = healthRecordRepository.findByPetIdOrderByCreatedAtDesc(petId);

        // 최근 체중 3개 조회 (UI "지난 기록" 표시용)
        List<RecentWeightDto> recentWeights = healthRecordRepository
                .findRecentByPetId(petId, 3)
                .stream()
                .map(h -> new RecentWeightDto(h.getWeight(), h.getCreatedAt()))
                .collect(Collectors.toList());

        return records.stream()
                .map(record -> new HealthRecordListResponseDto(record, recentWeights))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HealthRecordResponseDto getHealthRecord(Long healthRecordId) {
        HealthRecord healthRecord = healthRecordRepository.findById(healthRecordId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 건강기록입니다."));
        return new HealthRecordResponseDto(healthRecord);
    }

    @Transactional
    public HealthRecordResponseDto updateHealthRecord(Long healthRecordId,
                                                      HealthRecordRequestDto requestDto) {
        HealthRecord healthRecord = healthRecordRepository.findById(healthRecordId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 건강기록입니다."));

        List<Medication> medications = toMedicationEntities(requestDto.getMedications());
        List<String> symptoms = requestDto.getSymptoms() != null
                ? requestDto.getSymptoms()
                : List.of();

        healthRecord.update(requestDto.getWeight(), requestDto.getBowelStatus(),
                medications, symptoms);

        return new HealthRecordResponseDto(healthRecord);
    }

    private List<Medication> toMedicationEntities(
            List<HealthRecordRequestDto.MedicationDto> dtos) {
        if (dtos == null) return List.of();
        return dtos.stream()
                .map(dto -> new Medication(dto.getName(), dto.getIsTaken()))
                .collect(Collectors.toList());
    }
}