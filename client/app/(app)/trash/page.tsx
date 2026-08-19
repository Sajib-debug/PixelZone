"use client";

import React, { useState } from "react";
import { Trash2, ChevronLeft, ChevronRight, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { PhotoDetailDialog } from "@/components/photos/photo-detail-dialog";
import { usePhotos, usePermanentDeletePhotos, useRestorePhotos } from "@/hooks/use-photos";
import type { PhotoResponse } from "@/lib/api";

const PAGE_SIZE = 24;

export default function TrashPage() {
    const [page, setPage] = useState(0);
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoResponse | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const { data, isLoading, isError, error } = usePhotos("TRASH", page, PAGE_SIZE);
    const { mutate: permanentDelete, isPending: deleting } = usePermanentDeletePhotos();
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

    const handleEmptyTrash = () => {
        const allIds = photos.map((p) => p.id);
        permanentDelete(allIds, { onSuccess: () => setSelectedIds(new Set()) });
    };

    const handleDeleteSelected = () => {
        permanentDelete(Array.from(selectedIds), {
            onSuccess: () => setSelectedIds(new Set()),
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
                    <h1 className="text-3xl font-bold tracking-tight">Trash</h1>
                    <p className="text-muted-foreground mt-1">
                        Items in the trash will be permanently deleted after 30 days.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={handleRestoreSelected}
                                disabled={restoring}
                            >
                                <ArchiveRestore className="size-4" />
                                Restore ({selectedIds.size})
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger render={
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        disabled={deleting}
                                    >
                                        <Trash2 className="size-4" />
                                        Delete ({selectedIds.size})
                                    </Button>
                                } />
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Permanently delete {selectedIds.size} photo{selectedIds.size !== 1 ? "s" : ""}?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. These photos will be permanently removed from your account.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            onClick={handleDeleteSelected}
                                        >
                                            Delete Permanently
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    ) : (
                        photos.length > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger render={
                                    <Button
                                        variant="outline"
                                        className="gap-2 cursor-pointer shadow-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        disabled={deleting}
                                    >
                                        <Trash2 className="size-4" />
                                        Empty Trash
                                    </Button>
                                } />
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete all {photos.length} photo{photos.length !== 1 ? "s" : ""} in the trash. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            onClick={handleEmptyTrash}
                                        >
                                            Empty Trash
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )
                    )}
                </div>
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
                        {(error as Error)?.message || "Failed to load trash"}
                    </p>
                </div>
            ) : photos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center bg-muted/20">
                    <div className="flex size-20 items-center justify-center rounded-full bg-muted/50 border shadow-sm">
                        <Trash2 className="size-10 text-muted-foreground/80" />
                    </div>
                    <h2 className="mt-6 text-xl font-semibold">Trash is empty</h2>
                    <p className="mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground max-w-sm">
                        No items have been moved to the trash recently.
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-xs text-muted-foreground -mt-2">
                        Click a photo to view details. Use the selection mode to restore or permanently delete.
                    </p>
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
                                {totalElements.toLocaleString()} items in trash
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
