package com.skr.PixelZone.repository;

import com.skr.PixelZone.entity.Photo;
import com.skr.PixelZone.entity.PhotoStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PhotoRepository extends JpaRepository<Photo, UUID> {
    Page<Photo> findByUserIdAndStatus(UUID userId, PhotoStatus status, Pageable  pageable);

    List<Photo> findByIdInAndUserId(List<UUID> ids, UUID userId);

    Optional<Photo> findByIdAndUserId(UUID id, UUID userId);

    Optional<Photo> findByIdAndUserIdAndStatus(UUID id, UUID userId, PhotoStatus status);

    boolean existsByImageKitFileIdAndUserId(String imageKitFileId, UUID userId);

    long countByUserIdAndStatus(UUID userId, PhotoStatus status);

    @Query("""
            SELECT COALESCE(SUM(p.sizeBytes),0)
            FROM Photo p
            WHERE p.user.id = :userId AND p.status = :status
        """)
    long sumActivePhotoBytesByUserId(@Param("userId") UUID userId, @Param("status") PhotoStatus status);

    default long sumActivePhotoBytesByUserId(UUID userId) {
        return sumActivePhotoBytesByUserId(userId, PhotoStatus.ACTIVE);
    }
}
