"use client";

import React, { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Images, ListChecks, Plus, X, Trash2, AlertCircle } from "lucide-react";

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
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [addPhotosOpen, setAddPhotosOpen] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);

    const { data, isLoading, isError, error, refetch, isRefetching } = useAlbumPhotos(album.id, page, PAGE_SIZE);
    const { mutateAsync: removePhoto, isPending: removing } = useRemovePhotoFromAlbum(album.id);

    const photos = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;
    const selectedPhoto = selectedPhotoIndex === null ? null : photos[selectedPhotoIndex] ?? null;

    const handleSelect = (photo: PhotoResponse) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(photo.id)) next.delete(photo.id);
            else next.add(photo.id);
            return next;
        });
    };

    const handleRemoveSelected = async () => {
        const ids = Array.from(selectedIds);
        for (const photoId of ids) {
            await removePhoto(photoId);
        }
        setSelectedIds(new Set());
        setSelectionMode(false);
    };

    const openPhoto = (photo: PhotoResponse) => {
        const index = photos.findIndex((item) => item.id === photo.id);
        if (index >= 0) setSelectedPhotoIndex(index);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
                <DialogContent showCloseButton={false} className="flex h-[min(92vh,960px)] w-[calc(100vw-1rem)] max-w-6xl flex-col gap-0 overflow-hidden rounded-3xl border-[#d8eaf3] bg-[#f7fbfd] p-0 shadow-[0_28px_90px_rgba(38,83,112,0.2)] dark:border-white/10 dark:bg-[#10213e] sm:w-[calc(100vw-2rem)]">
                    <DialogHeader className="shrink-0 border-b border-[#dcebf2] bg-white px-5 py-5 dark:border-white/10 dark:bg-[#172847] sm:px-7">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 pr-2">
                                <Button variant="ghost" size="sm" className="-ml-2 mb-2 h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-[#10264b] dark:hover:text-white" onClick={onClose} aria-label="Back to albums"><ArrowLeft className="size-3.5" />Back to albums</Button>
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5599c2]">Photo album</p>
                                <DialogTitle className="truncate text-2xl font-semibold tracking-[-0.04em] text-[#10264b] dark:text-white">{album.title}</DialogTitle>
                                <p className="mt-1 text-sm text-muted-foreground">{totalElements.toLocaleString()} photo{totalElements !== 1 ? "s" : ""} in this album</p>
                            </div>
                            <Button variant="ghost" size="icon" className="size-9 shrink-0 text-muted-foreground" onClick={onClose} aria-label="Close album"><X className="size-4" /></Button>
                        </div>
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="text-xs text-muted-foreground">{selectionMode ? `${selectedIds.size} selected` : "Select photos to manage this album"}</div>
                            <div className="flex flex-wrap items-center justify-end gap-2">
                            {selectionMode && selectedIds.size > 0 ? (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={handleRemoveSelected}
                                        disabled={removing}
                                    >
                                        <Trash2 className="size-3.5" />
                                        Remove ({selectedIds.size})
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedIds(new Set());
                                            setSelectionMode(false);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {selectionMode && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1.5"
                                            onClick={() => setSelectionMode(false)}
                                        >
                                            <X className="size-4" />
                                            Cancel
                                        </Button>
                                    )}
                                    {!selectionMode && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1.5"
                                            onClick={() => setSelectionMode(true)}
                                        >
                                            <ListChecks className="size-4" />
                                            Select photos
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={() => setAddPhotosOpen(true)}
                                    >
                                        <Plus className="size-4" />
                                        Add Photos
                                    </Button>
                                </>
                            )}
                        </div>
                        </div>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f4f9fb] p-4 dark:bg-[#0d1d33] sm:p-6">
                        {isLoading ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <Skeleton key={i} className="aspect-square rounded-sm" />
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="flex min-h-64 flex-col items-center justify-center text-center">
                                <AlertCircle className="size-10 text-destructive/70" />
                                <p className="mt-3 text-sm font-medium text-[#10264b] dark:text-white">Unable to load album photos</p>
                                <p className="mt-1 max-w-sm text-xs text-muted-foreground">{(error as Error)?.message || "Please try again."}</p>
                                <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()} disabled={isRefetching}>Try again</Button>
                            </div>
                        ) : photos.length === 0 ? (
                            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfe4ec] bg-white/70 px-6 text-center dark:border-white/10 dark:bg-white/[0.03]">
                                <div className="flex size-16 items-center justify-center rounded-2xl bg-[#e3f4fa] text-[#3189ad] dark:bg-[#1e4863] dark:text-[#bdeaf8]"><Images className="size-8" /></div>
                                <p className="mt-4 text-base font-semibold text-[#10264b] dark:text-white">No photos in this album yet</p>
                                <p className="mt-1 max-w-xs text-sm leading-5 text-muted-foreground">Add your favorite photos here to keep them organized.</p>
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
                                {!selectionMode && (
                                    <p className="text-xs text-muted-foreground">
                                        Click a photo to view it, or use Select photos to remove items from this album.
                                    </p>
                                )}
                                {selectionMode && (
                                    <p className="text-sm font-medium text-[#10264b] dark:text-white">{selectedIds.size} selected. Choose photos to remove from this album.</p>
                                )}
                                <PhotoGrid
                                    photos={photos}
                                    selectable={selectionMode}
                                    selectedIds={selectedIds}
                                    onSelect={handleSelect}
                                    onOpen={(photo) => {
                                        if (!selectionMode) openPhoto(photo);
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
                onClose={() => setSelectedPhotoIndex(null)}
                onPrevious={selectedPhotoIndex !== null && selectedPhotoIndex > 0 ? () => setSelectedPhotoIndex((index) => index === null ? null : index - 1) : undefined}
                onNext={selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1 ? () => setSelectedPhotoIndex((index) => index === null ? null : index + 1) : undefined}
                currentIndex={selectedPhotoIndex ?? undefined}
                totalPhotos={photos.length}
            />

            <AddPhotosDialog
                albumId={album.id}
                open={addPhotosOpen}
                onClose={() => setAddPhotosOpen(false)}
            />
        </>
    );
}
