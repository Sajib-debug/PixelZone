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
import { useArchivePhotos, useRestorePhotos, usePermanentDeletePhotos } from "@/hooks/use-photos";
import { AiTransformDialog } from "./ai-transform-dialog";
import { cn } from "@/lib/utils";

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

    const handleDelete = () => {
        permanentDelete([photo.id], { onSuccess: onClose });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="max-w-5xl p-0 overflow-hidden h-[90vh] flex flex-col">
                    <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b shrink-0">
                        <DialogTitle className="text-base font-medium truncate max-w-xs">
                            {photo.fileName}
                        </DialogTitle>
                        <div className="flex items-center gap-1">
                            {isAiDerived && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                    <Sparkles className="size-3" />
                                    {photo.aiTransformType?.replace(/_/g, " ")}
                                </Badge>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => setShowInfo((v) => !v)}
                            >
                                <Info className="size-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                render={
                                    <a href={photo.url} download={photo.fileName} target="_blank" rel="noreferrer">
                                        <Download className="size-4" />
                                    </a>
                                }
                            />
                        </div>
                    </DialogHeader>

                    <div className="flex flex-1 overflow-hidden min-h-0">
                        {/* Image */}
                        <div className="flex-1 relative bg-muted/30 flex items-center justify-center min-h-0 overflow-hidden">
                            <Image
                                src={photo.url}
                                alt={photo.fileName}
                                fill
                                className="object-contain p-2"
                                sizes="(max-width: 1024px) 100vw, 75vw"
                                unoptimized
                            />
                        </div>

                        {/* Info panel */}
                        {showInfo && (
                            <div className="w-64 border-l flex flex-col shrink-0 overflow-y-auto">
                                <div className="p-4 space-y-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                            Details
                                        </p>
                                        <div className="space-y-2 text-sm">
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
                    <div className="flex items-center justify-between px-4 py-3 border-t shrink-0 gap-2">
                        <div className="flex items-center gap-2">
                            {isActive && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                                    onClick={handleArchive}
                                    disabled={archiving}
                                >
                                    <Archive className="size-4" />
                                    Archive
                                </Button>
                            )}
                            {isArchived && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 text-muted-foreground hover:text-foreground"
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
                                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                                    onClick={handleRestore}
                                    disabled={restoring}
                                >
                                    <ArchiveRestore className="size-4" />
                                    Restore
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {(isActive || isArchived) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => setAiOpen(true)}
                                >
                                    <Sparkles className="size-4" />
                                    AI Transform
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                <Trash2 className="size-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AiTransformDialog
                photo={photo}
                open={aiOpen}
                onClose={() => {
                    setAiOpen(false);
                    onClose();
                }}
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
