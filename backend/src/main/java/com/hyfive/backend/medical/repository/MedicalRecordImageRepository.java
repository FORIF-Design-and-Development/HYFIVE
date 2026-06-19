package com.hyfive.backend.medical.repository;

import com.hyfive.backend.medical.entity.MedicalRecordImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalRecordImageRepository extends JpaRepository<MedicalRecordImage, Long> {
}
