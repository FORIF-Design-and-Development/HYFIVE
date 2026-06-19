package com.hyfive.backend.medical.repository;

import com.hyfive.backend.medical.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicalRepository extends JpaRepository<MedicalRecord, Long> {

    @Query("""
            SELECT DISTINCT m
            FROM MedicalRecord m
            LEFT JOIN FETCH m.prescriptions
            WHERE m.petId = :petId
            ORDER BY m.visitDate DESC, m.createdAt DESC
            """)
    List<MedicalRecord> findAllByPetId(@Param("petId") Long petId);
}
