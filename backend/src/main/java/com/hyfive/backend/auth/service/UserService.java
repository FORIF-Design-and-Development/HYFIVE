package com.hyfive.backend.auth.service;

import com.hyfive.backend.auth.domain.User;
import com.hyfive.backend.auth.dto.UserProfileResponse;
import com.hyfive.backend.auth.dto.UserUpdateRequest;
import com.hyfive.backend.auth.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(()->new
                        ResponseStatusException(HttpStatus.NOT_FOUND,"유저를 찾을 수 없습니다."));

        return toResponse(user);
    }
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."));

        user.updateProfile(request.name(), request.nickname());

        return toResponse(user);
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getEmail(),
                user.getName(),
                user.getNickname(),
                user.getCreatedAt()
        );
    }
}
