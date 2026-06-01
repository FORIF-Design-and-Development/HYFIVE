package com.hyfive.backend.pet.service;

import com.hyfive.backend.auth.domain.User;
import com.hyfive.backend.auth.repository.UserRepository;
import com.hyfive.backend.pet.domain.Pet;
import com.hyfive.backend.pet.domain.PetVaccination;
import com.hyfive.backend.pet.domain.UserActivePet;
import com.hyfive.backend.pet.domain.WeightLog;
import com.hyfive.backend.pet.dto.*;
import com.hyfive.backend.pet.repository.PetRepository;
import com.hyfive.backend.pet.repository.PetVaccinationRepository;
import com.hyfive.backend.pet.repository.UserActivePetRepository;
import com.hyfive.backend.pet.repository.WeightLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PetService {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final WeightLogRepository weightLogRepository;
    private final PetVaccinationRepository petVaccinationRepository;
    private final UserActivePetRepository userActivePetRepository;

    public PetService(
            UserRepository userRepository,
            PetRepository petRepository,
            WeightLogRepository weightLogRepository,
            PetVaccinationRepository petVaccinationRepository,
            UserActivePetRepository userActivePetRepository
    ) {
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.weightLogRepository = weightLogRepository;
        this.petVaccinationRepository = petVaccinationRepository;
        this.userActivePetRepository = userActivePetRepository;
    }

    public CreatePetResponse createPet(Long userId, CreatePetRequest request) {
        User user = findUser(userId);
        validateDuplicatePetName(userId, request.name());

        Pet pet = Pet.create(
                user,
                request.type(),
                request.dogSize(),
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

        // 첫 번째 반려동물이면 자동으로 활성 프로필로 설정
        boolean isFirstPet = userActivePetRepository.findByUserUserId(userId).isEmpty();
        if (isFirstPet) {
            UserActivePet activePet = UserActivePet.create(user, savedPet);
            userActivePetRepository.save(activePet);
        }

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

    @Transactional(readOnly = true)
    public PetProfileResponse getActivePetProfile(Long userId) {
        UserActivePet activePet = userActivePetRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "활성 반려동물 프로필이 없습니다."));

        Pet pet = activePet.getPet();
        BigDecimal latestWeight = getLatestWeight(pet.getPetId());

        return toPetProfileResponse(pet, latestWeight, true);
    }

    @Transactional(readOnly = true)
    public List<PetProfileResponse> getAllPetProfiles(Long userId) {
        List<Pet> pets = petRepository.findAllByUserUserId(userId);
        Optional<Long> activePetId = userActivePetRepository.findByUserUserId(userId)
                .map(uap -> uap.getPet().getPetId());

        return pets.stream()
                .map(pet -> {
                    BigDecimal latestWeight = getLatestWeight(pet.getPetId());
                    boolean isActive = activePetId.map(id -> id.equals(pet.getPetId())).orElse(false);
                    return toPetProfileResponse(pet, latestWeight, isActive);
                })
                .toList();
    }

    public PetProfileResponse updatePet(Long userId, Long petId, UpdatePetRequest request) {
        Pet pet = petRepository.findByPetIdAndUserUserId(petId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "반려동물을 찾을 수 없습니다."));

        // 엔티티 업데이트 (dirty checking)
        pet.update(request.isNeutered(), request.profileImageUrl());

        // 체중 변경 시 WeightLog에 새 기록 추가
        if (request.weightKg() != null) {
            WeightLog weightLog = WeightLog.create(pet, request.weightKg());
            weightLogRepository.save(weightLog);
        }

        Optional<Long> activePetId = userActivePetRepository.findByUserUserId(userId)
                .map(uap -> uap.getPet().getPetId());
        boolean isActive = activePetId.map(id -> id.equals(petId)).orElse(false);

        return toPetProfileResponse(pet, getLatestWeight(petId), isActive);
    }
    @Transactional(readOnly = true)
    public PetProfileResponse getPetProfile(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "반려동물을 찾을 수 없습니다."));
        BigDecimal latestWeight = getLatestWeight(petId);
        return toPetProfileResponse(pet, latestWeight, false);
    }

    public PetProfileResponse switchActivePet(Long userId, Long petId) {
        User user = findUser(userId);
        Pet pet = petRepository.findByPetIdAndUserUserId(petId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "반려동물을 찾을 수 없습니다."));

        UserActivePet activePet = userActivePetRepository.findByUserUserId(userId)
                .orElseGet(() -> UserActivePet.create(user, pet));

        activePet.switchPet(pet);
        userActivePetRepository.save(activePet);

        BigDecimal latestWeight = getLatestWeight(pet.getPetId());
        return toPetProfileResponse(pet, latestWeight, true);
    }

    private BigDecimal getLatestWeight(Long petId) {
        return weightLogRepository.findTopByPetPetIdOrderByCreatedAtDesc(petId)
                .map(WeightLog::getWeightKg)
                .orElse(null);
    }

    private PetProfileResponse toPetProfileResponse(Pet pet, BigDecimal weightKg, boolean isActive) {
        Integer ageYears = null;
        if (pet.getBirthdate() != null) {
            ageYears = Period.between(pet.getBirthdate(), LocalDate.now()).getYears();
        }

        return new PetProfileResponse(
                pet.getPetId(),
                pet.getName(),
                pet.getType(),
                pet.getDogSize(),
                pet.getBreed(),
                pet.getBirthdate(),
                ageYears,
                weightKg,
                pet.getGender(),
                pet.getIsNeutered(),
                pet.getProfileImageUrl(),
                isActive
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
