"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { albumKeys, photoKeys } from "@/lib/query-keys";

// ==================== List Albums ====================

export function useAlbums() {
    return useQuery({
        queryKey: albumKeys.lists(),
        queryFn: () => api.listAlbums(),
    });
}

// ==================== Get Album ====================

export function useAlbum(id: string) {
    return useQuery({
        queryKey: albumKeys.detail(id),
        queryFn: () => api.getAlbum(id),
        enabled: !!id,
    });
}

// ==================== Get Album Photos ====================

export function useAlbumPhotos(albumId: string, page = 0, size = 24) {
    return useQuery({
        queryKey: albumKeys.photos(albumId, { page, size }),
        queryFn: () => api.getAlbumPhotos(albumId, { page, size }),
        enabled: !!albumId,
    });
}

// ==================== Create Album ====================

export function useCreateAlbum() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (title: string) => api.createAlbum({ title }),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
            toast.success("Album created!");
        },

        onError: (error: Error) => {
            toast.error(error.message || "Failed to create album");
        },
    });
}

// ==================== Update Album ====================

export function useUpdateAlbum(albumId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (title: string) => api.updateAlbum(albumId, { title }),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
            queryClient.invalidateQueries({ queryKey: albumKeys.detail(albumId) });
            toast.success("Album updated!");
        },

        onError: (error: Error) => {
            toast.error(error.message || "Failed to update album");
        },
    });
}

// ==================== Delete Album ====================

export function useDeleteAlbum() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (albumId: string) => api.deleteAlbum(albumId),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
            toast.success("Album deleted");
        },

        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete album");
        },
    });
}

// ==================== Add Photos to Album ====================

export function useAddPhotosToAlbum(albumId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (photoIds: string[]) => api.addPhotosToAlbum(albumId, photoIds),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: albumKeys.photos(albumId) });
            queryClient.invalidateQueries({ queryKey: albumKeys.detail(albumId) });
            queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
            toast.success("Photos added to album!");
        },

        onError: (error: Error) => {
            toast.error(error.message || "Failed to add photos to album");
        },
    });
}

// ==================== Remove Photo from Album ====================

export function useRemovePhotoFromAlbum(albumId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (photoId: string) => api.removePhotoFromAlbum(albumId, photoId),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: albumKeys.photos(albumId) });
            queryClient.invalidateQueries({ queryKey: albumKeys.detail(albumId) });
            queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
            toast.success("Photo removed from album");
        },

        onError: (error: Error) => {
            toast.error(error.message || "Failed to remove photo from album");
        },
    });
}
