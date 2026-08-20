"use client";

import React, { useState } from "react";
import { Trash2, ChevronLeft, ChevronRight, ArchiveRestore, ListChecks, X } from "lucide-react";
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
    const [selectionMode, setSelectionMode] = useState(false);

    const { data, isLoading, isError, error, refetch, isRefetching } = usePhotos("TRASH", page, PAGE_SIZE);
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
        permanentDelete(allIds, {
            onSuccess: () => {
                setSelectedIds(new Set());
                setSelectionMode(false);
            },
        });
    };

    const handleDeleteSelected = () => {
        permanentDelete(Array.from(selectedIds), {
            onSuccess: () => {
                setSelectedIds(new Set());
                setSelectionMode(false);
            },
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
            <div className="rounded-2xl border border-[#f0d1db] bg-[#fff8fa]/75 p-5 shadow-[0_8px_24px_rgba(150,75,100,0.06)] dark:border-white/10 dark:bg-[#172847]/75 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#fde8ef] text-[#c86286] dark:bg-[#553046] dark:text-[#f4bfd0]"><Trash2 className="size-5" /></div>
                        <div>
                    <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#10264b] dark:text-white">Trash</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Items in the trash will be permanently deleted after 30 days.
                    </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {selectionMode && selectedIds.size > 0 ? (
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
                            <div className="flex flex-wrap gap-2">
                                {selectionMode ? (
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
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() => setSelectionMode(true)}
                                    >
                                        <ListChecks className="size-4" />
                                        Select photos
                                    </Button>
                                )}
                                {!selectionMode && (
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
                                )}
                            </div>
                        )
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
                <div className="flex-1 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#f0d1db] bg-[#fff8fa]/65 p-12 text-center dark:border-white/10 dark:bg-white/5">
                    <p className="text-destructive text-sm">{(error as Error)?.message || "Failed to load trash"}</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>Try again</Button>
                </div>
            ) : photos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#f0d1db] bg-[#fff8fa]/65 p-12 text-center dark:border-white/10 dark:bg-white/5">
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
                        {selectionMode ? "Select photos to restore or permanently delete." : "Click a photo to view details, or select photos for batch actions."}
                    </p>
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
