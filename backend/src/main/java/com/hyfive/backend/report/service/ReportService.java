package com.hyfive.backend.report.service;

import com.hyfive.backend.medical.entity.MedicalRecord;
import com.hyfive.backend.pet.domain.Pet;
import com.hyfive.backend.pet.domain.PetVaccination;
import com.hyfive.backend.pet.domain.VaccineCode;
import com.hyfive.backend.pet.domain.WeightLog;
import com.hyfive.backend.report.dto.HealthReportResponse;
import com.hyfive.backend.report.dto.HealthReportResponse.LifestyleSummary;
import com.hyfive.backend.report.dto.HealthReportResponse.MedicalSummary;
import com.hyfive.backend.report.dto.HealthReportResponse.MonthlyVisit;
import com.hyfive.backend.report.dto.HealthReportResponse.PetSummary;
import com.hyfive.backend.report.dto.HealthReportResponse.ReportAlert;
import com.hyfive.backend.report.dto.HealthReportResponse.VaccinationSummary;
import com.hyfive.backend.report.dto.HealthReportResponse.WeeklyWalk;
import com.hyfive.backend.report.repository.ReportRepository;
import com.hyfive.backend.walk.entity.WalkRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private static final int MEDICAL_MONTH_COUNT = 3;
    private static final int WALK_WEEK_COUNT = 4;
    private static final Map<VaccineCode, Period> VACCINATION_INTERVALS = Map.of(
            VaccineCode.DHPPL, Period.ofYears(1),
            VaccineCode.RABIES, Period.ofYears(1),
            VaccineCode.KENNEL_COUGH, Period.ofYears(1),
            VaccineCode.CORONA_ENTERITIS, Period.ofYears(1),
            VaccineCode.HEARTWORM, Period.ofMonths(1),
            VaccineCode.PARASITE, Period.ofMonths(3)
    );

    private final ReportRepository reportRepository;

    public HealthReportResponse getPetReport(Long petId) {
        LocalDate today = LocalDate.now();
        Pet pet = reportRepository.findPetById(petId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Pet profile not found."
                ));

        return createReport(pet, today);
    }

    public HealthReportResponse getActivePetReport(Long userId) {
        LocalDate today = LocalDate.now();
        Pet pet = reportRepository.findActivePetByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Active pet profile not found."
                ));

        return createReport(pet, today);
    }

    private HealthReportResponse createReport(Pet pet, LocalDate today) {
        Long petId = pet.getPetId();
        List<PetVaccination> vaccinations = reportRepository.findVaccinations(petId);
        List<WalkRecord> walkRecords = findRecentWalkRecords(petId, today);

        return new HealthReportResponse(
                createPetSummary(pet, today),
                createMedicalSummary(petId, today),
                createLifestyleSummary(petId, today, walkRecords),
                createVaccinationSummaries(vaccinations),
                createAlerts(today, walkRecords, vaccinations)
        );
    }

    private PetSummary createPetSummary(Pet pet, LocalDate today) {
        Integer ageYears = pet.getBirthdate() == null
                ? null
                : Period.between(pet.getBirthdate(), today).getYears();

        return new PetSummary(
                pet.getPetId(),
                pet.getName(),
                pet.getBreed(),
                ageYears,
                pet.getProfileImageUrl()
        );
    }

    private MedicalSummary createMedicalSummary(Long petId, LocalDate today) {
        YearMonth currentMonth = YearMonth.from(today);
        YearMonth firstMonth = currentMonth.minusMonths(MEDICAL_MONTH_COUNT - 1L);
        List<MedicalRecord> medicalRecords = reportRepository.findMedicalRecords(
                petId,
                firstMonth.atDay(1),
                currentMonth.plusMonths(1).atDay(1)
        );

        Map<YearMonth, Long> visitCountByMonth = new LinkedHashMap<>();
        for (int index = 0; index < MEDICAL_MONTH_COUNT; index++) {
            visitCountByMonth.put(firstMonth.plusMonths(index), 0L);
        }
        for (MedicalRecord medicalRecord : medicalRecords) {
            YearMonth month = YearMonth.from(medicalRecord.getVisitDate());
            visitCountByMonth.computeIfPresent(month, (key, count) -> count + 1);
        }

        List<MonthlyVisit> monthlyVisits = visitCountByMonth.entrySet().stream()
                .map(entry -> new MonthlyVisit(entry.getKey().toString(), entry.getValue()))
                .toList();

        return new MedicalSummary(medicalRecords.size(), monthlyVisits);
    }

    private List<WalkRecord> findRecentWalkRecords(Long petId, LocalDate today) {
        LocalDate currentWeekStart = getWeekStart(today);
        LocalDate firstWeekStart = currentWeekStart.minusWeeks(WALK_WEEK_COUNT - 1L);

        return reportRepository.findWalkRecords(
                petId,
                firstWeekStart.atStartOfDay(),
                currentWeekStart.plusWeeks(1).atStartOfDay()
        );
    }

    private LifestyleSummary createLifestyleSummary(
            Long petId,
            LocalDate today,
            List<WalkRecord> walkRecords
    ) {
        LocalDate currentWeekStart = getWeekStart(today);
        LocalDate firstWeekStart = currentWeekStart.minusWeeks(WALK_WEEK_COUNT - 1L);
        Map<LocalDate, Long> walkMinutesByWeek = new LinkedHashMap<>();
        for (int index = 0; index < WALK_WEEK_COUNT; index++) {
            walkMinutesByWeek.put(firstWeekStart.plusWeeks(index), 0L);
        }

        for (WalkRecord walkRecord : walkRecords) {
            LocalDate weekStart = getWeekStart(walkRecord.getStartAt().toLocalDate());
            walkMinutesByWeek.computeIfPresent(
                    weekStart,
                    (key, minutes) -> minutes + getWalkMinutes(walkRecord)
            );
        }

        List<WeeklyWalk> walkTrend = walkMinutesByWeek.entrySet().stream()
                .map(entry -> new WeeklyWalk(entry.getKey(), entry.getValue()))
                .toList();

        long currentWeekMinutes = walkMinutesByWeek.get(currentWeekStart);
        long elapsedDayCount = today.getDayOfWeek().getValue();
        long weeklyAverageWalkMinutes = currentWeekMinutes / elapsedDayCount;

        List<WeightLog> weightLogs = reportRepository.findLatestWeightLogs(petId, 2);
        BigDecimal latestWeightKg = weightLogs.isEmpty() ? null : weightLogs.get(0).getWeightKg();
        BigDecimal weightChangeKg = weightLogs.size() < 2
                ? null
                : weightLogs.get(0).getWeightKg().subtract(weightLogs.get(1).getWeightKg());

        return new LifestyleSummary(
                weeklyAverageWalkMinutes,
                walkTrend,
                latestWeightKg,
                weightChangeKg
        );
    }

    private List<VaccinationSummary> createVaccinationSummaries(List<PetVaccination> vaccinations) {
        Map<VaccineCode, PetVaccination> latestVaccinationByCode = getLatestVaccinationByCode(vaccinations);

        return latestVaccinationByCode.values().stream()
                .map(vaccination -> new VaccinationSummary(
                        vaccination.getCode().name(),
                        vaccination.getVaccinationDate()
                ))
                .toList();
    }

    private List<ReportAlert> createAlerts(
            LocalDate today,
            List<WalkRecord> walkRecords,
            List<PetVaccination> vaccinations
    ) {
        List<ReportAlert> alerts = new ArrayList<>();
        Map<VaccineCode, PetVaccination> latestVaccinationByCode = getLatestVaccinationByCode(vaccinations);
        YearMonth currentMonth = YearMonth.from(today);

        latestVaccinationByCode.forEach((code, vaccination) -> {
            LocalDate dueDate = vaccination.getVaccinationDate().plus(VACCINATION_INTERVALS.get(code));
            if (YearMonth.from(dueDate).equals(currentMonth)) {
                alerts.add(new ReportAlert(
                        "VACCINATION_DUE_THIS_MONTH",
                        code.name() + " is due this month.",
                        "Due date: " + dueDate,
                        "/record"
                ));
            }
        });

        LocalDate currentWeekStart = getWeekStart(today);
        boolean hasCurrentWeekWalk = walkRecords.stream()
                .anyMatch(record -> !record.getStartAt().toLocalDate().isBefore(currentWeekStart));
        if (!hasCurrentWeekWalk) {
            alerts.add(new ReportAlert(
                    "WALK_RECORD_MISSING",
                    "No walk record has been added this week.",
                    "Add a walk record to improve the report.",
                    "/walk"
            ));
        }

        return alerts;
    }

    private Map<VaccineCode, PetVaccination> getLatestVaccinationByCode(
            List<PetVaccination> vaccinations
    ) {
        Map<VaccineCode, PetVaccination> latestVaccinationByCode = new EnumMap<>(VaccineCode.class);
        for (PetVaccination vaccination : vaccinations) {
            latestVaccinationByCode.putIfAbsent(vaccination.getCode(), vaccination);
        }
        return latestVaccinationByCode;
    }

    private LocalDate getWeekStart(LocalDate date) {
        return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    private long getWalkMinutes(WalkRecord walkRecord) {
        return Math.max(0, Duration.between(walkRecord.getStartAt(), walkRecord.getEndedAt()).toMinutes());
    }
}
