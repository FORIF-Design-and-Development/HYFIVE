package com.hyfive.backend.health.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "health_records")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "health_record_id")
    private Long healthRecordId;

    @Column(name = "pet_id", nullable = false)
    private Long petId;

    // UI에서 28.3kg처럼 소수점을 표시하므로 Double로 변경
    @Column(name = "weight", nullable = false)
    private Double weight;

    @Enumerated(EnumType.STRING)
    @Column(name = "bowel_status", nullable = false, length = 10)
    private BowelStatus bowelStatus;

    // 투약·영양제 목록 (health_record_medications 테이블)
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "health_record_medications",
            joinColumns = @JoinColumn(name = "health_record_id")
    )
    @Builder.Default
    private List<Medication> medications = new ArrayList<>();

    // 특이증상 목록 (health_record_symptoms 테이블)
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "health_record_symptoms",
            joinColumns = @JoinColumn(name = "health_record_id")
    )
    @Column(name = "symptom")
    @Builder.Default
    private List<String> symptoms = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void update(Double weight, BowelStatus bowelStatus,
                       List<Medication> medications, List<String> symptoms) {
        this.weight = weight;
        this.bowelStatus = bowelStatus;
        this.medications.clear();
        this.medications.addAll(medications);
        this.symptoms.clear();
        this.symptoms.addAll(symptoms);
    }

    public enum BowelStatus {
        NORMAL, SOFT, HARD, BLOOD, NONE
    }
}
