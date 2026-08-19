package com.skr.PixelZone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record CreatePhotoRequest(
        @NotBlank
        String imagekitFileId,

        @NotBlank
        String fileName,

        @NotBlank
        String url,

        String thumbnailUrl,
        String mimeType,

        @NotBlank
        @PositiveOrZero
        Long sizeBytes,

        Integer width,
        Integer height
){
}
