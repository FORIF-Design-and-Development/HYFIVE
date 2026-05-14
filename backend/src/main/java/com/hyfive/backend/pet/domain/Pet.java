package com.hyfive.backend.pet.domain;

import com.hyfive.backend.auth.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

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

    protected Pet() {
    }

    private Pet(
            User user,
            PetType type,
            String name,
            String breed,
            LocalDate birthdate,
            PetGender gender,
            Boolean isNeutered,
            LocalDate lastCheckupDate,
            String preExistingIllness
    ) {
        this.user = user;
        this.type = type;
        this.name = name;
        this.breed = breed;
        this.birthdate = birthdate;
        this.gender = gender;
        this.isNeutered = isNeutered;
        this.lastCheckupDate = lastCheckupDate;
        this.preExistingIllness = preExistingIllness;
    }

    public static Pet create(
            User user,
            PetType type,
            String name,
            String breed,
            LocalDate birthdate,
            PetGender gender,
            Boolean isNeutered,
            LocalDate lastCheckupDate,
            String preExistingIllness
    ) {
        return new Pet(
                user,
                type,
                name,
                breed,
                birthdate,
                gender,
                isNeutered,
                lastCheckupDate,
                preExistingIllness
        );
    }

    public void updateProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
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

    public Long getPetId() {
        return petId;
    }

    public PetType getType() {
        return type;
    }

    public String getName() {
        return name;
    }

    public String getBreed() {
        return breed;
    }

    public LocalDate getBirthdate() {
        return birthdate;
    }

    public PetGender getGender() {
        return gender;
    }

    public Boolean getIsNeutered() {
        return isNeutered;
    }

    public LocalDate getLastCheckupDate() {
        return lastCheckupDate;
    }

    public String getPreExistingIllness() {
        return preExistingIllness;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public User getUser() {
        return user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
