package com.hyfive.backend.pet.dto;

import com.hyfive.backend.pet.domain.PetGender;
import com.hyfive.backend.pet.domain.PetType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreatePetRequest(
        @NotNull(message = "동물 유형은 필수입니다.")
        PetType type,

        @NotBlank(message = "이름은 필수입니다.")
        String name,

        String breed,

        LocalDate birthdate,

        @NotNull(message = "성별은 필수입니다.")
        PetGender gender,

        @NotNull(message = "중성화 여부는 필수입니다.")
        Boolean isNeutered,

        BigDecimal weightKg,

        LocalDate lastCheckupDate,

        String preExistingIllness,

        @Valid
        List<CreatePetVaccinationRequest> vaccinations
) {
}