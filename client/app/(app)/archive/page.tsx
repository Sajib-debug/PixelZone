"use client";

import React, { useState } from "react";
import { Archive, ChevronLeft, ChevronRight, ArchiveRestore, ListChecks, X } from "lucide-react";
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
    const [selectionMode, setSelectionMode] = useState(false);

    const { data, isLoading, isError, error, refetch, isRefetching } = usePhotos("ARCHIVE", page, PAGE_SIZE);
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
            onSuccess: () => {
                setSelectedIds(new Set());
                setSelectionMode(false);
            },
        });
    };

    return (
        <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-6">
            {/* Header */}
            <div className="rounded-2xl border border-[#d8eaf3] bg-white/70 p-5 shadow-[0_8px_24px_rgba(38,83,112,0.06)] dark:border-white/10 dark:bg-[#172847]/75 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#dff3fb] text-[#2f83aa] dark:bg-[#1e4863] dark:text-[#9edcf4]"><Archive className="size-5" /></div>
                        <div>
                    <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#10264b] dark:text-white">Archive</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {"Photos you've hidden from your main view."}
                    </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {selectionMode && (
                        <Button
                            variant="ghost"
                            className="gap-2"
                            onClick={() => {
                                setSelectedIds(new Set());
                                setSelectionMode(false);
                            }}
                        >
                            <X className="size-4" />
                            Cancel
                        </Button>
                    )}
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
                    {!selectionMode && photos.length > 0 && (
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setSelectionMode(true)}
                        >
                            <ListChecks className="size-4" />
                            Select photos
                        </Button>
                    )}
                                </div>
                            </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-sm" />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#c8e4ef] bg-white/65 p-12 text-center dark:border-white/10 dark:bg-white/5">
                    <p className="text-destructive text-sm">{(error as Error)?.message || "Failed to load archived photos"}</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>Try again</Button>
                </div>
            ) : photos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#c8e4ef] bg-white/65 p-12 text-center dark:border-white/10 dark:bg-white/5">
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
                    {selectionMode && (
                        <p className="text-sm text-muted-foreground -mt-1">
                            {selectedIds.size} selected — click to toggle, or select a photo to view details
                        </p>
                    )}
                    {!selectionMode && (
                        <p className="text-xs text-muted-foreground -mt-2">
                            Click a photo to view details, or select photos to batch restore
                        </p>
                    )}
                    <PhotoGrid
                        photos={photos}
                        selectable={selectionMode}
                        selectedIds={selectedIds}
                        onSelect={handleSelect}
                        onOpen={(photo) => {
                            if (!selectionMode) setSelectedPhoto(photo);
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
