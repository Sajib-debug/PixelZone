"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle2, CloudDownload, Search } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
            <DialogContent className="max-w-4xl p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <CloudDownload className="size-5 text-primary" />
                        Import from ImageKit
                    </DialogTitle>
                </DialogHeader>

                {/* Search bar */}
                <div className="px-6 py-3 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by filename..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Asset grid */}
                <div className="overflow-y-auto" style={{ maxHeight: "55vh" }}>
                    {isLoading ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-4">
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
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-4">
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

                <DialogFooter className="px-6 py-4 border-t flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {selectedIds.size > 0 ? (
                            <span>{selectedIds.size} asset{selectedIds.size !== 1 ? "s" : ""} selected</span>
                        ) : (
                            <span>Click assets to select them for import</span>
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
                                    <CloudDownload className="size-4 mr-2" />
                                    Import {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
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
        <div
            className={cn(
                "group relative aspect-square overflow-hidden rounded-md cursor-pointer bg-muted transition-all",
                asset.alreadyImported
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:ring-2 hover:ring-primary/60",
                isSelected && "ring-2 ring-primary"
            )}
            onClick={onToggle}
            title={`${asset.fileName} (${formatBytes(asset.sizeBytes)})`}
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
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Badge variant="secondary" className="text-xs">Imported</Badge>
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
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-white text-[10px] truncate">{asset.fileName}</p>
                <p className="text-white/70 text-[10px]">{formatBytes(asset.sizeBytes)}</p>
            </div>
        </div>
    );
}
