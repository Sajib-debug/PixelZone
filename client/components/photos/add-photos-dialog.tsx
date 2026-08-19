"use client";

import React, { useState } from "react";
import { Images } from "lucide-react";

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
    const [page, setPage] = useState(0);
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
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Add Photos to Album</DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto p-4" style={{ maxHeight: "60vh" }}>
                    {isLoading ? (
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <Skeleton key={i} className="aspect-square rounded-sm" />
                            ))}
                        </div>
                    ) : photos.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
                            <Images className="size-10 opacity-30 mb-3" />
                            <p className="text-sm">No photos in your library to add</p>
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

                <DialogFooter className="px-6 py-4 border-t flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {selectedIds.size > 0
                            ? `${selectedIds.size} photo${selectedIds.size !== 1 ? "s" : ""} selected`
                            : "Click photos to select them"}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleClose} disabled={adding}>
                            Cancel
                        </Button>
                        <Button onClick={handleAdd} disabled={selectedIds.size === 0 || adding}>
                            {adding ? (
                                <><Spinner className="size-4 mr-2" />Adding...</>
                            ) : (
                                `Add ${selectedIds.size > 0 ? `(${selectedIds.size})` : ""}`
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
