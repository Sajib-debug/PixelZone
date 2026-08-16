package com.skr.PixelZone.service;

import com.skr.PixelZone.dto.AuthResponse;
import com.skr.PixelZone.dto.RegisterRequest;
import com.skr.PixelZone.entity.RefreshToken;
import com.skr.PixelZone.entity.User;
import com.skr.PixelZone.exception.ResourceConflictException;
import com.skr.PixelZone.repository.RefreshTokenRepository;
import com.skr.PixelZone.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       UserService userService,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        String email = registerRequest.email().toLowerCase().trim();

        if(userRepository.findByEmail(email).isPresent()) {
            throw new ResourceConflictException("Email already exists!");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(registerRequest.password()))
                .displayName(registerRequest.displayName().trim())
                .build();

        userRepository.save(user);
        return buildAuthResponse(user);
    }


    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshTokenValue();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenValue)
                .expiresAt(jwtService.refreshTokenExpiry())
                .build();
        refreshTokenRepository.save(refreshToken);
        return new AuthResponse(
                accessToken,
                refreshTokenValue,
                userService.toUserResponse(user)
        );
    }

}
