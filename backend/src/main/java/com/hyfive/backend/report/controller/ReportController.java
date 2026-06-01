package com.hyfive.backend.report.controller;

import com.hyfive.backend.common.ApiResponse;
import com.hyfive.backend.report.dto.HealthReportResponse;
import com.hyfive.backend.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<HealthReportResponse>> getReport(
            @RequestParam Long petId
    ) {
        HealthReportResponse response = reportService.getPetReport(petId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
