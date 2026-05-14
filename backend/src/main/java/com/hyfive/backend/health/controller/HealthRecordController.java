package com.hyfive.backend.health.controller;

import com.hyfive.backend.common.ApiResponse;
import com.hyfive.backend.health.dto.HealthRecordListResponseDto;
import com.hyfive.backend.health.dto.HealthRecordRequestDto;
import com.hyfive.backend.health.dto.HealthRecordResponseDto;
import com.hyfive.backend.health.service.HealthRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-records")
@RequiredArgsConstructor
public class HealthRecordController {

    private final HealthRecordService healthRecordService;

    @PostMapping
    public ResponseEntity<ApiResponse<HealthRecordResponseDto>> createHealthRecord(
            @Valid @RequestBody HealthRecordRequestDto requestDto) {

        HealthRecordResponseDto response = healthRecordService.createHealthRecord(requestDto);
        return ResponseEntity.status(201).body(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HealthRecordListResponseDto>>> getHealthRecords(
            @RequestParam Long petId) {

        List<HealthRecordListResponseDto> response = healthRecordService.getHealthRecords(petId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{healthRecordId}")
    public ResponseEntity<ApiResponse<HealthRecordResponseDto>> getHealthRecord(
            @PathVariable Long healthRecordId) {

        HealthRecordResponseDto response = healthRecordService.getHealthRecord(healthRecordId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{healthRecordId}")
    public ResponseEntity<ApiResponse<HealthRecordResponseDto>> updateHealthRecord(
            @PathVariable Long healthRecordId,
            @Valid @RequestBody HealthRecordRequestDto requestDto) {

        HealthRecordResponseDto response = healthRecordService.updateHealthRecord(healthRecordId, requestDto);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
