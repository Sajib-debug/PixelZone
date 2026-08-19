"use client";

import React, { useState } from "react";
import { Archive, ChevronLeft, ChevronRight, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { PhotoDetailDialog } from "@/components/photos/photo-detail-dialog";
import { usePhotos, useRestorePhotos } from "@/hooks/use-photos";
import type { PhotoResponse } from "@/lib/api";

const PAGE_SIZE = 24;

export default function ArchivePage() {
    const [page, setPage] = useState(0);
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoResponse | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const { data, isLoading, isError, error } = usePhotos("ARCHIVE", page, PAGE_SIZE);
    const { mutate: restore, isPending: restoring } = useRestorePhotos();

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

    const handleRestoreSelected = () => {
        restore(Array.from(selectedIds), {
            onSuccess: () => setSelectedIds(new Set()),
        });
    };

    return (
        <div className="flex h-full flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Archive</h1>
                    <p className="text-muted-foreground mt-1">
                        {"Photos you've hidden from your main view."}
                    </p>
                </div>
                {selectedIds.size > 0 && (
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleRestoreSelected}
                        disabled={restoring}
                    >
                        <ArchiveRestore className="size-4" />
                        Restore ({selectedIds.size})
                    </Button>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1">
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-sm" />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center bg-muted/20">
                    <p className="text-destructive text-sm">
                        {(error as Error)?.message || "Failed to load archived photos"}
                    </p>
                </div>
            ) : photos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center bg-muted/20">
                    <div className="flex size-20 items-center justify-center rounded-full bg-muted/50 border shadow-sm">
                        <Archive className="size-10 text-muted-foreground/80" />
                    </div>
                    <h2 className="mt-6 text-xl font-semibold">Archive is empty</h2>
                    <p className="mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground max-w-sm">
                        {"Move photos you don't want to see every day to the archive. They will still be available here when you need them."}
                    </p>
                </div>
            ) : (
                <>
                    {selectedIds.size > 0 && (
                        <p className="text-sm text-muted-foreground -mt-1">
                            {selectedIds.size} selected — click to toggle, or select a photo to view details
                        </p>
                    )}
                    {selectedIds.size === 0 && (
                        <p className="text-xs text-muted-foreground -mt-2">
                            Click a photo to view details, or hold-select to batch restore
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-sm text-muted-foreground">
                                {totalElements.toLocaleString()} archived photos
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    <ChevronLeft className="size-4" />
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={data?.last}
                                >
                                    Next
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Photo detail dialog */}
            <PhotoDetailDialog
                photo={selectedPhoto}
                open={!!selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
            />
        </div>
    );
}
