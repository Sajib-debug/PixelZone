package com.skr.PixelZone.service;

import com.skr.PixelZone.dto.AiTransformPreviewResponse;
import com.skr.PixelZone.dto.AiTransformRequest;
import com.skr.PixelZone.dto.PhotoResponse;
import com.skr.PixelZone.entity.Photo;
import com.skr.PixelZone.entity.User;
import com.skr.PixelZone.exception.BadRequestException;
import com.skr.PixelZone.exception.ResourceNotFoundException;
import com.skr.PixelZone.repository.PhotoRepository;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static com.skr.PixelZone.entity.AiTransformType.*;

@Service
public class AiTransformService {

    private final PhotoService photoService;
    private final ImageKitService imageKitService;
    private final PhotoRepository photoRepository;

    public AiTransformService(
            PhotoService photoService,
            ImageKitService imageKitService,
            PhotoRepository photoRepository
    ) {
        this.photoService = photoService;
        this.imageKitService = imageKitService;
        this.photoRepository = photoRepository;
    }

    String buildTransformChain(
            AiTransformRequest request,
            Photo photo
    ) {
        return switch (request.type()) {

            case REMOVE_BACKGROUND ->
                    "e-bgremove";

            case BACKGROUND_AND_SHADOW ->
                    "e-bgremove:e-dropshadow";

            case CHANGE_BACKGROUND -> {
                requirePrompt(request);

                yield "e-changebg-prompt-"
                        + urlEncodePrompt(request.prompt());
            }

            case GENERATIVE_FILL -> {
                int width = requireDimension(
                        request.width(),
                        "width"
                );

                int height = requireDimension(
                        request.height(),
                        "height"
                );

                if (request.prompt() != null
                        && !request.prompt().isBlank()) {

                    yield "bg-genfill-prompt-"
                            + urlEncodePrompt(request.prompt())
                            + ",w-" + width
                            + ",h-" + height
                            + ",cm-pad_resize";
                }

                yield "bg-genfill"
                        + ",w-" + width
                        + ",h-" + height
                        + ",cm-pad_resize";
            }

            case SMART_CROP -> {
                int width = requireDimension(
                        request.width(),
                        "width"
                );

                int height = requireDimension(
                        request.height(),
                        "height"
                );

                yield "w-" + width
                        + ",h-" + height
                        + ",fo-auto";
            }

            case OBJECT_CROP -> {
                requireFocusObject(request);

                yield "fo-"
                        + sanitizeFocusObject(
                        request.focusObject()
                );
            }

            case RETOUCH ->
                    "e-retouch";

            case UPSCALE ->
                    "e-upscale";

            case AI_EDIT -> {
                requirePrompt(request);

                yield "e-edit-prompt-"
                        + urlEncodePrompt(request.prompt());
            }
        };
    }

    // Preview method
    public AiTransformPreviewResponse preview(
            User user,
            UUID photoId,
            AiTransformRequest request
    ) {
        Photo photo = getActivePhoto(user, photoId);

        String transformChain =
                buildTransformChain(request, photo);

        String previewUrl =
                imageKitService.buildAiTransformUrl(
                        photo.getUrl(),
                        transformChain
                );

        return new AiTransformPreviewResponse(
                previewUrl,
                request.type(),
                transformChain
        );
    }

    // Apply method
    public PhotoResponse apply(
            User user,
            UUID photoId,
            AiTransformRequest request
    ) {
        Photo photo = getActivePhoto(user, photoId);

        String transformChain =
                buildTransformChain(request, photo);

        String transformUrl =
                imageKitService.buildAiTransformUrl(
                        photo.getUrl(),
                        transformChain
                );

        byte[] transformedBytes =
                imageKitService.downloadTransformedImage(
                        transformUrl
                );

        String suffix =
                request.type()
                        .name()
                        .toLowerCase()
                        .replace('_', '-');

        String fileName =
                buildDerivedFileName(
                        photo.getFileName(),
                        suffix
                );

        var uploadResponse =
                imageKitService.uploadBytes(
                        user,
                        transformedBytes,
                        fileName
                );

        return photoService.createDerivedPhoto(
                user,
                photo,
                uploadResponse,
                request.type()
        );
    }

    // Helper methods

    private void requirePrompt(
            AiTransformRequest request
    ) {
        if (request.prompt() == null
                || request.prompt().isBlank()) {

            throw new BadRequestException(
                    "Prompt is required for this transformation"
            );
        }
    }

    private void requireFocusObject(
            AiTransformRequest request
    ) {
        if (request.focusObject() == null
                || request.focusObject().isBlank()) {

            throw new BadRequestException(
                    "Focus object is required for object-aware cropping"
            );
        }
    }

    private int requireDimension(
            Integer value,
            String name
    ) {
        if (value == null
                || value < 64
                || value > 4096) {

            throw new BadRequestException(
                    name + " must be between 64 and 4096"
            );
        }

        return value;
    }

    private String sanitizeFocusObject(
            String focusObject
    ) {
        String sanitized = focusObject
                .trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9_-]", "");

        if (sanitized.isBlank()) {
            throw new BadRequestException(
                    "Invalid focus object"
            );
        }

        return sanitized;
    }

    private String urlEncodePrompt(
            String prompt
    ) {
        return URLEncoder.encode(
                prompt.trim(),
                StandardCharsets.UTF_8
        );
    }

    private String buildDerivedFileName(
            String originalFileName,
            String suffix
    ) {
        if (originalFileName == null
                || originalFileName.isBlank()) {

            return "photo-ai-" + suffix + ".png";
        }

        int dotIndex =
                originalFileName.lastIndexOf('.');

        if (dotIndex <= 0) {
            return originalFileName
                    + "-ai-"
                    + suffix
                    + ".png";
        }

        String base =
                originalFileName.substring(
                        0,
                        dotIndex
                );

        String extension =
                originalFileName.substring(dotIndex);

        return base
                + "-ai-"
                + suffix
                + extension;
    }

    private Photo getActivePhoto(
            User user,
            UUID photoId
    ) {
        return photoRepository
                .findByIdAndUserId(
                        photoId,
                        user.getId()
                )
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Photo not found"
                        )
                );
    }
}