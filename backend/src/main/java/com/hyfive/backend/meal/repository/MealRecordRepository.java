package com.hyfive.backend.meal.repository;

import com.hyfive.backend.meal.domain.MealTime;
import com.hyfive.backend.meal.entity.MealRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MealRecordRepository extends JpaRepository<MealRecord, Long> {

    @Query("""
            SELECT m
            FROM MealRecord m
            WHERE m.petId = :petId
              AND m.createdAt >= :startOfDay
              AND m.createdAt < :startOfNextDay
            ORDER BY m.createdAt ASC
            """)
    List<MealRecord> findTodayMealRecord(
            @Param("petId") Long petId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay
    );

    @Query("""
            SELECT m
            FROM MealRecord m
            WHERE m.petId = :petId
              AND m.createdAt >= :startOfDay
              AND m.createdAt < :startOfNextDay
            ORDER BY m.createdAt ASC
            """)
    List<MealRecord> findMealRecordByDate(
            @Param("petId") Long petId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay
    );

    @Query("""
            SELECT COUNT(m) > 0
            FROM MealRecord m
            WHERE m.petId = :petId
              AND m.time = :time
              AND m.createdAt >= :startOfDay
              AND m.createdAt < :startOfNextDay
            """)
    boolean existsTodayMealRecordByPetIdAndTime(
            @Param("petId") Long petId,
            @Param("time") MealTime time,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay
    );

    @Query("""
            SELECT m
            FROM MealRecord m
            WHERE m.petId = :petId
              AND m.time = :time
              AND m.createdAt >= :startOfDay
              AND m.createdAt < :startOfNextDay
            """)
    List<MealRecord> findTodayMealRecordByPetIdAndTime(
            @Param("petId") Long petId,
            @Param("time") MealTime time,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay
    );
}
