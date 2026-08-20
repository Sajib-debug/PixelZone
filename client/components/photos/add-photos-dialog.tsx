"use client";

import React, { useState } from "react";
import { Images, Plus, X } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { usePhotos } from "@/hooks/use-photos";
import { useAddPhotosToAlbum } from "@/hooks/use-albums";
import type { PhotoResponse } from "@/lib/api";

type AddPhotosDialogProps = {
    albumId: string;
    open: boolean;
    onClose: () => void;
};

const PAGE_SIZE = 30;

export function AddPhotosDialog({ albumId, open, onClose }: AddPhotosDialogProps) {
    const [page] = useState(0);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const { data, isLoading } = usePhotos("ACTIVE", page, PAGE_SIZE);
    const { mutate: addPhotos, isPending: adding } = useAddPhotosToAlbum(albumId);

    const photos = data?.content ?? [];

    const handleSelect = (photo: PhotoResponse) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(photo.id)) next.delete(photo.id);
            else next.add(photo.id);
            return next;
        });
    };

    const handleAdd = () => {
        if (selectedIds.size === 0) return;
        addPhotos(Array.from(selectedIds), {
            onSuccess: () => {
                setSelectedIds(new Set());
                onClose();
            },
        });
    };

    const handleClose = () => {
        if (!adding) {
            setSelectedIds(new Set());
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent showCloseButton={false} className="flex h-[min(82vh,720px)] w-[calc(100vw-1.5rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-3xl border-[#d8eaf3] bg-[#f7fbfd] p-0 shadow-[0_28px_90px_rgba(38,83,112,0.2)] dark:border-white/10 dark:bg-[#10213e] sm:w-[calc(100vw-3rem)]">
                <DialogHeader className="shrink-0 border-b border-[#dcebf2] bg-white px-5 py-5 dark:border-white/10 dark:bg-[#172847] sm:px-7">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <DialogTitle className="text-xl font-semibold text-[#10264b] dark:text-white">Add photos to album</DialogTitle>
                            <p className="mt-1 text-sm text-muted-foreground">Choose photos from your library to add to this album.</p>
                        </div>
                        <Button variant="ghost" size="icon" className="size-9 text-muted-foreground" onClick={handleClose} disabled={adding} aria-label="Close add photos dialog"><X className="size-4" /></Button>
                    </div>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto bg-[#f4f9fb] p-4 dark:bg-[#0d1d33] sm:p-6">
                    {isLoading ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <Skeleton key={i} className="aspect-square rounded-sm" />
                            ))}
                        </div>
                    ) : photos.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfe4ec] bg-white/70 px-6 text-center text-muted-foreground dark:border-white/10 dark:bg-white/[0.03]">
                            <Images className="size-10 text-[#6eafc4]" />
                            <p className="mt-3 text-sm font-semibold text-[#10264b] dark:text-white">No photos available</p>
                            <p className="mt-1 text-xs">Upload or import photos before adding them to an album.</p>
                        </div>
                    ) : (
                        <PhotoGrid
                            photos={photos}
                            selectable
                            selectedIds={selectedIds}
                            onSelect={handleSelect}
                            onOpen={handleSelect}
                        />
                    )}
                </div>

                <DialogFooter className="shrink-0 flex-col gap-3 border-t border-[#dcebf2] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#172847] sm:px-7">
                    <span className="text-sm text-muted-foreground">
                        {selectedIds.size > 0
                            ? `${selectedIds.size} photo${selectedIds.size !== 1 ? "s" : ""} selected`
                            : "Select one or more photos"}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleClose} disabled={adding}>
                            Cancel
                        </Button>
                        <Button onClick={handleAdd} disabled={selectedIds.size === 0 || adding}>
                            {adding ? (
                                <><Spinner className="size-4 mr-2" />Adding...</>
                            ) : (
                                <><Plus className="mr-2 size-4" />Add {selectedIds.size > 0 ? `${selectedIds.size} photo${selectedIds.size !== 1 ? "s" : ""}` : ""}</>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
