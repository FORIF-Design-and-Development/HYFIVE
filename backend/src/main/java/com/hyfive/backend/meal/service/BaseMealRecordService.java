package com.hyfive.backend.meal.service;

import com.hyfive.backend.meal.domain.LeftoverAmount;
import com.hyfive.backend.meal.domain.MealTime;
import com.hyfive.backend.meal.domain.MealType;
import com.hyfive.backend.meal.dto.MealRecordDto;
import com.hyfive.backend.meal.entity.MealRecord;
import com.hyfive.backend.meal.exception.MealRecordConflictException;
import com.hyfive.backend.meal.repository.MealRecordRepository;
import com.hyfive.backend.pet.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BaseMealRecordService implements MealRecordService {

    private final MealRecordRepository mealRecordRepository;
    private final PetRepository petRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MealRecordDto> getTodayMealRecord(Long petId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime startOfNextDay = startOfDay.plusDays(1);

        return mealRecordRepository
                .findTodayMealRecord(petId, startOfDay, startOfNextDay)
                .stream()
                .map(MealRecordDto::new)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MealRecordDto> getMealRecord(Long petId, LocalDate startDate) {
        LocalDateTime startOfDay = startDate.atStartOfDay();
        LocalDateTime startOfNextDay = startOfDay.plusDays(1);

        return mealRecordRepository
                .findMealRecordByDate(petId, startOfDay, startOfNextDay)
                .stream()
                .map(MealRecordDto::new)
                .toList();
    }

    @Override
    @Transactional(noRollbackFor = MealRecordConflictException.class)
    public MealRecordDto uploadMealRecord(Long petId, MealRecordDto mealRecordDto) {
        if (petId == null || mealRecordDto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "식사 기록 요청이 올바르지 않습니다.");
        }
        if (!petRepository.existsById(petId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "반려동물을 찾을 수 없습니다.");
        }

        MealTime time = parseEnum(MealTime.class, mealRecordDto.getTime(), "식사 시간이 올바르지 않습니다.");
        MealType type = parseEnum(MealType.class, mealRecordDto.getType(), "식사 타입이 올바르지 않습니다.");
        LeftoverAmount isLeft = parseEnum(LeftoverAmount.class, mealRecordDto.getIsLeft(), "남긴 양이 올바르지 않습니다.");
        Integer amount = parseAmount(mealRecordDto.getAmount());

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime startOfNextDay = startOfDay.plusDays(1);

        List<MealRecord> existingMealRecords = mealRecordRepository.findTodayMealRecordByPetIdAndTime(
                petId,
                time,
                startOfDay,
                startOfNextDay
        );

        if (!existingMealRecords.isEmpty()) {
            MealRecord existingMealRecord = existingMealRecords.get(0);
            existingMealRecord.update(time, type, amount, isLeft, mealRecordDto.getMemo());
            throw new MealRecordConflictException("이미 등록된 식사 기록을 수정했습니다.");
        }

        MealRecord mealRecord = MealRecord.builder()
                .petId(petId)
                .time(time)
                .type(type)
                .amount(amount)
                .isLeft(isLeft)
                .memo(mealRecordDto.getMemo())
                .build();

        return new MealRecordDto(mealRecordRepository.save(mealRecord));
    }

    private <T extends Enum<T>> T parseEnum(Class<T> enumType, String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }

        try {
            return Enum.valueOf(enumType, value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private Integer parseAmount(String value) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "식사량이 올바르지 않습니다.");
        }

        try {
            int amount = Integer.parseInt(value.trim());
            if (amount < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "식사량이 올바르지 않습니다.");
            }
            return amount;
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "식사량이 올바르지 않습니다.");
        }
    }
}
