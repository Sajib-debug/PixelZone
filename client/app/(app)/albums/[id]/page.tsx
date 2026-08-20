"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Images, ListChecks, Plus, Trash2, X, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { PhotoDetailDialog } from "@/components/photos/photo-detail-dialog";
import { AddPhotosDialog } from "@/components/photos/add-photos-dialog";
import { useAlbum, useAlbumPhotos, useRemovePhotoFromAlbum } from "@/hooks/use-albums";
import type { PhotoResponse } from "@/lib/api";
import { useParams } from "next/navigation";

const PAGE_SIZE = 24;

export default function AlbumDetailPage() {
    const params = useParams<{ id: string }>();
    const albumId = params.id;
    const [page, setPage] = useState(0);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [addPhotosOpen, setAddPhotosOpen] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);

    const { data: album, isLoading: albumLoading } = useAlbum(albumId);
    const { data, isLoading, isError, error, refetch, isRefetching } = useAlbumPhotos(albumId, page, PAGE_SIZE);
    const { mutateAsync: removePhoto, isPending: removing } = useRemovePhotoFromAlbum(albumId);

    const photos = data?.content ?? [];
    const selectedPhoto = selectedPhotoIndex === null ? null : photos[selectedPhotoIndex] ?? null;

    const toggleSelect = (photo: PhotoResponse) => {
        setSelectedIds((previous) => {
            const next = new Set(previous);
            if (next.has(photo.id)) next.delete(photo.id);
            else next.add(photo.id);
            return next;
        });
    };

    const handleRemove = async () => {
        for (const photoId of selectedIds) await removePhoto(photoId);
        setSelectedIds(new Set());
        setSelectionMode(false);
    };

    const openPhoto = (photo: PhotoResponse) => {
        const index = photos.findIndex((item) => item.id === photo.id);
        if (index >= 0) setSelectedPhotoIndex(index);
    };

    return (
        <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-6">
            <header className="flex flex-col gap-4 border-b border-[#d8eaf3] pb-5 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <Link href="/albums" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-[#10264b] dark:hover:text-white">
                        <ArrowLeft className="size-4" /> Back to albums
                    </Link>
                    {albumLoading ? <Skeleton className="h-9 w-56" /> : <h1 className="truncate text-3xl font-semibold tracking-[-0.04em] text-[#10264b] dark:text-white">{album?.title || "Album"}</h1>}
                    <p className="mt-1 text-sm text-muted-foreground">{data?.totalElements?.toLocaleString() ?? album?.photoCount ?? 0} photos in this album</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {selectionMode ? (
                        <>
                            <Button variant="ghost" className="gap-2" onClick={() => { setSelectedIds(new Set()); setSelectionMode(false); }}>
                                <X className="size-4" /> Cancel
                            </Button>
                            {selectedIds.size > 0 && <Button variant="outline" className="gap-2 text-destructive" onClick={handleRemove} disabled={removing}><Trash2 className="size-4" /> Remove ({selectedIds.size})</Button>}
                        </>
                    ) : (
                        <Button variant="outline" className="gap-2" onClick={() => setSelectionMode(true)}><ListChecks className="size-4" /> Select photos</Button>
                    )}
                    <Button className="gap-2" onClick={() => setAddPhotosOpen(true)}><Plus className="size-4" /> Add photos</Button>
                </div>
            </header>

            <main className="min-h-0 flex-1">
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{Array.from({ length: PAGE_SIZE }).map((_, index) => <Skeleton key={index} className="aspect-square rounded-xl" />)}</div>
                ) : isError ? (
                    <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-[#c8e4ef] text-center"><AlertCircle className="size-9 text-destructive/70" /><p className="mt-3 text-sm font-medium">Unable to load album photos</p><p className="mt-1 text-xs text-muted-foreground">{(error as Error)?.message || "Please try again."}</p><Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()} disabled={isRefetching}>Try again</Button></div>
                ) : photos.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-[#c8e4ef] text-center"><Images className="size-12 text-[#6eafc4]" /><h2 className="mt-4 text-lg font-semibold text-[#10264b] dark:text-white">No photos in this album yet</h2><p className="mt-1 text-sm text-muted-foreground">Add photos from your library to get started.</p><Button className="mt-4 gap-2" onClick={() => setAddPhotosOpen(true)}><Plus className="size-4" /> Add photos</Button></div>
                ) : (
                    <>
                        <PhotoGrid photos={photos} selectable={selectionMode} selectedIds={selectedIds} onSelect={toggleSelect} onOpen={openPhoto} />
                        {data && data.totalPages > 1 && <div className="flex items-center justify-center gap-3 pt-6"><Button variant="outline" size="icon" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={page === 0} aria-label="Previous album page"><ChevronLeft className="size-4" /></Button><span className="text-sm text-muted-foreground">Page {page + 1} of {data.totalPages}</span><Button variant="outline" size="icon" onClick={() => setPage((value) => value + 1)} disabled={data.last} aria-label="Next album page"><ChevronRight className="size-4" /></Button></div>}
                    </>
                )}
            </main>

            <PhotoDetailDialog photo={selectedPhoto} open={!!selectedPhoto} onClose={() => setSelectedPhotoIndex(null)} onPrevious={selectedPhotoIndex !== null && selectedPhotoIndex > 0 ? () => setSelectedPhotoIndex((value) => value === null ? null : value - 1) : undefined} onNext={selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1 ? () => setSelectedPhotoIndex((value) => value === null ? null : value + 1) : undefined} currentIndex={selectedPhotoIndex ?? undefined} totalPhotos={photos.length} />
            <AddPhotosDialog albumId={albumId} open={addPhotosOpen} onClose={() => setAddPhotosOpen(false)} />
        </div>
    );
}
