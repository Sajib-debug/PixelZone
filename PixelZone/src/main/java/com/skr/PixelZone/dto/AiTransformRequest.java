package com.skr.PixelZone.dto;

import com.skr.PixelZone.entity.AiTransformType;
import jakarta.validation.constraints.NotNull;

public record AiTransformRequest(
        @NotNull
        AiTransformType type,
        String prompt,
        Integer width,
        Integer height,
        String focusObject
) {
}
