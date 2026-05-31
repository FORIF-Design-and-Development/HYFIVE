package com.hyfive.backend.pet.repository;

import com.hyfive.backend.pet.domain.WeightLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WeightLogRepository extends JpaRepository<WeightLog, Long> {

    Optional<WeightLog> findTopByPetPetIdOrderByCreatedAtDesc(Long petId);
}
