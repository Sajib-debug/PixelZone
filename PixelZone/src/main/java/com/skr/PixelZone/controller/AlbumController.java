package com.skr.PixelZone.controller;

import com.skr.PixelZone.dto.*;
import com.skr.PixelZone.entity.User;
import com.skr.PixelZone.service.AlbumService;
import com.skr.PixelZone.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/albums")
public class AlbumController {

    private final AlbumService albumService;
    private final UserService userService;

    @Autowired
    public AlbumController(AlbumService albumService, UserService userService) {
        this.albumService = albumService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<AlbumResponse>> listAlbums(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername());
        return  ResponseEntity.ok(albumService.listAlbums(user));
    }

    @PostMapping
    public ResponseEntity<AlbumResponse> createAlbum(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateAlbumRequest createAlbumRequest
            ) {
        User user = userService.getByEmail(userDetails.getUsername());
        AlbumResponse album = albumService.createAlbum(user,createAlbumRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(album);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlbumResponse> getAlbum(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id
    ){
        User user = userService.getByEmail(userDetails.getUsername());
        return  ResponseEntity.ok(albumService.getAlbum(user, id));
    }


    @GetMapping("/{id}/photos")
    public ResponseEntity<PageResponse<PhotoResponse>> getAlbumPhotos(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        PageResponse<PhotoResponse> photos = albumService.getAlbumPhotos(
                user,
                id,
                PageRequest.of(page,size)
        );
        return ResponseEntity.ok(photos);
    }


    @PatchMapping("/{id}")
    public ResponseEntity<AlbumResponse> updateAlbum(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAlbumRequest updateAlbumRequest
    ){
        User user = userService.getByEmail(userDetails.getUsername());
        return  ResponseEntity.ok(albumService.updateAlbum(user, id, updateAlbumRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id
    ){
        User user = userService.getByEmail(userDetails.getUsername());
        albumService.deleteAlbum(user, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/photos")
    public ResponseEntity<Void> addPhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody AddPhotosToAlbumRequest addPhotosToAlbumRequest
    ){
        User user = userService.getByEmail(userDetails.getUsername());
        albumService.addPhotosToAlbum(user, id, addPhotosToAlbumRequest);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/photos/{photoId}")
    public ResponseEntity<Void> removePhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @PathVariable UUID photoId
    ){
        User user = userService.getByEmail(userDetails.getUsername());
        albumService.removePhotoFromAlbum(user, id, photoId);
        return ResponseEntity.noContent().build();
    }
}
