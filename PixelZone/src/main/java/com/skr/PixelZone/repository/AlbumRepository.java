package com.skr.PixelZone.repository;

import com.skr.PixelZone.entity.Album;
import com.skr.PixelZone.entity.PhotoStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
                WHERE ap.album.id = :albumId AND ap.photo.status = :status
            """)
            long countPhotoByAlbumId(@Param("albumId") UUID albumId, @Param("status") PhotoStatus status);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update Album a set a.coverPhoto = null where a.coverPhoto.id = :photoId")
    void clearCoverPhoto(@Param("photoId") UUID photoId);
}
