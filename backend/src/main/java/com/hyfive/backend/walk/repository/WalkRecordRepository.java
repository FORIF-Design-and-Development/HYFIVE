package com.hyfive.backend.walk.repository;

import com.hyfive.backend.walk.entity.WalkRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WalkRecordRepository extends JpaRepository<WalkRecord, Long> {
    List<WalkRecord> findByPetIdOrderByStartAtDesc(Long petId);
}