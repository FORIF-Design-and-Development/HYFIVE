package com.hyfive.backend.health.repository;

import com.hyfive.backend.health.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {
    List<HealthRecord> findByPetIdOrderByCreatedAtDesc(Long petId);

    @Query("SELECT h FROM HealthRecord h WHERE h.petId = :petId ORDER BY h.createdAt DESC LIMIT :limit")
    List<HealthRecord> findRecentByPetId(@Param("petId") Long petId, @Param("limit") int limit);
}