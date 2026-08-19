package com.skr.PixelZone.dto;

public record StorageUsageResponse(
        long libraryUsedBytes,
        long libraryPhotoCount,
        Long imagekitBandwidthBytes,
        Long imagekitStorageBytes
) {
}
