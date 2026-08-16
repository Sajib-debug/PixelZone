package com.skr.PixelZone.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserResponse user
) {
}
