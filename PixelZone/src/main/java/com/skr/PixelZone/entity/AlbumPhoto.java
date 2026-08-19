package com.skr.PixelZone.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "album_photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlbumPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "album_id", nullable = false)
    private Album album;

    @ManyToOne(fetch = FetchType.LAZY,  optional = false)
    @JoinColumn(name = "photo_id", nullable = false)
    private Photo photo;


    @Column(name = "sort_order",nullable = false)
    private int sortOrder;


    @Column(name = "added_at",nullable = false,updatable = false)
    private Instant addedAt;

    @PrePersist
    public void onCreate() {
        if (addedAt == null) {
            addedAt = Instant.now();
        }
    }
}
