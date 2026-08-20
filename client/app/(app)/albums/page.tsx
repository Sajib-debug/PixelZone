"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, FolderPlus, Trash2, Edit2, MoreHorizontal, Images } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAlbums, useCreateAlbum, useDeleteAlbum, useUpdateAlbum } from "@/hooks/use-albums";
import { AlbumDetailDialog } from "@/components/photos/album-detail-dialog";
import type { AlbumResponse } from "@/lib/api";

export default function AlbumsPage() {
    const [createOpen, setCreateOpen] = useState(false);
    const [editAlbum, setEditAlbum] = useState<AlbumResponse | null>(null);
    const [deleteAlbum, setDeleteAlbum] = useState<AlbumResponse | null>(null);
    const [viewAlbum, setViewAlbum] = useState<AlbumResponse | null>(null);
    const [createTitle, setCreateTitle] = useState("");
    const [editTitle, setEditTitle] = useState("");

    const { data: albums, isLoading, isError, error, refetch, isRefetching } = useAlbums();
    const { mutate: createAlbum, isPending: creating } = useCreateAlbum();
    const { mutate: deleteAlbumMutation, isPending: deleting } = useDeleteAlbum();

    const handleCreate = () => {
        if (!createTitle.trim()) return;
        createAlbum(createTitle.trim(), {
            onSuccess: () => {
                setCreateTitle("");
                setCreateOpen(false);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteAlbum) return;
        deleteAlbumMutation(deleteAlbum.id, {
            onSuccess: () => setDeleteAlbum(null),
        });
    };

    return (
        <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-6">
            {/* Header */}
            <div className="rounded-2xl border border-[#d8eaf3] bg-white/70 p-5 shadow-[0_8px_24px_rgba(38,83,112,0.06)] dark:border-white/10 dark:bg-[#172847]/75 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#dff3fb] text-[#2f83aa] dark:bg-[#1e4863] dark:text-[#9edcf4]"><FolderPlus className="size-5" /></div>
                        <div>
                    <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#10264b] dark:text-white">Albums</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Organize your photos into beautiful collections.
                    </p>
                        </div>
                    </div>
                </div>
                <Button
                    className="w-full gap-2 cursor-pointer shadow-sm sm:w-auto"
                    onClick={() => setCreateOpen(true)}
                >
                    <Plus className="size-4" />
                    Create Album
                                </Button>
                            </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-xl" />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#c8e4ef] bg-white/65 p-12 text-center dark:border-white/10 dark:bg-white/5">
                    <p className="text-destructive text-sm">{(error as Error)?.message || "Failed to load albums"}</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>Try again</Button>
                </div>
            ) : !albums || albums.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#c8e4ef] bg-white/65 p-12 text-center dark:border-white/10 dark:bg-white/5">
                    <div className="flex size-20 items-center justify-center rounded-full bg-muted/50 border shadow-sm">
                        <FolderPlus className="size-10 text-muted-foreground/80" />
                    </div>
                    <h2 className="mt-6 text-xl font-semibold">No albums created</h2>
                    <p className="mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground max-w-sm">
                        Group your favorite moments together by creating an album.
                    </p>
                    <Button className="cursor-pointer shadow-sm" onClick={() => setCreateOpen(true)}>
                        Create your first album
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {albums.map((album) => (
                        <AlbumCard
                            key={album.id}
                            album={album}
                            onView={() => setViewAlbum(album)}
                            onEdit={() => {
                                setEditAlbum(album);
                                setEditTitle(album.title);
                            }}
                            onDelete={() => setDeleteAlbum(album)}
                        />
                    ))}
                </div>
            )}

            {/* Create Album Dialog */}
            <Dialog open={createOpen} onOpenChange={(open) => !open && setCreateOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Album</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <Label htmlFor="album-title">Album Title</Label>
                        <Input
                            id="album-title"
                            placeholder="e.g. Summer 2024"
                            value={createTitle}
                            onChange={(e) => setCreateTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={!createTitle.trim() || creating}>
                            {creating ? <><Spinner className="size-4 mr-2" />Creating...</> : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Album Dialog */}
            {editAlbum && (
                <EditAlbumDialog
                    album={editAlbum}
                    title={editTitle}
                    onTitleChange={setEditTitle}
                    onClose={() => setEditAlbum(null)}
                />
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteAlbum} onOpenChange={(open) => !open && setDeleteAlbum(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete &quot;{deleteAlbum?.title}&quot;?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete the album but not the photos inside it. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                        >
                            {deleting ? <Spinner className="size-4" /> : "Delete Album"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Album Detail */}
            {viewAlbum && (
                <AlbumDetailDialog
                    album={viewAlbum}
                    open={!!viewAlbum}
                    onClose={() => setViewAlbum(null)}
                />
            )}
        </div>
    );
}

// ---- Sub-components ----

function AlbumCard({
    album,
    onView,
    onEdit,
    onDelete,
}: {
    album: AlbumResponse;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="group relative rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            {/* Cover */}
            <div
                className="aspect-square relative bg-muted overflow-hidden"
                onClick={onView}
            >
                {album.coverThumbnailUrl ? (
                    <Image
                        src={album.coverThumbnailUrl}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Images className="size-12 text-muted-foreground/40" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* Info */}
            <div className="p-3 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1" onClick={onView}>
                    <p className="font-semibold truncate text-sm">{album.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {album.photoCount.toLocaleString()} photo{album.photoCount !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {format(new Date(album.updatedAt), "MMM d, yyyy")}
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger render={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    } />
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onView}>
                            <Images className="size-4 mr-2" />
                            View Photos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onEdit}>
                            <Edit2 className="size-4 mr-2" />
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={onDelete}
                        >
                            <Trash2 className="size-4 mr-2" />
                            Delete Album
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

function EditAlbumDialog({
    album,
    title,
    onTitleChange,
    onClose,
}: {
    album: AlbumResponse;
    title: string;
    onTitleChange: (v: string) => void;
    onClose: () => void;
}) {
    const { mutate: updateAlbum, isPending } = useUpdateAlbum(album.id);

    const handleSave = () => {
        if (!title.trim()) return;
        updateAlbum(title.trim(), { onSuccess: onClose });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Album</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    <Label htmlFor="edit-album-title">Album Title</Label>
                    <Input
                        id="edit-album-title"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!title.trim() || isPending}>
                        {isPending ? <><Spinner className="size-4 mr-2" />Saving...</> : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
