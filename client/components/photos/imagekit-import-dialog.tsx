"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, CheckCircle2, CloudDownload, Search, X } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { ImageKitAssetResponse } from "@/lib/api";
import { useImageKitAssets, useImportAssets } from "@/hooks/use-photos";

type ImageKitImportDialogProps = {
    open: boolean;
    onClose: () => void;
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageKitImportDialog({ open, onClose }: ImageKitImportDialogProps) {
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const { data: assets, isLoading, isError, error } = useImageKitAssets();
    const { mutate: importAssets, isPending: importing } = useImportAssets();

    const filteredAssets = (assets ?? []).filter((a) =>
        a.fileName.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSelect = (fileId: string, alreadyImported: boolean) => {
        if (alreadyImported) return;
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(fileId)) {
                next.delete(fileId);
            } else {
                next.add(fileId);
            }
            return next;
        });
    };

    const handleImport = () => {
        if (selectedIds.size === 0) return;
        importAssets(Array.from(selectedIds), {
            onSuccess: () => {
                setSelectedIds(new Set());
                onClose();
            },
        });
    };

    const handleClose = () => {
        if (!importing) {
            setSelectedIds(new Set());
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent showCloseButton={false} className="flex h-[min(86vh,760px)] w-[calc(100vw-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden rounded-3xl border-[#d8eaf3] bg-[#f7fbfd] p-0 shadow-[0_28px_90px_rgba(38,83,112,0.2)] dark:border-white/10 dark:bg-[#10213e] sm:w-[calc(100vw-3rem)]">
                <DialogHeader className="shrink-0 border-b border-[#dcebf2] bg-white px-5 py-5 dark:border-white/10 dark:bg-[#172847] sm:px-7">
                    <div className="flex items-start gap-3 pr-8">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#dff4fb] text-[#3189ad] dark:bg-[#1e4863] dark:text-[#bdeaf8]"><CloudDownload className="size-5" /></div>
                        <div className="min-w-0">
                            <DialogTitle className="text-xl font-semibold tracking-[-0.03em] text-[#10264b] dark:text-white">Import from ImageKit</DialogTitle>
                            <p className="mt-1 max-w-xl text-sm leading-5 text-muted-foreground">Choose images from your ImageKit storage to add them to your PixelZone library.</p>
                        </div>
                        <Button variant="ghost" size="icon" className="absolute right-3 top-3 size-9 text-muted-foreground" onClick={handleClose} disabled={importing} aria-label="Close import dialog"><X className="size-4" /></Button>
                    </div>
                </DialogHeader>

                {/* Search bar */}
                <div className="shrink-0 border-b border-[#dcebf2] bg-white px-5 py-3 dark:border-white/10 dark:bg-[#172847] sm:px-7">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search images by filename..."
                            className="h-10 border-[#d8eaf3] bg-[#f7fbfd] pl-9 dark:border-white/10 dark:bg-white/5"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Asset grid */}
                <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7fbfd] dark:bg-[#0d1d33]">
                    {isLoading ? (
                        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:p-5 md:grid-cols-4">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <Skeleton key={i} className="aspect-square rounded-md" />
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <p className="text-sm">
                                {(error as Error)?.message || "Failed to load ImageKit assets"}
                            </p>
                        </div>
                    ) : filteredAssets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <CloudDownload className="size-12 opacity-30 mb-3" />
                            <p className="text-sm">
                                {search ? "No assets match your search" : "No importable assets found in ImageKit"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:p-5 md:grid-cols-4">
                            {filteredAssets.map((asset) => (
                                <AssetCard
                                    key={asset.fileId}
                                    asset={asset}
                                    isSelected={selectedIds.has(asset.fileId)}
                                    onToggle={() => toggleSelect(asset.fileId, asset.alreadyImported)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="shrink-0 flex-col gap-3 border-t border-[#dcebf2] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:border-white/10 dark:bg-[#172847]">
                    <div className="min-w-0 text-sm text-muted-foreground">
                        {selectedIds.size > 0 ? (
                            <span className="font-medium text-[#10264b] dark:text-white"><Check className="mr-1 inline size-4 text-emerald-500" />{selectedIds.size} image{selectedIds.size !== 1 ? "s" : ""} selected</span>
                        ) : (
                            <span>Select images to add them to your library</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleClose} disabled={importing}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={selectedIds.size === 0 || importing}
                        >
                            {importing ? (
                                <>
                                    <Spinner className="size-4 mr-2" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                        <CloudDownload className="mr-2 size-4" />
                                            Import {selectedIds.size > 0 ? `${selectedIds.size} photo${selectedIds.size !== 1 ? "s" : ""}` : ""}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AssetCard({
    asset,
    isSelected,
    onToggle,
}: {
    asset: ImageKitAssetResponse;
    isSelected: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            className={cn(
                "group relative aspect-square overflow-hidden rounded-xl bg-muted text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3189ad] focus-visible:ring-offset-2",
                asset.alreadyImported
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:ring-2 hover:ring-primary/60",
                isSelected && "ring-2 ring-primary"
            )}
            onClick={onToggle}
            aria-label={asset.alreadyImported ? `${asset.fileName}, already in library` : `${asset.fileName}, ${isSelected ? "selected" : "not selected"}`}
            disabled={asset.alreadyImported}
        >
            <Image
                src={asset.thumbnailUrl || asset.url}
                alt={asset.fileName}
                fill
                sizes="(max-width: 640px) 33vw, 20vw"
                className="object-cover"
                unoptimized
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

            {/* Already imported badge */}
            {asset.alreadyImported && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#10213e]/70 px-3 text-center text-white backdrop-blur-[2px]">
                    <CheckCircle2 className="size-6 text-[#9ee1c0]" />
                    <span className="text-xs font-semibold">Already in library</span>
                </div>
            )}

            {/* Selected check */}
            {!asset.alreadyImported && (
                <div
                    className={cn(
                        "absolute top-1.5 right-1.5 transition-opacity",
                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                    )}
                >
                    <CheckCircle2
                        className={cn(
                            "size-5 drop-shadow",
                            isSelected ? "text-primary fill-primary-foreground" : "text-white"
                        )}
                    />
                </div>
            )}

            {/* File info */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8">
                <p className="truncate text-xs font-medium text-white">{asset.fileName}</p>
                <p className="mt-0.5 text-[10px] text-white/70">{formatBytes(asset.sizeBytes)}</p>
            </div>
        </button>
    );
}
