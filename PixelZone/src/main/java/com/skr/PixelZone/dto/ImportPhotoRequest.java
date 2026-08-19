package com.skr.PixelZone.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ImportPhotoRequest(
        @NotEmpty
        List<String> imagekitFileIds
) {
}
