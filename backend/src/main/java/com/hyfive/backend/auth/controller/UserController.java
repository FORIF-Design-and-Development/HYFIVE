package com.hyfive.backend.auth.controller;

import com.hyfive.backend.auth.dto.UserProfileResponse;
import com.hyfive.backend.auth.dto.UserUpdateRequest;
import com.hyfive.backend.auth.security.CustomUserDetails;
import com.hyfive.backend.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserProfileResponse getProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return userService.getProfile(userDetails.getUserId());
    }

    @PatchMapping("/me")
    public UserProfileResponse updateProfile(
            @Valid @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return userService.updateProfile(userDetails.getUserId(), request);
    }
}