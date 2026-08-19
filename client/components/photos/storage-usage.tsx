"use client";

import React from "react";
import { HardDrive, ImageIcon } from "lucide-react";
import { useStorageUsage } from "@/hooks/use-photos";
import { Skeleton } from "@/components/ui/skeleton";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function StorageUsage() {
    const { data, isLoading } = useStorageUsage();

    if (isLoading) {
        return (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
                <ImageIcon className="size-4" />
                <span>{data.libraryPhotoCount.toLocaleString()} photos</span>
            </div>
            <div className="flex items-center gap-1.5">
                <HardDrive className="size-4" />
                <span>{formatBytes(data.libraryUsedBytes)} used</span>
            </div>
        </div>
    );
}
