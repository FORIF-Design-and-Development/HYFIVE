package com.hyfive.backend.walk.service;

import com.hyfive.backend.walk.dto.WalkRecordRequestDto;
import com.hyfive.backend.walk.dto.WalkRecordResponseDto;
import com.hyfive.backend.walk.entity.WalkRecord;
import com.hyfive.backend.walk.repository.WalkRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalkRecordService {

    private final WalkRecordRepository walkRecordRepository;

    @Transactional
    public WalkRecordResponseDto createWalkRecord(WalkRecordRequestDto requestDto) {
        WalkRecord walkRecord = WalkRecord.builder()
                .petId(requestDto.getPetId())
                .startAt(requestDto.getStartAt())
                .endedAt(requestDto.getEndedAt())
                .distanceKm(requestDto.getDistanceKm())
                .calories(requestDto.getCalories())
                .build();

        return new WalkRecordResponseDto(walkRecordRepository.save(walkRecord));
    }

    @Transactional(readOnly = true)
    public List<WalkRecordResponseDto> getWalkRecords(Long petId) {
        return walkRecordRepository.findByPetIdOrderByStartAtDesc(petId)
                .stream()
                .map(WalkRecordResponseDto::new)
                .collect(Collectors.toList());
    }
}