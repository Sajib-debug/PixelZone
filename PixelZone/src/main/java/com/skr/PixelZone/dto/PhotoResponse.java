package com.skr.PixelZone.dto;

import com.skr.PixelZone.entity.AiTransformType;
import com.skr.PixelZone.entity.PhotoStatus;

import java.time.Instant;
import java.util.UUID;

public record PhotoResponse(
        UUID id,
        String imagekitFileId,
        String fileName,
        String url,
        String thumbnailUrl,
        String mimeType,
        Long sizeBytes,
        Integer width,
        Integer height,
        PhotoStatus status,
        Instant createdAt,
        Instant deletedAt,
        UUID parentPhotoId,
        AiTransformType aiTransformType
) {
}
