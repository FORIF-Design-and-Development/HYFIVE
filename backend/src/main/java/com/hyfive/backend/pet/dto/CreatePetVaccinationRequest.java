package com.hyfive.backend.pet.dto;

import com.hyfive.backend.pet.domain.VaccineCode;
import jakarta.validation.constraints.NotNull;

public record CreatePetVaccinationRequest(
        @NotNull(message = "백신 코드는 필수입니다.")
        VaccineCode code,

        @NotNull(message = "백신 완료 여부는 필수입니다.")
        Boolean isCompleted
) {
}
