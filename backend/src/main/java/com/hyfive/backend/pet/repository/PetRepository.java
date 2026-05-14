package com.hyfive.backend.pet.repository;

import com.hyfive.backend.pet.domain.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PetRepository extends JpaRepository<Pet, Long> {

    boolean existsByUserUserIdAndName(Long userId, String name);
}
