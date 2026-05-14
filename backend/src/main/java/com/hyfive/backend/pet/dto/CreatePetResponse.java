package com.hyfive.backend.pet.dto;

import com.hyfive.backend.pet.domain.PetGender;
import com.hyfive.backend.pet.domain.PetType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreatePetResponse(
        Long petId,
        PetType type,
        String name,
        String breed,
        LocalDate birthdate,
        PetGender gender,
        Boolean isNeutered,
        BigDecimal weightKg,
        LocalDate lastCheckupDate,
        String preExistingIllness,
        int completedVaccinationCount
) {
}