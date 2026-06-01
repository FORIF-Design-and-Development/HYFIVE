package com.hyfive.backend.pet.repository;

import com.hyfive.backend.pet.domain.UserActivePet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserActivePetRepository extends JpaRepository<UserActivePet, Long> {

    Optional<UserActivePet> findByUserUserId(Long userId);
}
