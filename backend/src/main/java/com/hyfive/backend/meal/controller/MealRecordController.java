package com.hyfive.backend.meal.controller;

import com.hyfive.backend.common.ApiResponse;
import com.hyfive.backend.meal.dto.MealRecordDto;
import com.hyfive.backend.meal.service.MealRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MealRecordController {
    private final MealRecordService mealRecordService;

    @GetMapping("/check/meal")
    public ResponseEntity<ApiResponse<List<MealRecordDto>>> getTodayMealRecord(@RequestParam Long petId) {
        List<MealRecordDto> response = mealRecordService.getTodayMealRecord(petId);

        if (response.isEmpty()) { //404 처리
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/record/meal")
    public ResponseEntity<ApiResponse<List<MealRecordDto>>> getMealRecord(
            @RequestParam Long petId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate
    ) {
        if (startDate.isAfter(LocalDate.now())) { //400처리
            return ResponseEntity.badRequest().build();
        }

        List<MealRecordDto> response = mealRecordService.getMealRecord(petId, startDate);

        if (response.isEmpty()) { //404처리
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/upload/meal")
    public ResponseEntity<ApiResponse<MealRecordDto>> uploadMealRecord(@RequestBody MealRecordDto requestDto) {
        Long petId = parsePetId(requestDto);
        MealRecordDto response = mealRecordService.uploadMealRecord(petId, requestDto);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private Long parsePetId(MealRecordDto requestDto) {
        if (requestDto == null || requestDto.getPetId() == null || requestDto.getPetId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "반려동물 ID는 필수입니다.");
        }

        try {
            return Long.parseLong(requestDto.getPetId().trim());
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "반려동물 ID가 올바르지 않습니다.");
        }
    }
}
