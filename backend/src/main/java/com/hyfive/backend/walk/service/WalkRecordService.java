package com.hyfive.backend.walk.service;

import com.hyfive.backend.S3Service;
import com.hyfive.backend.walk.dto.WalkRecordRequestDto;
import com.hyfive.backend.walk.dto.WalkRecordResponseDto;
import com.hyfive.backend.walk.entity.WalkRecord;
import com.hyfive.backend.walk.repository.WalkRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalkRecordService {

    private final WalkRecordRepository walkRecordRepository;
    private final S3Service s3Service;

    // 산책기록 등록
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

    // 산책기록 목록 조회
    @Transactional(readOnly = true)
    public List<WalkRecordResponseDto> getWalkRecords(Long petId) {
        return walkRecordRepository.findByPetIdOrderByStartAtDesc(petId)
                .stream()
                .map(WalkRecordResponseDto::new)
                .collect(Collectors.toList());
    }

    // 동선 이미지 업로드
    @Transactional
    public WalkRecordResponseDto uploadMapImage(Long walkId, MultipartFile image) throws IOException {
        WalkRecord walkRecord = walkRecordRepository.findById(walkId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 산책기록입니다."));

        String imageUrl = s3Service.upload(image);
        walkRecord.updateMapImageUrl(imageUrl);
        return new WalkRecordResponseDto(walkRecord);
    }
}