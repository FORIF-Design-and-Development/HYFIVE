package com.hyfive.backend.meal.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class MealRecordConflictException extends ResponseStatusException {

    public MealRecordConflictException(String reason) {
        super(HttpStatus.CONFLICT, reason);
    }
}
