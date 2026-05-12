package com.hyfive.backend.auth.controller;

import com.hyfive.backend.auth.dto.GoogleLoginRequest;
import com.hyfive.backend.auth.dto.GoogleLoginResponse;
import com.hyfive.backend.auth.dto.GoogleUserInfo;
import com.hyfive.backend.auth.service.GoogleTokenVerifier;
import com.hyfive.backend.auth.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final JwtService jwtService;
    private final GoogleTokenVerifier googleTokenVerifier;

    public AuthController(
            JwtService jwtService,
            GoogleTokenVerifier googleTokenVerifier
    ) {
        this.jwtService = jwtService;
        this.googleTokenVerifier = googleTokenVerifier;
    }

    @PostMapping("/auth/google")
    public GoogleLoginResponse loginWithGoogle(
            @Valid @RequestBody GoogleLoginRequest request
    ) {
        GoogleUserInfo googleUserInfo = googleTokenVerifier.verify(request.idToken());

        Long userId = 1L;

        String accessToken = jwtService.createAccessToken(userId, googleUserInfo.email());
        String refreshToken = jwtService.createRefreshToken(userId);

        return new GoogleLoginResponse(
                accessToken,
                refreshToken,
                userId,
                googleUserInfo.email(),
                googleUserInfo.name(),
                true
        );
    }
}
