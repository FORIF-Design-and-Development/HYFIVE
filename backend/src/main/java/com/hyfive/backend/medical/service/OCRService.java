package com.hyfive.backend.medical.service;

import com.hyfive.backend.medical.dto.MedicalOcrResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface OCRService {

    MedicalOcrResponseDto analyze(MultipartFile image);

    MedicalOcrResponseDto analyzeMedical(String visitDate, String type, List<MultipartFile> images);
}
