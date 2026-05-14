package com.hyfive.backend.walk.controller;

import com.hyfive.backend.common.ApiResponse;
import com.hyfive.backend.walk.dto.WalkRecordRequestDto;
import com.hyfive.backend.walk.dto.WalkRecordResponseDto;
import com.hyfive.backend.walk.service.WalkRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/walks")
@RequiredArgsConstructor
public class WalkRecordController {

    private final WalkRecordService walkRecordService;

    @PostMapping
    public ResponseEntity<ApiResponse<WalkRecordResponseDto>> createWalkRecord(
            @Valid @RequestBody WalkRecordRequestDto requestDto) {

        WalkRecordResponseDto response = walkRecordService.createWalkRecord(requestDto);
        return ResponseEntity.status(201).body(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WalkRecordResponseDto>>> getWalkRecords(
            @RequestParam Long petId) {

        List<WalkRecordResponseDto> response = walkRecordService.getWalkRecords(petId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
