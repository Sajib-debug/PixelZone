package com.skr.PixelZone.repository;

import com.skr.PixelZone.entity.Album;
import com.skr.PixelZone.entity.AlbumPhoto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlbumPhotoRepository extends JpaRepository<AlbumPhoto, UUID> {

    @Query("""
            SELECT ap FROM AlbumPhoto ap
                        JOIN FETCH ap.photo p
                                    WHERE ap.album.id = :albumId AND p.user.id = :userId
                                                ORDER BY ap.sortOrder ASC, ap.addedAt DESC
            """)
    Page<AlbumPhoto> findByAlbumIdAndUserId(
            @Param("albumId") UUID albumId,
            @Param("userId") UUID userId,
            Pageable pageable
    );

    Optional<AlbumPhoto> findByAlbumIdAndPhotoId(UUID albumId, UUID photoId);

    boolean existsByAlbumIdAndPhotoId(UUID albumId, UUID photoId);

    void deleteByAlbumIdAndPhotoId(UUID albumId, UUID photoId);

        @Modifying(flushAutomatically = true, clearAutomatically = true)
        @Query("delete from AlbumPhoto ap where ap.album.id = :albumId")
        void deleteByAlbumId(@Param("albumId") UUID albumId);

        @Modifying(flushAutomatically = true, clearAutomatically = true)
        @Query("delete from AlbumPhoto ap where ap.photo.id in :photoIds")
        void deleteByPhotoIds(@Param("photoIds") List<UUID> photoIds);

    @Query("""
            SELECT COALESCE(MAX(ap.sortOrder),0) From AlbumPhoto ap
                        WHERE ap.album.id = :albumId
            """)
    int findMaxSortOrder(@Param("albumId") UUID albumId);

    List<AlbumPhoto> findByPhotoId(UUID photoId);
}
