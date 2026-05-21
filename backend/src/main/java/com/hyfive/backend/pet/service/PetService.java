package com.hyfive.backend.pet.service;

import com.hyfive.backend.auth.domain.User;
import com.hyfive.backend.auth.repository.UserRepository;
import com.hyfive.backend.pet.domain.Pet;
import com.hyfive.backend.pet.domain.PetVaccination;
import com.hyfive.backend.pet.domain.WeightLog;
import com.hyfive.backend.pet.dto.CreatePetRequest;
import com.hyfive.backend.pet.dto.CreatePetResponse;
import com.hyfive.backend.pet.dto.CreatePetVaccinationRequest;
import com.hyfive.backend.pet.repository.PetRepository;
import com.hyfive.backend.pet.repository.PetVaccinationRepository;
import com.hyfive.backend.pet.repository.WeightLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
@Transactional
public class PetService {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final WeightLogRepository weightLogRepository;
    private final PetVaccinationRepository petVaccinationRepository;

    public PetService(
            UserRepository userRepository,
            PetRepository petRepository,
            WeightLogRepository weightLogRepository,
            PetVaccinationRepository petVaccinationRepository
    ) {
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.weightLogRepository = weightLogRepository;
        this.petVaccinationRepository = petVaccinationRepository;
    }

    public CreatePetResponse createPet(Long userId, CreatePetRequest request) {
        User user = findUser(userId);
        validateDuplicatePetName(userId, request.name());

        Pet pet = Pet.create(
                user,
                request.type(),
                request.name(),
                request.breed(),
                request.birthdate(),
                request.gender(),
                request.isNeutered(),
                request.lastCheckupDate(),
                request.preExistingIllness(),
                request.profileImageUrl()
        );

        Pet savedPet = petRepository.save(pet);

        if (request.weightKg() != null) {
            WeightLog weightLog = WeightLog.create(savedPet, request.weightKg());
            weightLogRepository.save(weightLog);
        }

        int completedVaccinationCount = saveCompletedVaccinations(savedPet, request);

        return new CreatePetResponse(
                savedPet.getPetId(),
                savedPet.getType(),
                savedPet.getName(),
                savedPet.getBreed(),
                savedPet.getBirthdate(),
                savedPet.getGender(),
                savedPet.getIsNeutered(),
                request.weightKg(),
                savedPet.getLastCheckupDate(),
                savedPet.getPreExistingIllness(),
                completedVaccinationCount
        );
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }

    private void validateDuplicatePetName(Long userId, String name) {
        if (petRepository.existsByUserUserIdAndName(userId, name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 등록된 반려동물 이름입니다.");
        }
    }

    private int saveCompletedVaccinations(Pet pet, CreatePetRequest request) {
        if (request.vaccinations() == null || request.vaccinations().isEmpty()) {
            return 0;
        }

        int completedCount = 0;

        for (CreatePetVaccinationRequest vaccinationRequest : request.vaccinations()) {
            if (!Boolean.TRUE.equals(vaccinationRequest.isCompleted())) {
                continue;
            }

            PetVaccination vaccination = PetVaccination.create(
                    pet,
                    vaccinationRequest.code(),
                    LocalDate.now()
            );

            petVaccinationRepository.save(vaccination);
            completedCount++;
        }

        return completedCount;
    }
}
