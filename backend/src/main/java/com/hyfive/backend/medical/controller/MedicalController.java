package com.hyfive.backend.medical.controller;

import com.hyfive.backend.common.ApiResponse;
import com.hyfive.backend.medical.dto.MedicalRecordDto;
import com.hyfive.backend.medical.service.MedicalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MedicalController {

    private final MedicalService medicalService;

    @GetMapping("/records/medical")
    public ResponseEntity<ApiResponse<List<MedicalRecordDto>>> findAll(@RequestParam Long petId) {
        List<MedicalRecordDto> response = medicalService.getMedicalRecords(petId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
