"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
    Archive,
    ArchiveRestore,
    Download,
    Info,
    Sparkles,
    Trash2,
    X,
} from "lucide-react";
import { format } from "date-fns";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { PhotoResponse } from "@/lib/api";
import { useArchivePhotos, useRestorePhotos, usePermanentDeletePhotos, useTrashPhotos } from "@/hooks/use-photos";
import { AiTransformDialog } from "./ai-transform-dialog";

type PhotoDetailDialogProps = {
    photo: PhotoResponse | null;
    open: boolean;
    onClose: () => void;
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PhotoDetailDialog({ photo, open, onClose }: PhotoDetailDialogProps) {
    const [showInfo, setShowInfo] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);

    const { mutate: archive, isPending: archiving } = useArchivePhotos();
    const { mutate: trash, isPending: trashing } = useTrashPhotos();
    const { mutate: restore, isPending: restoring } = useRestorePhotos();
    const { mutate: permanentDelete, isPending: deleting } = usePermanentDeletePhotos();

    if (!photo) return null;

    const isActive = photo.status === "ACTIVE";
    const isArchived = photo.status === "ARCHIVE";
    const isDeleted = photo.status === "TRASH";
    const isAiDerived = !!photo.aiTransformType;

    const handleArchive = () => {
        archive([photo.id], { onSuccess: onClose });
    };

    const handleRestore = () => {
        restore([photo.id], { onSuccess: onClose });
    };

    const handleTrash = () => {
        trash([photo.id], { onSuccess: onClose });
    };

    const handleDelete = () => {
        permanentDelete([photo.id], { onSuccess: onClose });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
                <DialogContent showCloseButton={false} className="flex h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-white/10 bg-[#0b1017] p-0 text-white shadow-[0_28px_90px_rgba(0,0,0,0.5)] sm:h-[min(90vh,960px)] sm:w-[min(92vw,1600px)] sm:max-w-[min(92vw,1600px)] sm:rounded-3xl">
                    <DialogHeader className="flex shrink-0 flex-row items-center justify-between gap-4 border-b border-white/10 bg-[#0d1d33] px-5 py-4 sm:px-6">
                        <div className="min-w-0">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9edcf4]">Photo viewer</p>
                            <DialogTitle className="truncate text-base font-semibold text-white sm:text-lg">
                                {photo.fileName}
                            </DialogTitle>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5 pr-8 sm:pr-10">
                            {isAiDerived && (
                                <Badge className="hidden gap-1 border-[#8ed6ee]/20 bg-[#8ed6ee]/10 text-[#bdeaf8] sm:inline-flex">
                                    <Sparkles className="size-3" />
                                    {photo.aiTransformType?.replace(/_/g, " ")}
                                </Badge>
                            )}
                                <Button
                                variant="ghost"
                                size="icon"
                                    className="size-9 text-white/65 hover:bg-white/10 hover:text-white"
                                    aria-label="Show photo details"
                                onClick={() => setShowInfo((v) => !v)}
                            >
                                <Info className="size-4" />
                            </Button>
                                <a
                                    href={photo.url}
                                    download={photo.fileName}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex size-9 items-center justify-center rounded-full text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                                    aria-label="Download photo"
                                >
                                    <Download className="size-4" />
                                </a>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-3 top-3 size-9 text-white/65 hover:bg-white/10 hover:text-white"
                                onClick={onClose}
                                aria-label="Close photo viewer"
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row">
                        {/* Image */}
                        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#0b1017] md:min-h-0">
                            <Image
                                src={photo.url}
                                alt={photo.fileName}
                                fill
                                className="object-contain p-2 sm:p-5"
                                sizes="(max-width: 1024px) 100vw, 75vw"
                                unoptimized
                            />
                        </div>

                        {/* Info panel */}
                        {showInfo && (
                            <div className="w-full shrink-0 overflow-y-auto border-t border-white/10 bg-[#0d1d33] text-white md:w-80 md:border-l md:border-t-0">
                                <div className="space-y-6 p-5">
                                    <div>
                                        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9edcf4]">
                                            Details
                                        </p>
                                        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                                            <InfoRow label="File name" value={photo.fileName} />
                                            <InfoRow label="Type" value={photo.mimeType || "—"} />
                                            <InfoRow label="Size" value={formatBytes(photo.sizeBytes)} />
                                            {photo.width && photo.height && (
                                                <InfoRow label="Dimensions" value={`${photo.width} × ${photo.height}`} />
                                            )}
                                            <InfoRow
                                                label="Uploaded"
                                                value={format(new Date(photo.createdAt), "MMM d, yyyy")}
                                            />
                                            <InfoRow label="Status" value={photo.status} />
                                        </div>
                                    </div>

                                    {isAiDerived && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                                    AI Transform
                                                </p>
                                                <div className="space-y-2 text-sm">
                                                    <InfoRow
                                                        label="Type"
                                                        value={photo.aiTransformType?.replace(/_/g, " ") || "—"}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action bar */}
                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#0d1d33] px-4 py-3 sm:px-5">
                        <div className="flex flex-wrap items-center gap-1">
                            {isActive && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                                    onClick={handleArchive}
                                    disabled={archiving}
                                >
                                    <Archive className="size-4" />
                                    Archive
                                </Button>
                            )}
                            {isActive && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 text-[#f1a8ba] hover:bg-[#f1a8ba]/10 hover:text-[#ffc5d3]"
                                    onClick={handleTrash}
                                    disabled={trashing}
                                >
                                    <Trash2 className="size-4" />
                                    Trash
                                </Button>
                            )}
                            {isArchived && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                                    onClick={handleRestore}
                                    disabled={restoring}
                                >
                                    <ArchiveRestore className="size-4" />
                                    Restore
                                </Button>
                            )}
                            {isDeleted && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                                    onClick={handleRestore}
                                    disabled={restoring}
                                >
                                    <ArchiveRestore className="size-4" />
                                    Restore
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1">
                            {(isActive || isArchived) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 border border-[#8ed6ee]/20 bg-[#8ed6ee]/10 text-[#bdeaf8] hover:bg-[#8ed6ee]/20 hover:text-white"
                                    onClick={() => setAiOpen(true)}
                                >
                                    <Sparkles className="size-4" />
                                    AI Transform
                                </Button>
                            )}
                            {isDeleted && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 text-[#f1a8ba] hover:bg-[#f1a8ba]/10 hover:text-[#ffc5d3]"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    <Trash2 className="size-4" />
                                    Delete permanently
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AiTransformDialog
                photo={photo}
                open={aiOpen}
                onClose={() => setAiOpen(false)}
            />
        </>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-2">
            <span className="text-muted-foreground shrink-0">{label}</span>
            <span className="font-medium text-right break-all">{value}</span>
        </div>
    );
}
