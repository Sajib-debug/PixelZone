package com.skr.PixelZone.controller;

import com.skr.PixelZone.dto.BulkPhotoActionRequest;
import com.skr.PixelZone.dto.CreatePhotoRequest;
import com.skr.PixelZone.dto.PageResponse;
import com.skr.PixelZone.dto.PhotoResponse;
import com.skr.PixelZone.entity.PhotoStatus;
import com.skr.PixelZone.entity.User;
import com.skr.PixelZone.service.PhotoService;
import com.skr.PixelZone.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PhotoController {

    private final PhotoService photoService;
    private final UserService userService;

    public PhotoController(PhotoService photoService, UserService userService) {
        this.photoService = photoService;
        this.userService = userService;
    }


    @GetMapping("/photo/{id}")
    public ResponseEntity<PhotoResponse> getPhoto(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID id) {
        User user = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.OK).body(photoService.getPhoto(user, id));
    }


    @GetMapping("/photos")
    public ResponseEntity<PageResponse<PhotoResponse>> listPhotos(@AuthenticationPrincipal UserDetails userDetails,
                                                          @RequestParam(defaultValue = "ACTIVE")PhotoStatus status,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "24") int size) {
        User user = userService.getByEmail(userDetails.getUsername());
        PageResponse<PhotoResponse> photos = photoService.listPhotos(
                user,
                status,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return ResponseEntity.status(HttpStatus.OK).body(photos);
    }


    @PostMapping(value = "photo/upload",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoResponse> uploadPhoto(@AuthenticationPrincipal UserDetails userDetails,
                                                     @RequestParam("file") MultipartFile file) {

        User user = userService.getByEmail(userDetails.getUsername());
        PhotoResponse photoResponse = photoService.uploadPhoto(user, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(photoResponse);
    }


    @PostMapping("/photos")
    public ResponseEntity<PhotoResponse> importPhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreatePhotoRequest request
            ){

        User user = userService.getByEmail(userDetails.getUsername());
        PhotoResponse photoResponse = photoService.createPhoto(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(photoResponse);
    }


    @PostMapping("/photos/archive")
    public ResponseEntity<Void> archivePhotos(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BulkPhotoActionRequest request
            ) {

        User user = userService.getByEmail(userDetails.getUsername());
        photoService.archivePhoto(user, request.photoIds());

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }


    @PostMapping("/photos/restore")
    public ResponseEntity<Void> restorePhotos(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BulkPhotoActionRequest request
    ) {

        User user = userService.getByEmail(userDetails.getUsername());
        photoService.restorePhotos(user, request.photoIds());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }


    @PostMapping("/photos/delete-permanent")
    public ResponseEntity<Void> permanentDeletePhotos(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BulkPhotoActionRequest request
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        photoService.permanentlyDeletePhotos(user, request.photoIds());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }


    @DeleteMapping("/photo/{id}")
    public ResponseEntity<Void> deletePhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        photoService.permanentlyDeletePhoto(user, id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
