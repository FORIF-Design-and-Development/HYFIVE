package com.hyfive.backend;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
public class ImageController {

    private final S3Service s3Service;

    @PostMapping("/images")
    public String upload(
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return s3Service.upload(file);
    }

    @DeleteMapping("/images")
    public ResponseEntity<Void> delete(
            @RequestParam("url") String url
    ) {
        s3Service.delete(url);
        return ResponseEntity.noContent().build();
    }
}