package com.hyfive.backend.health.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Medication {

    @Column(name = "medication_name", nullable = false)
    private String name;

    @Column(name = "is_taken", nullable = false)
    private Boolean isTaken;
}
