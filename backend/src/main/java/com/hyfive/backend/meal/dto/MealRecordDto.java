package com.hyfive.backend.meal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hyfive.backend.meal.entity.MealRecord;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MealRecordDto {

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String petId;

    private String time;
    private String type;
    private String amount;

    @JsonProperty("is_left")
    private String isLeft;

    private String memo;

    public MealRecordDto() {
    }

    public MealRecordDto(MealRecord mealRecord) {
        this.time = mealRecord.getTime().name();
        this.type = mealRecord.getType().name();
        this.amount = String.valueOf(mealRecord.getAmount());
        this.isLeft = mealRecord.getIsLeft().name();
        this.memo = mealRecord.getMemo();
    }
}
