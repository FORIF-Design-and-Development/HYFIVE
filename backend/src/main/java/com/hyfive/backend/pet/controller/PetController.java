package com.hyfive.backend.pet.controller;

import com.hyfive.backend.auth.security.CustomUserDetails;
import com.hyfive.backend.pet.dto.CreatePetRequest;
import com.hyfive.backend.pet.dto.CreatePetResponse;
import com.hyfive.backend.pet.service.PetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pets")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @PostMapping
    public ResponseEntity<CreatePetResponse> createPet(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreatePetRequest request
    ) {
        CreatePetResponse response = petService.createPet(
                userDetails.getUserId(),
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}