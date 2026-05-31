package com.hyfive.backend.pet.controller;

import com.hyfive.backend.auth.security.CustomUserDetails;
import com.hyfive.backend.pet.dto.*;
import com.hyfive.backend.pet.service.PetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        CreatePetResponse response = petService.createPet(userDetails.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/active")
    public ResponseEntity<PetProfileResponse> getActivePetProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        PetProfileResponse response = petService.getActivePetProfile(userDetails.getUserId());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<PetProfileResponse>> getAllPetProfiles(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<PetProfileResponse> response = petService.getAllPetProfiles(userDetails.getUserId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{petId}/activate")
    public ResponseEntity<PetProfileResponse> switchActivePet(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long petId
    ) {
        PetProfileResponse response = petService.switchActivePet(userDetails.getUserId(), petId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{petId}")
    public ResponseEntity<PetProfileResponse> updatePet(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long petId,
            @RequestBody UpdatePetRequest request
    ) {
        PetProfileResponse response = petService.updatePet(userDetails.getUserId(), petId, request);
        return ResponseEntity.ok(response);
    }

}