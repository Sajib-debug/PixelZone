package com.skr.PixelZone.service;

import com.skr.PixelZone.dto.*;
import com.skr.PixelZone.entity.PhotoStatus;
import com.skr.PixelZone.entity.User;
import com.skr.PixelZone.exception.ResourceNotFoundException;
import com.skr.PixelZone.repository.PhotoRepository;
import io.imagekit.models.assets.AssetListResponse;
import io.imagekit.models.files.File;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class LibraryService {
    private final PhotoService photoService;
    private final PhotoRepository photoRepository;
    private final ImageKitService imageKitService;

    public LibraryService(PhotoService photoService, PhotoRepository photoRepository, ImageKitService imageKitService) {
        this.photoService = photoService;
        this.photoRepository = photoRepository;
        this.imageKitService = imageKitService;
    }

    @Transactional(readOnly = true)
    public StorageUsageResponse getStorageUsage(User user) {
        long usedBytes = photoRepository.sumActivePhotoBytesByUserId(user.getId());
        long photoCount = photoRepository.countByUserIdAndStatus(user.getId(), PhotoStatus.ACTIVE);
        return new StorageUsageResponse(usedBytes,photoCount,null, null);
    }


    @Transactional
    public List<ImageKitAssetResponse> listImportableAssets(User user) {
        String folder = ImageKitService.userFolder(user.getId());
        List<AssetListResponse>  assets = imageKitService.listAssetsInFolder(folder,0,100);

        List<ImageKitAssetResponse> imageKitAssetResponses = new ArrayList<>();

        for (AssetListResponse asset : assets) {
            if(!asset.isFile()) {
                continue;
            }

            File file = asset.asFile();
            String fileId = file.fileId().orElse(null);
            if(fileId == null) {
                continue;
            }

            String url = file.url().orElse("");
            imageKitAssetResponses.add(new ImageKitAssetResponse(
                    fileId,
                    file.name().orElse("Untitled"),
                    url,
                    file.thumbnail().orElse(url),
                    file.size().map(Double::longValue).orElse(0L),
                    file.width().map(Double::intValue).orElse(null),
                    file.height().map(Double::intValue).orElse(null),
                    file.mime().orElse(null),
                    photoRepository.existsByImageKitFileIdAndUserId(fileId, user.getId())
            ));
        }
        return imageKitAssetResponses;
    }

    @Transactional
    public List<PhotoResponse> importAssets(User user, ImportPhotoRequest request) {
        List<PhotoResponse> photoResponses = new ArrayList<>();

        for(String fileId : request.imagekitFileIds()) {
            if(photoRepository.existsByImageKitFileIdAndUserId(fileId, user.getId())) {
                continue;
            }

            File file = findFile(user, fileId);

            CreatePhotoRequest createPhotoRequest = new CreatePhotoRequest(
                    fileId,
                    file.name().orElse("imported-photo"),
                    file.url().orElseThrow(()->new ResourceNotFoundException("Asset url missing!")),
                    file.thumbnail().orElse(null),
                    file.mime().orElse(null),
                    file.size().map(Double::longValue).orElse(0L),
                    file.width().map(Double::intValue).orElse(null),
                    file.height().map(Double::intValue).orElse(null)
            );

            photoResponses.add(photoService.createPhoto(user, createPhotoRequest));
        }
        return photoResponses;
    }

    private File findFile(User user, String fileId) {
        return imageKitService
                .listAssetsInFolder(
                        ImageKitService.userFolder(user.getId()),
                        0,
                        100
                )
                .stream()
                .filter(AssetListResponse::isFile)
                .map(AssetListResponse::asFile)
                .filter(file -> file.fileId().map(fileId::equals).orElse(false))
                .findFirst()
                .orElseThrow(() ->
                        new ResourceNotFoundException("ImageKit asset not found!")
                );
    }
}
