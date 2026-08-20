"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PhotoResponse } from "@/lib/api";

type PhotoGridProps = {
    photos: PhotoResponse[];
    selectable?: boolean;
    selectedIds?: Set<string>;
    onSelect?: (photo: PhotoResponse) => void;
    onOpen?: (photo: PhotoResponse) => void;
    layout?: "default" | "album";
};

export function PhotoGrid({
    photos,
    selectable = false,
    selectedIds = new Set(),
    onSelect,
    onOpen,
    layout = "default",
}: PhotoGridProps) {
    return (
        <div className={layout === "album" ? "grid grid-cols-1 gap-5 md:grid-cols-2" : "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"}>
            {photos.map((photo) => {
                const isSelected = selectedIds.has(photo.id);
                const isAiDerived = !!photo.aiTransformType;

                return (
                    <div
                        key={photo.id}
                        className={cn(
                            "group relative cursor-pointer overflow-hidden rounded-xl bg-muted shadow-[0_4px_14px_rgba(38,83,112,0.08)] transition-shadow hover:shadow-[0_10px_28px_rgba(38,83,112,0.16)]",
                            layout === "album" ? "aspect-[4/3]" : "aspect-square",
                            isSelected && "ring-2 ring-primary ring-offset-2"
                        )}
                        onClick={() => {
                            if (selectable && onSelect) {
                                onSelect(photo);
                            } else if (onOpen) {
                                onOpen(photo);
                            }
                        }}
                    >
                        <Image
                            src={photo.thumbnailUrl || photo.url}
                            alt={photo.fileName}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                            className="object-cover transition-transform duration-200 group-hover:scale-105"
                            unoptimized
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />

                        {/* AI badge */}
                        {isAiDerived && (
                            <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                                <Sparkles className="size-2.5" />
                                AI
                            </div>
                        )}

                        {/* Selection indicator */}
                        {selectable && (
                            <div
                                className={cn(
                                    "absolute top-1.5 right-1.5 transition-all duration-150",
                                    isSelected
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-60"
                                )}
                            >
                                <CheckCircle2
                                    className={cn(
                                        "size-5 drop-shadow",
                                        isSelected
                                            ? "text-primary fill-primary-foreground"
                                            : "text-white"
                                    )}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
