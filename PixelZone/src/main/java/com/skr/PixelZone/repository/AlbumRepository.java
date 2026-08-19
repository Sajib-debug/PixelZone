package com.skr.PixelZone.repository;

import com.skr.PixelZone.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlbumRepository extends JpaRepository<Album, UUID> {

    List<Album> findByUserIdOrderByUpdatedAtDesc(UUID userId);

    Optional<Album> findByIdAndUserId(UUID id, UUID userId);

    @Query("""
            SELECT COUNT(ap) FROM AlbumPhoto ap
            WHERE ap.album.id = :albumId
            """)
    long countPhotoByAlbumId(@Param("albumId") UUID albumId);
}
