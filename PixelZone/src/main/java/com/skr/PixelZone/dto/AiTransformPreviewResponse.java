package com.skr.PixelZone.dto;

import com.skr.PixelZone.entity.AiTransformType;

public record AiTransformPreviewResponse(
        String previewUrl,
        AiTransformType type,
        String transformChain
) {
}
