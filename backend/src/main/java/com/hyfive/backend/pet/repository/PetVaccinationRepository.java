package com.hyfive.backend.pet.repository;

import com.hyfive.backend.pet.domain.PetVaccination;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PetVaccinationRepository extends JpaRepository<PetVaccination, Long> {
}
