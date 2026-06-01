package com.hyfive.backend.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record HealthReportResponse(
        PetSummary pet,
        MedicalSummary medical,
        LifestyleSummary lifestyle,
        List<VaccinationSummary> vaccinations,
        List<ReportAlert> alerts
) {

    public record PetSummary(
            Long petId,
            String name,
            String breed,
            Integer ageYears,
            String profileImageUrl
    ) {
    }

    public record MedicalSummary(
            int totalVisitCount,
            List<MonthlyVisit> monthlyVisits
    ) {
    }

    public record MonthlyVisit(
            String month,
            long count
    ) {
    }

    public record LifestyleSummary(
            long weeklyAverageWalkMinutes,
            List<WeeklyWalk> walkTrend,
            BigDecimal latestWeightKg,
            BigDecimal weightChangeKg
    ) {
    }

    public record WeeklyWalk(
            LocalDate weekStart,
            long minutes
    ) {
    }

    public record VaccinationSummary(
            String code,
            LocalDate lastVaccinationDate
    ) {
    }

    public record ReportAlert(
            String type,
            String message,
            String detail,
            String actionPath
    ) {
    }
}
