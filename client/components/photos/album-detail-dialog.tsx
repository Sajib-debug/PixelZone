"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Images, Plus, X } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { PhotoDetailDialog } from "@/components/photos/photo-detail-dialog";
import { AddPhotosDialog } from "@/components/photos/add-photos-dialog";
import { useAlbumPhotos, useRemovePhotoFromAlbum } from "@/hooks/use-albums";
import type { AlbumResponse, PhotoResponse } from "@/lib/api";

type AlbumDetailDialogProps = {
    album: AlbumResponse;
    open: boolean;
    onClose: () => void;
};

const PAGE_SIZE = 24;

export function AlbumDetailDialog({ album, open, onClose }: AlbumDetailDialogProps) {
    const [page, setPage] = useState(0);
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoResponse | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [addPhotosOpen, setAddPhotosOpen] = useState(false);

    const { data, isLoading, isError, error } = useAlbumPhotos(album.id, page, PAGE_SIZE);
    const { mutate: removePhoto, isPending: removing } = useRemovePhotoFromAlbum(album.id);

    const photos = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    const handleSelect = (photo: PhotoResponse) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(photo.id)) next.delete(photo.id);
            else next.add(photo.id);
            return next;
        });
    };

    const handleRemoveSelected = () => {
        Array.from(selectedIds).forEach((photoId) => {
            removePhoto(photoId);
        });
        setSelectedIds(new Set());
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
                <DialogContent className="max-w-5xl p-0 overflow-hidden h-[90vh] flex flex-col">
                    <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b shrink-0">
                        <DialogTitle className="text-xl font-semibold">{album.title}</DialogTitle>
                        <div className="flex items-center gap-2">
                            {selectedIds.size > 0 ? (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={handleRemoveSelected}
                                        disabled={removing}
                                    >
                                        <X className="size-3.5" />
                                        Remove ({selectedIds.size})
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedIds(new Set())}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => setAddPhotosOpen(true)}
                                >
                                    <Plus className="size-4" />
                                    Add Photos
                                </Button>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4">
                        {isLoading ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <Skeleton key={i} className="aspect-square rounded-sm" />
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <p className="text-destructive text-sm">
                                    {(error as Error)?.message || "Failed to load album photos"}
                                </p>
                            </div>
                        ) : photos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-48 text-center">
                                <Images className="size-12 text-muted-foreground/40 mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    This album is empty. Add photos to get started.
                                </p>
                                <Button
                                    size="sm"
                                    className="mt-4 gap-1.5"
                                    onClick={() => setAddPhotosOpen(true)}
                                >
                                    <Plus className="size-4" />
                                    Add Photos
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedIds.size === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        {totalElements.toLocaleString()} photo{totalElements !== 1 ? "s" : ""}
                                        {" — click a photo to view, or select to remove from album"}
                                    </p>
                                )}
                                <PhotoGrid
                                    photos={photos}
                                    selectable={selectedIds.size > 0}
                                    selectedIds={selectedIds}
                                    onSelect={handleSelect}
                                    onOpen={(photo) => {
                                        if (selectedIds.size === 0) setSelectedPhoto(photo);
                                        else handleSelect(photo);
                                    }}
                                />

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                                            disabled={page === 0}
                                        >
                                            <ChevronLeft className="size-4" />
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            {page + 1} / {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => p + 1)}
                                            disabled={data?.last}
                                        >
                                            <ChevronRight className="size-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <PhotoDetailDialog
                photo={selectedPhoto}
                open={!!selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
            />

            <AddPhotosDialog
                albumId={album.id}
                open={addPhotosOpen}
                onClose={() => setAddPhotosOpen(false)}
            />
        </>
    );
}
