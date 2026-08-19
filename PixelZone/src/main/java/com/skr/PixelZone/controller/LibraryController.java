package com.skr.PixelZone.controller;

import com.skr.PixelZone.dto.ImageKitAssetResponse;
import com.skr.PixelZone.dto.ImportPhotoRequest;
import com.skr.PixelZone.dto.PhotoResponse;
import com.skr.PixelZone.dto.StorageUsageResponse;
import com.skr.PixelZone.entity.User;
import com.skr.PixelZone.service.LibraryService;
import com.skr.PixelZone.service.UserService;
import jakarta.validation.Valid;
import org.apache.tomcat.jni.Library;
import org.springframework.boot.webmvc.autoconfigure.WebMvcProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final LibraryService libraryService;
    private final UserService userService;

    public LibraryController(LibraryService libraryService, UserService userService) {
        this.libraryService = libraryService;
        this.userService = userService;
    }

    @GetMapping("/storage")
    public ResponseEntity<StorageUsageResponse> getStorageUsage(
            @AuthenticationPrincipal UserDetails userDetails
            ) {
        User user = userService.getByEmail(userDetails.getUsername());
        return  ResponseEntity.ok(libraryService.getStorageUsage(user));
    }

    @GetMapping("/imagekit-assets")
    public ResponseEntity<List<ImageKitAssetResponse>> listImageKitAssets(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(libraryService.listImportableAssets(user));
    }

    @PostMapping("/import")
    public ResponseEntity<List<PhotoResponse>> importAssets (
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ImportPhotoRequest request
            ){
        User user = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(libraryService.importAssets(user, request));
    }

}
