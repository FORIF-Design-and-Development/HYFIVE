package com.hyfive.backend.pet.repository;

import com.hyfive.backend.pet.domain.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PetRepository extends JpaRepository<Pet, Long> {

    boolean existsByUserUserIdAndName(Long userId, String name);

    List<Pet> findAllByUserUserId(Long userId);

    Optional<Pet> findByPetIdAndUserUserId(Long petId, Long userId);
}
