package com.hyfive.backend.auth.repository;

import com.hyfive.backend.auth.domain.RefreshToken;
import com.hyfive.backend.auth.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    Optional<RefreshToken> findByUser(User user);
}
