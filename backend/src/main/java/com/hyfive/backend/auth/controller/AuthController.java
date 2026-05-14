package com.hyfive.backend.auth.controller;

import com.hyfive.backend.auth.dto.GoogleLoginRequest;
import com.hyfive.backend.auth.dto.GoogleLoginResponse;
import com.hyfive.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/google")
    public GoogleLoginResponse loginWithGoogle(
            @Valid @RequestBody GoogleLoginRequest request
    ) {
        return authService.loginWithGoogle(request);
    }
}
