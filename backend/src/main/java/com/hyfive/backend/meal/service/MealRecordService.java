package com.hyfive.backend.meal.service;

import com.hyfive.backend.meal.dto.MealRecordDto;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public interface MealRecordService {
    List<MealRecordDto> getTodayMealRecord(Long petId);

    List<MealRecordDto> getMealRecord(Long petId, LocalDate startDate);

    MealRecordDto uploadMealRecord(Long petId, MealRecordDto mealRecordDto);
}
