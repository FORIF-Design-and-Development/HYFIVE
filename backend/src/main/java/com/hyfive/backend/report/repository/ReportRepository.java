package com.hyfive.backend.report.repository;

import com.hyfive.backend.medical.entity.MedicalRecord;
import com.hyfive.backend.pet.domain.Pet;
import com.hyfive.backend.pet.domain.PetVaccination;
import com.hyfive.backend.pet.domain.WeightLog;
import com.hyfive.backend.walk.entity.WalkRecord;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ReportRepository {

    private final EntityManager entityManager;

    public Optional<Pet> findPetById(Long petId) {
        return Optional.ofNullable(entityManager.find(Pet.class, petId));
    }

    public Optional<Pet> findActivePetByUserId(Long userId) {
        return entityManager.createQuery("""
                        SELECT p
                        FROM UserActivePet activePet
                        JOIN activePet.pet p
                        WHERE activePet.user.userId = :userId
                        """, Pet.class)
                .setParameter("userId", userId)
                .getResultStream()
                .findFirst();
    }

    public List<MedicalRecord> findMedicalRecords(
            Long petId,
            LocalDate startDateInclusive,
            LocalDate endDateExclusive
    ) {
        return entityManager.createQuery("""
                        SELECT medicalRecord
                        FROM MedicalRecord medicalRecord
                        WHERE medicalRecord.petId = :petId
                          AND medicalRecord.visitDate >= :startDate
                          AND medicalRecord.visitDate < :endDate
                        ORDER BY medicalRecord.visitDate ASC
                        """, MedicalRecord.class)
                .setParameter("petId", petId)
                .setParameter("startDate", startDateInclusive)
                .setParameter("endDate", endDateExclusive)
                .getResultList();
    }

    public List<WalkRecord> findWalkRecords(
            Long petId,
            LocalDateTime startAtInclusive,
            LocalDateTime endAtExclusive
    ) {
        return entityManager.createQuery("""
                        SELECT walkRecord
                        FROM WalkRecord walkRecord
                        WHERE walkRecord.petId = :petId
                          AND walkRecord.startAt >= :startAt
                          AND walkRecord.startAt < :endAt
                        ORDER BY walkRecord.startAt ASC
                        """, WalkRecord.class)
                .setParameter("petId", petId)
                .setParameter("startAt", startAtInclusive)
                .setParameter("endAt", endAtExclusive)
                .getResultList();
    }

    public List<WeightLog> findLatestWeightLogs(Long petId, int limit) {
        return entityManager.createQuery("""
                        SELECT weightLog
                        FROM WeightLog weightLog
                        WHERE weightLog.pet.petId = :petId
                        ORDER BY weightLog.createdAt DESC, weightLog.weightLogId DESC
                        """, WeightLog.class)
                .setParameter("petId", petId)
                .setMaxResults(limit)
                .getResultList();
    }

    public List<PetVaccination> findVaccinations(Long petId) {
        return entityManager.createQuery("""
                        SELECT vaccination
                        FROM PetVaccination vaccination
                        WHERE vaccination.pet.petId = :petId
                        ORDER BY vaccination.vaccinationDate DESC, vaccination.vaccinationId DESC
                        """, PetVaccination.class)
                .setParameter("petId", petId)
                .getResultList();
    }
}
