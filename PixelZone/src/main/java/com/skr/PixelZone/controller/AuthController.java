package com.skr.PixelZone.controller;

import com.skr.PixelZone.dto.*;
import com.skr.PixelZone.service.AuthService;
import com.skr.PixelZone.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(registerRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(authService.login(loginRequest));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(authService.refresh(refreshTokenRequest.refreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(@RequestBody(required = false) RefreshTokenRequest refreshTokenRequest) {
        if(refreshTokenRequest != null && refreshTokenRequest.refreshToken() != null) {
            authService.logout(refreshTokenRequest.refreshToken());
        }

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(userService.getUserResponseByEmail(userDetails.getUsername()));
    }

}
