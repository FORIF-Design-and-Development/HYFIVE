package com.hyfive.backend.pet.dto;

import java.math.BigDecimal;

public record UpdatePetRequest(
        String profileImageUrl,
        Boolean isNeutered,
        BigDecimal weightKg
) {}