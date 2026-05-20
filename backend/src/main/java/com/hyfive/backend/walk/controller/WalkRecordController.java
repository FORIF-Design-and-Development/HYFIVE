package com.hyfive.backend.walk.controller;

import com.hyfive.backend.walk.dto.WalkRecordRequestDto;
import com.hyfive.backend.walk.dto.WalkRecordResponseDto;
import com.hyfive.backend.walk.service.WalkRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/walks")
@RequiredArgsConstructor
public class WalkRecordController {

    private final WalkRecordService walkRecordService;

    // 산책기록 등록
    @PostMapping
    public ResponseEntity<?> createWalkRecord(
            @Valid @RequestBody WalkRecordRequestDto requestDto) {

        WalkRecordResponseDto response = walkRecordService.createWalkRecord(requestDto);
        return ResponseEntity.status(201).body(
                Map.of("data", response, "error", null, "meta", null)
        );
    }

    // 산책기록 목록 조회
    @GetMapping
    public ResponseEntity<?> getWalkRecords(@RequestParam Long petId) {
        List<WalkRecordResponseDto> response = walkRecordService.getWalkRecords(petId);
        return ResponseEntity.ok(
                Map.of("data", response, "error", null, "meta", null)
        );
    }
}