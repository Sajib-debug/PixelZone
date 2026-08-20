"use client";

import React, { useState } from "react";
import { UploadCloud, CloudDownload, ChevronLeft, ChevronRight, Images, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { UploadButton } from "@/components/photos/upload-button";
import { PhotoDetailDialog } from "@/components/photos/photo-detail-dialog";
import { ImageKitImportDialog } from "@/components/photos/imagekit-import-dialog";
import { StorageUsage } from "@/components/photos/storage-usage";
import { usePhotos } from "@/hooks/use-photos";
import type { PhotoResponse } from "@/lib/api";

const PAGE_SIZE = 24;

export default function PhotosPage() {
    const [page, setPage] = useState(0);
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoResponse | null>(null);
    const [importOpen, setImportOpen] = useState(false);

    const { data, isLoading, isError, error, refetch, isRefetching } = usePhotos("ACTIVE", page, PAGE_SIZE);

    const photos = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    return (
        <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-6">
            {/* Header */}
                        <div className="rounded-2xl border border-[#d8eaf3] bg-white/70 p-5 shadow-[0_8px_24px_rgba(38,83,112,0.06)] dark:border-white/10 dark:bg-[#172847]/75 sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#dff3fb] text-[#2f83aa] dark:bg-[#1e4863] dark:text-[#9edcf4]"><Images className="size-5" /></div>
                        <div>
                            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#10264b] dark:text-white">Photos</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Your personal library, all in one place.</p>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <StorageUsage />
                        <span className="hidden h-4 w-px bg-border sm:block" />
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf8fc] px-3 py-1 text-xs font-medium text-[#347796] dark:bg-[#1c3e55] dark:text-[#a8def2]"><LayoutGrid className="size-3.5" /> Library view</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <Button
                        variant="outline"
                        className="gap-2 cursor-pointer shadow-sm"
                        onClick={() => setImportOpen(true)}
                    >
                        <CloudDownload className="size-4" />
                        Import
                    </Button>
                    <UploadButton />
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
                    <p className="text-destructive text-sm">{(error as Error)?.message || "Failed to load photos"}</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>Try again</Button>
                </div>
            ) : photos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#c8e4ef] bg-white/65 p-12 text-center dark:border-white/10 dark:bg-white/5">
                    <div className="flex size-20 items-center justify-center rounded-full bg-muted/50 border shadow-sm">
                        <UploadCloud className="size-10 text-muted-foreground/80" />
                    </div>
                    <h2 className="mt-6 text-xl font-semibold">No photos yet</h2>
                    <p className="mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground max-w-sm">
                        {"You haven't uploaded any photos yet. Start building your library by uploading your first photo."}
                    </p>
                    <div className="flex items-center gap-3">
                        <UploadButton variant="dropzone" />
                        <Button
                            variant="outline"
                            className="cursor-pointer shadow-sm"
                            onClick={() => setImportOpen(true)}
                        >
                            <CloudDownload className="size-4 mr-2" />
                            Import from ImageKit
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <PhotoGrid
                        photos={photos}
                        onOpen={(photo) => setSelectedPhoto(photo)}
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-sm text-muted-foreground">
                                {totalElements.toLocaleString()} photos total
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

            {/* ImageKit import dialog */}
            <ImageKitImportDialog
                open={importOpen}
                onClose={() => setImportOpen(false)}
            />
        </div>
    );
}
