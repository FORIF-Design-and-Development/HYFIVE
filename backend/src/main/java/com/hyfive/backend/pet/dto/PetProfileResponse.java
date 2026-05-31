package com.hyfive.backend.pet.dto;

import com.hyfive.backend.pet.domain.DogSize;
import com.hyfive.backend.pet.domain.PetGender;
import com.hyfive.backend.pet.domain.PetType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PetProfileResponse(
        Long petId,
        String name,
        PetType type,
        DogSize dogSize,
        String breed,
        LocalDate birthdate,
        Integer ageYears,
        BigDecimal weightKg,
        PetGender gender,
        Boolean isNeutered,
        String profileImageUrl,
        boolean isActive
) {}