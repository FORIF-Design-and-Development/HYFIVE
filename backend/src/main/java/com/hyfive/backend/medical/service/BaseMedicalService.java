package com.hyfive.backend.medical.service;

import com.hyfive.backend.medical.domain.MedicalRecordType;
import com.hyfive.backend.medical.dto.MedicalRecordDto;
import com.hyfive.backend.medical.dto.MedicalRecordSaveRequestDto;
import com.hyfive.backend.medical.entity.MedicalRecord;
import com.hyfive.backend.medical.entity.MedicalRecordImage;
import com.hyfive.backend.medical.repository.MedicalRecordImageRepository;
import com.hyfive.backend.medical.repository.MedicalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BaseMedicalService implements MedicalService {

    private final MedicalRepository medicalRepository;
    private final MedicalRecordImageRepository medicalRecordImageRepository;

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

    @Override
    @Transactional
    public void saveMedicalRecord(MedicalRecordSaveRequestDto requestDto) {
        if (requestDto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "진료 기록 요청은 필수입니다.");
        }

        MedicalRecord medicalRecord = MedicalRecord.builder()
                .petId(parseLong(requestDto.getPetId(), "반려동물 ID가 올바르지 않습니다."))
                .type(parseType(requestDto.getType()))
                .clinicName(requireText(requestDto.getClinicName(), "병원명은 필수입니다."))
                .visitDate(parseDate(requestDto.getVisitDate()))
                .content(requireText(requestDto.getContent(), "진료 내용은 필수입니다."))
                .diagnosis(requireText(requestDto.getDiagnosis(), "진단명은 필수입니다."))
                .totalCost(parseInteger(requestDto.getTotalCost(), "진료비가 올바르지 않습니다."))
                .build();

        MedicalRecord savedMedicalRecord = medicalRepository.save(medicalRecord);
        saveImages(savedMedicalRecord, requestDto.getImage());
    }

    private void saveImages(MedicalRecord medicalRecord, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }

        List<MedicalRecordImage> images = imageUrls.stream()
                .filter(imageUrl -> imageUrl != null && !imageUrl.isBlank())
                .map(imageUrl -> MedicalRecordImage.builder()
                        .imageUrl(imageUrl.trim())
                        .medicalRecord(medicalRecord)
                        .build())
                .toList();

        if (!images.isEmpty()) {
            medicalRecordImageRepository.saveAll(images);
        }
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private Long parseLong(String value, String message) {
        try {
            return Long.parseLong(requireText(value, message));
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private Integer parseInteger(String value, String message) {
        try {
            return Integer.parseInt(requireText(value, message));
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(requireText(value, "진료일자는 필수입니다."));
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "진료일자가 올바르지 않습니다.");
        }
    }

    private MedicalRecordType parseType(String value) {
        try {
            return MedicalRecordType.valueOf(requireText(value, "진료 유형은 필수입니다.").toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "진료 유형이 올바르지 않습니다.");
        }
    }
}
