package com.hyfive.backend.medical.controller;

import com.hyfive.backend.common.ApiResponse;
import com.hyfive.backend.medical.dto.MedicalOcrRequestDto;
import com.hyfive.backend.medical.dto.MedicalOcrResponseDto;
import com.hyfive.backend.medical.dto.MedicalRecordDto;
import com.hyfive.backend.medical.dto.MedicalRecordSaveRequestDto;
import com.hyfive.backend.medical.service.MedicalService;
import com.hyfive.backend.medical.service.OCRService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MedicalController {

    private final MedicalService medicalService;
    private final OCRService ocrService;

    @GetMapping("/records/medical")
    public ResponseEntity<ApiResponse<List<MedicalRecordDto>>> findAll(@RequestParam Long petId) {
        List<MedicalRecordDto> response = medicalService.getMedicalRecords(petId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/upload/medical")
    public ResponseEntity<Void> uploadMedical(@RequestBody MedicalRecordSaveRequestDto requestDto) {
        medicalService.saveMedicalRecord(requestDto);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/ocr/medical", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MedicalOcrResponseDto>> analyzeMedical(
            @RequestParam("visitDate") String visitDate,
            @RequestParam("type") String type,
            @RequestPart("image") List<MultipartFile> images
    ) {
        MedicalOcrResponseDto response = ocrService.analyzeMedical(visitDate, type, images);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping(value = "/ocr/medical", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<MedicalOcrResponseDto>> analyzeMedicalBase64(
            @RequestBody MedicalOcrRequestDto requestDto
    ) {
        MedicalOcrResponseDto response = ocrService.analyzeMedicalBase64(
                requestDto.getVisitDate(),
                requestDto.getType(),
                requestDto.getImage()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
