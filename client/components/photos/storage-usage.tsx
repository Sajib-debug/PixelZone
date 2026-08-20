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
        <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#d8eaf3] bg-white/80 px-3 py-2 text-[#2f6f8d] dark:border-white/10 dark:bg-white/5 dark:text-[#c7eaf8]">
                <ImageIcon className="size-4" />
                <span className="font-semibold">{data.libraryPhotoCount.toLocaleString()}</span>
                <span className="text-xs opacity-80">{data.libraryPhotoCount === 1 ? "photo" : "photos"}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#efd8e1] bg-[#fff8fa]/80 px-3 py-2 text-[#9b5570] dark:border-white/10 dark:bg-white/5 dark:text-[#f4bfd0]">
                <HardDrive className="size-4" />
                <span className="font-semibold">{formatBytes(data.libraryUsedBytes)}</span>
                <span className="text-xs opacity-80">used</span>
            </div>
        </div>
    );
}
