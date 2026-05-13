package com.hyfive.backend.auth.service;

import com.hyfive.backend.auth.domain.RefreshToken;
import com.hyfive.backend.auth.domain.SocialAccount;
import com.hyfive.backend.auth.domain.User;
import com.hyfive.backend.auth.dto.GoogleLoginRequest;
import com.hyfive.backend.auth.dto.GoogleLoginResponse;
import com.hyfive.backend.auth.dto.GoogleUserInfo;
import com.hyfive.backend.auth.repository.RefreshTokenRepository;
import com.hyfive.backend.auth.repository.SocialAccountRepository;
import com.hyfive.backend.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
public class AuthService {

    private static final String GOOGLE_PROVIDER = "GOOGLE";

    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshTokenExpirationDays;

    public AuthService(
            GoogleTokenVerifier googleTokenVerifier,
            JwtService jwtService,
            UserRepository userRepository,
            SocialAccountRepository socialAccountRepository,
            RefreshTokenRepository refreshTokenRepository,
            @Value("${jwt.refresh-token-expiration-days}") long refreshTokenExpirationDays
    ) {
        this.googleTokenVerifier = googleTokenVerifier;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.socialAccountRepository = socialAccountRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenExpirationDays = refreshTokenExpirationDays;
    }

    @Transactional
    public GoogleLoginResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleUserInfo googleUserInfo = googleTokenVerifier.verify(request.idToken());

        UserLoginResult userLoginResult = findOrCreateGoogleUser(googleUserInfo);
        User user = userLoginResult.user();

        String accessToken = jwtService.createAccessToken(user.getUserId(), user.getEmail());
        String refreshToken = jwtService.createRefreshToken(user.getUserId());

        saveRefreshToken(user, refreshToken);

        return new GoogleLoginResponse(
                accessToken,
                refreshToken,
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                userLoginResult.isNewUser()
        );
    }

    private UserLoginResult findOrCreateGoogleUser(GoogleUserInfo googleUserInfo) {
        return socialAccountRepository
                .findByProviderAndProviderId(GOOGLE_PROVIDER, googleUserInfo.providerId())
                .map(socialAccount -> new UserLoginResult(socialAccount.getUser(), false))
                .orElseGet(() -> createOrLinkGoogleUser(googleUserInfo));
    }

    //구글 계정 연결은 없는데 email이 같은 유저가 있는지
    private UserLoginResult createOrLinkGoogleUser(GoogleUserInfo googleUserInfo) {
        return userRepository
                .findByEmail(googleUserInfo.email())
                .map(user -> {
                    SocialAccount socialAccount = SocialAccount.createGoogleAccount(
                            googleUserInfo.providerId(),
                            user
                    );
                    socialAccountRepository.save(socialAccount);

                    return new UserLoginResult(user, false);
                })
                .orElseGet(() -> {
                    User user = userRepository.save(
                            User.createGoogleUser(googleUserInfo.email(), googleUserInfo.name())
                    );

                    SocialAccount socialAccount = SocialAccount.createGoogleAccount(
                            googleUserInfo.providerId(),
                            user
                    );
                    socialAccountRepository.save(socialAccount);

                    return new UserLoginResult(user, true);
                });
    }


    private void saveRefreshToken(User user, String refreshToken) {
        String tokenHash = hashToken(refreshToken);
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(refreshTokenExpirationDays);

        RefreshToken token = RefreshToken.create(user, tokenHash, expiresAt);

        refreshTokenRepository.save(token);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashedBytes);
        } catch (Exception e) {
            throw new IllegalStateException("Refresh token 해시 생성에 실패했습니다.", e);
        }
    }

    private record UserLoginResult(User user, boolean isNewUser) {
    }
}
