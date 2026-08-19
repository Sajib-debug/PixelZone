package com.skr.PixelZone.dto;

import java.time.Instant;
import java.util.UUID;

public record AlbumResponse(
        UUID id,
        String title,
        UUID coverPhotoId,
        String coverThumbnailUrl,
        Long photoCount,
        Instant createdAt,
        Instant updatedAt
) {
}
