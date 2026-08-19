"use client";

import React, { useState } from "react";
import { UploadCloud, CloudDownload, ChevronLeft, ChevronRight } from "lucide-react";
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

    const { data, isLoading, isError, error } = usePhotos("ACTIVE", page, PAGE_SIZE);

    const photos = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    return (
        <div className="flex h-full flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Photos</h1>
                    <p className="text-muted-foreground mt-1">Manage your memories in high quality.</p>
                    <div className="mt-2">
                        <StorageUsage />
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
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
                        {(error as Error)?.message || "Failed to load photos"}
                    </p>
                </div>
            ) : photos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center bg-muted/20">
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
