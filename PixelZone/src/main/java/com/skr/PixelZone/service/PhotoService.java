package com.skr.PixelZone.service;

import com.skr.PixelZone.dto.CreatePhotoRequest;
import com.skr.PixelZone.dto.PageResponse;
import com.skr.PixelZone.dto.PhotoResponse;
import com.skr.PixelZone.entity.AiTransformType;
import com.skr.PixelZone.entity.Photo;
import com.skr.PixelZone.entity.PhotoStatus;
import com.skr.PixelZone.entity.User;
import com.skr.PixelZone.exception.BadRequestException;
import com.skr.PixelZone.exception.ResourceNotFoundException;
import com.skr.PixelZone.repository.PhotoRepository;
import com.skr.PixelZone.repository.AlbumPhotoRepository;
import com.skr.PixelZone.repository.AlbumRepository;
import io.imagekit.models.files.FileUploadResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class PhotoService {
    private static final Logger log = LoggerFactory.getLogger(PhotoService.class);
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/heic",
            "image/heif"
    );

    private final PhotoRepository photoRepository;
    private final AlbumPhotoRepository albumPhotoRepository;
    private final AlbumRepository albumRepository;
    private final ImageKitService imageKitService;

    public PhotoService(PhotoRepository photoRepository, AlbumPhotoRepository albumPhotoRepository, AlbumRepository albumRepository, ImageKitService imageKitService) {
        this.photoRepository = photoRepository;
        this.albumPhotoRepository = albumPhotoRepository;
        this.albumRepository = albumRepository;
        this.imageKitService = imageKitService;
    }

    @Transactional
    public PhotoResponse createDerivedPhoto(User user, Photo photo, FileUploadResponse fileUploadResponse, AiTransformType aiTransformType) {
        String fileId = fileUploadResponse.fileId()
                .orElseThrow(() -> new BadRequestException("ImageKit did not return a file id!"));

        String url = fileUploadResponse.url()
                .orElseThrow(() -> new BadRequestException("ImageKit did not return a url!"));

        String thumbnailUrl = fileUploadResponse.thumbnailUrl()
                .orElse(imageKitService.buildThumbnailUrlFromUrl(url));

        Photo sourcePhoto = Photo.builder()
                .user(user)
                .imageKitFileId(fileId)
                .fileName(fileUploadResponse.name().orElse(photo.getFileName()))
                .url(url)
                .thumbnailUrl(thumbnailUrl)
                .mimeType(fileUploadResponse.fileType().orElse(photo.getMimeType()))
                .sizeBytes(fileUploadResponse.size().map(Double::longValue).orElse(0L))
                .width(fileUploadResponse.width().map(Double::intValue).orElse(photo.getWidth()))
                .height(fileUploadResponse.height().map(Double::intValue).orElse(photo.getHeight()))
                .status(PhotoStatus.ACTIVE)
                .parentPhotoId(photo.getParentPhotoId())
                .aiTransformType(aiTransformType)
                .build();

        return toPhotoResponse(photoRepository.save(sourcePhoto));
    }

    @Transactional(readOnly = true)
    public PageResponse<PhotoResponse> listPhotos(User user, PhotoStatus status, Pageable pageable) {
        Page<Photo> page = photoRepository.findByUserIdAndStatus(user.getId(), status, pageable);

        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public PhotoResponse getPhoto(User user,  UUID photoId) {
        Photo photo = photoRepository.findByIdAndUserId(photoId, user.getId())
                .orElseThrow(()-> new ResourceNotFoundException("Photo not found!"));

        return toPhotoResponse(photo);
    }

    @Transactional
    public PhotoResponse uploadPhoto(User user, MultipartFile multipartFile) {
        validateUpload(multipartFile);

        FileUploadResponse uploadResponse = imageKitService.uploadPhoto(user, multipartFile);

        String fileId = uploadResponse.fileId()
                .orElseThrow(()-> new BadRequestException("ImageKit did not return a file id!"));
        String url = uploadResponse.url()
                .orElseThrow(() -> new BadRequestException("ImageKit did not return a url!"));
        String filePath =  uploadResponse.filePath().orElse(null);

        CreatePhotoRequest request = new CreatePhotoRequest(
                fileId,
                uploadResponse.name().orElse(multipartFile.getOriginalFilename()),
                url,
                uploadResponse.thumbnailUrl().orElse(null),
                multipartFile.getContentType(),
                uploadResponse.size().map(Double::longValue).orElse(multipartFile.getSize()),
                uploadResponse.width().map(Double::intValue).orElse(null),
                uploadResponse.height().map(Double::intValue).orElse(null)
        );

        PhotoResponse photoResponse = createPhoto(user, request);

        if(filePath != null && (photoResponse.thumbnailUrl() == null || photoResponse.thumbnailUrl().isBlank())) {
            Photo savedPhoto = photoRepository.findById(photoResponse.id())
                    .orElseThrow(() -> new ResourceNotFoundException("Photo not found!"));
            savedPhoto.setThumbnailUrl(imageKitService.buildThumbnailUrlFromUrl(filePath));
            return toPhotoResponse(savedPhoto);
        }

        return photoResponse;
    }

    @Transactional
    public PhotoResponse createPhoto(User user, CreatePhotoRequest createPhotoRequest) {
        if(photoRepository.existsByImageKitFileIdAndUserId(createPhotoRequest.imagekitFileId(), user.getId())) {
            throw new BadRequestException("PhotoKit already exists!");
        }

        String thumbnailUrl = createPhotoRequest.thumbnailUrl();

        if(thumbnailUrl == null || thumbnailUrl.isBlank()) {
            thumbnailUrl = imageKitService.buildThumbnailUrlFromUrl(createPhotoRequest.url());
        }

        Photo photo = Photo.builder()
                .user(user)
                .imageKitFileId(createPhotoRequest.imagekitFileId())
                .fileName(createPhotoRequest.fileName())
                .url(createPhotoRequest.url())
                .thumbnailUrl(thumbnailUrl)
                .mimeType(createPhotoRequest.mimeType())
                .sizeBytes(createPhotoRequest.sizeBytes())
                .width(createPhotoRequest.width())
                .height(createPhotoRequest.height())
                .status(PhotoStatus.ACTIVE)
                .build();
        return toPhotoResponse(photoRepository.save(photo));
    };

    @Transactional
    public void archivePhoto(User user, List<UUID> photoIds) {
        List<Photo> photos = updatePhotoStatus(user, photoIds, PhotoStatus.ACTIVE, PhotoStatus.ARCHIVE, false);
        photoRepository.saveAllAndFlush(photos);
    }

    @Transactional
    public void movePhotosToTrash(User user, List<UUID> photoIds) {
        List<Photo> photos = loadOwnedPhotos(user, photoIds);

        for(Photo photo : photos) {
            if(photo.getStatus() == PhotoStatus.TRASH) {
                continue;
            }
            photo.setStatus(PhotoStatus.TRASH);
            photo.setDeletedAt(Instant.now());
        }
        photoRepository.saveAllAndFlush(photos);
    }

    @Transactional
    public void restorePhotos(User user, List<UUID> photoIds) {
        List<Photo> photos = photoRepository.findByIdInAndUserId(photoIds, user.getId());

        if(photos.size() != photoIds.size()) {
            throw new ResourceNotFoundException("Photos not found!");
        }

        for(Photo photo : photos) {
            if(photo.getStatus() == PhotoStatus.ACTIVE) {
                continue;
            }
            photo.setStatus(PhotoStatus.ACTIVE);
            photo.setDeletedAt(null);
        }
        photoRepository.saveAllAndFlush(photos);
    }

    @Transactional
    public void permanentlyDeletePhotos(User user, List<UUID> photoIds) {
        List<Photo> photos = photoRepository.findByIdInAndUserId(photoIds, user.getId());
        if(photos.size() != photoIds.size()) {
            throw new ResourceNotFoundException("Photos not found!");
        }
        for(Photo photo : photos) {
            if(photo.getStatus() != PhotoStatus.TRASH) {
                throw new BadRequestException("Only photos in trash can be deleted!");
            }
            albumRepository.clearCoverPhoto(photo.getId());
            albumPhotoRepository.deleteByPhotoIds(List.of(photo.getId()));
            photoRepository.delete(photo);
            try {
                imageKitService.deleteFile(photo.getImageKitFileId());
            } catch (RuntimeException ex) {
                log.warn("Could not delete ImageKit file {} after removing photo {}", photo.getImageKitFileId(), photo.getId(), ex);
            }
        }
    }

    @Transactional
    public void permanentlyDeletePhoto(User user, UUID photoId) {
        permanentlyDeletePhotos(user,List.of(photoId));
    }

    private List<Photo> updatePhotoStatus(
            User user,
            List<UUID> photoIds,
            PhotoStatus requiredCurrentStatus,
            PhotoStatus newStatus,
            boolean setDeletedAt
    ){
        List<Photo> photos = loadOwnedPhotos(user, photoIds);
        for(Photo photo : photos) {
            if(requiredCurrentStatus != null && photo.getStatus() != requiredCurrentStatus) {
                throw new BadRequestException("Photo must be " + requiredCurrentStatus.name().toLowerCase());
            }
            if(newStatus != PhotoStatus.ACTIVE) {
                albumRepository.clearCoverPhoto(photo.getId());
            }
            photo.setStatus(newStatus);
            photo.setDeletedAt(setDeletedAt? Instant.now():null);
        }
        return photos;
    }

    private List<Photo> loadOwnedPhotos(User user, List<UUID> photoIds) {
        List<Photo> photos = photoRepository.findByIdInAndUserId(photoIds,user.getId());

        if(photos.size() != photoIds.size()) {
            throw new ResourceNotFoundException("Photos not found!");
        }

        return photos;
    }

    private void validateUpload(MultipartFile file) {
        if(file.isEmpty()) {
            throw new BadRequestException("File is empty!");
        }

        String contentType = file.getContentType();

        if(contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file type! valid types are: " + ALLOWED_CONTENT_TYPES);
        }
    }

    private PageResponse<PhotoResponse> toPageResponse(Page<Photo> page) {
        return new PageResponse<>(
                page.getContent().stream().map(this::toPhotoResponse).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    public PhotoResponse toPhotoResponse(Photo photo) {
        return new PhotoResponse(
                photo.getId(),
                photo.getImageKitFileId(),
                photo.getFileName(),
                photo.getUrl(),
                photo.getThumbnailUrl(),
                photo.getMimeType(),
                photo.getSizeBytes(),
                photo.getWidth(),
                photo.getHeight(),
                photo.getStatus(),
                photo.getCreatedAt(),
                photo.getDeletedAt(),
                photo.getParentPhotoId(),
                photo.getAiTransformType()
        );
    }
}
