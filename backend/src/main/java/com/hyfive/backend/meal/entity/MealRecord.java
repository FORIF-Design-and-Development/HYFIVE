package com.hyfive.backend.meal.entity;

import com.hyfive.backend.meal.domain.LeftoverAmount;
import com.hyfive.backend.meal.domain.MealTime;
import com.hyfive.backend.meal.domain.MealType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "meal_records")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MealRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "meal_record_id")
    private Long mealRecordId;

    @Enumerated(EnumType.STRING)
    @Column(name = "time", nullable = false, length = 10)
    private MealTime time;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private MealType type;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_left", nullable = false, length = 10)
    private LeftoverAmount isLeft;

    @Column(name = "memo", columnDefinition = "text")
    private String memo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "pet_id", nullable = false)
    private Long petId;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void update(MealTime time, MealType type, Integer amount,
                       LeftoverAmount isLeft, String memo) {
        this.time = time;
        this.type = type;
        this.amount = amount;
        this.isLeft = isLeft;
        this.memo = memo;
    }
}
