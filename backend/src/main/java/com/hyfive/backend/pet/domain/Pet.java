package com.hyfive.backend.pet.domain;

import com.hyfive.backend.auth.domain.User;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "pets",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_pets_user_id_name", columnNames = {"user_id", "name"})
        }
)
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pet_id")
    private Long petId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PetType type;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(length = 255)
    private String breed;

    private LocalDate birthdate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PetGender gender;

    @Column(name = "is_neutered", nullable = false)
    private Boolean isNeutered;

    @Enumerated(EnumType.STRING)
    @Column(name = "dog_size", length = 10)
    private DogSize dogSize;

    @Column(name = "checkup_date")
    private LocalDate lastCheckupDate;

    @Column(name = "pre_existing_illness", columnDefinition = "text")
    private String preExistingIllness;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected Pet() {}

    private Pet(
            User user, PetType type, DogSize dogSize, String name, String breed,
            LocalDate birthdate, PetGender gender, Boolean isNeutered,
            LocalDate lastCheckupDate, String preExistingIllness, String profileImageUrl
    ) {
        this.user = user;
        this.type = type;
        this.dogSize = dogSize;
        this.name = name;
        this.breed = breed;
        this.birthdate = birthdate;
        this.gender = gender;
        this.isNeutered = isNeutered;
        this.lastCheckupDate = lastCheckupDate;
        this.preExistingIllness = preExistingIllness;
        this.profileImageUrl = profileImageUrl;
    }

    public static Pet create(
            User user, PetType type, DogSize dogSize, String name, String breed,
            LocalDate birthdate, PetGender gender, Boolean isNeutered,
            LocalDate lastCheckupDate, String preExistingIllness, String profileImageUrl
    ) {
        return new Pet(user, type, dogSize, name, breed, birthdate, gender,
                isNeutered, lastCheckupDate, preExistingIllness, profileImageUrl);
    }

    public void update(Boolean isNeutered, String profileImageUrl) {
        if (isNeutered != null) this.isNeutered = isNeutered;
        if (profileImageUrl != null) this.profileImageUrl = profileImageUrl;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getPetId() { return petId; }
    public PetType getType() { return type; }
    public DogSize getDogSize() { return dogSize; }
    public String getName() { return name; }
    public String getBreed() { return breed; }
    public LocalDate getBirthdate() { return birthdate; }
    public PetGender getGender() { return gender; }
    public Boolean getIsNeutered() { return isNeutered; }
    public LocalDate getLastCheckupDate() { return lastCheckupDate; }
    public String getPreExistingIllness() { return preExistingIllness; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public User getUser() { return user; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}