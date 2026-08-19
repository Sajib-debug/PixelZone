"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
    useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { api, type AiTransformRequest, type PhotoStatus } from "@/lib/api";
import { photoKeys, libraryKeys } from "@/lib/query-keys";

// ==================== List Photos ====================

export function usePhotos(status: PhotoStatus = "ACTIVE", page = 0, size = 24) {
    return useQuery({
        queryKey: photoKeys.list({ status, page, size }),
        queryFn: () => api.listPhotos({ status, page, size }),
    });
}

// ==================== Get Photo ====================

export function usePhoto(id: string) {
    return useQuery({
        queryKey: photoKeys.detail(id),
        queryFn: () => api.getPhoto(id),
        enabled: !!id,
    });
}

// ==================== Upload Photo ====================

export function useUploadPhoto() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => api.uploadPhoto(file),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
            queryClient.invalidateQueries({ queryKey: libraryKeys.storage() });
            toast.success("Photo uploaded successfully!");
        },

        onError: (error: Error) => {
            toast.error(error.message || "Failed to upload photo");
        },
    });
}

// ==================== Archive Photos ====================

export function useArchivePhotos() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (photoIds: string[]) => api.archivePhotos(photoIds),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
            toast.success("Photo(s) archived");
        },

        onError: (error: Error) => {
            toast.error(error.message || "Failed to archive photo(s)");
        },
    });
}

// ==================== Restore Photos ====================

export function useRestorePhotos() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (photoIds: string[]) => api.restorePhotos(photoIds),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
            toast.success("Photo(s) restored");
        },

        onError: (error: Error) => {
            toast.error(error.message || "Failed to restore photo(s)");
        },
    });
}

// ==================== Permanently Delete Photos ====================

export function usePermanentDeletePhotos() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (photoIds: string[]) => api.permanentDeletePhotos(photoIds),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
            queryClient.invalidateQueries({ queryKey: libraryKeys.storage() });
            toast.success("Photo(s) permanently deleted");
        },

        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete photo(s)");
        },
    });
}

// ==================== Delete Photo (move to trash via status or permanent) ====================

export function useDeletePhoto() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.deletePhoto(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
            queryClient.invalidateQueries({ queryKey: libraryKeys.storage() });
            toast.success("Photo deleted");
        },

        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete photo");
        },
    });
}

// ==================== Storage Usage ====================

export function useStorageUsage() {
    return useQuery({
        queryKey: libraryKeys.storage(),
        queryFn: () => api.getStorageUsage(),
    });
}

// ==================== ImageKit Assets ====================

export function useImageKitAssets() {
    return useQuery({
        queryKey: libraryKeys.imagekitAssets(),
        queryFn: () => api.listImageKitAssets(),
    });
}

// ==================== Import Assets ====================

export function useImportAssets() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (imagekitFileIds: string[]) => api.importAssets(imagekitFileIds),

        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
            queryClient.invalidateQueries({ queryKey: libraryKeys.storage() });
            queryClient.invalidateQueries({ queryKey: libraryKeys.imagekitAssets() });
            toast.success(`${data.length} photo(s) imported successfully!`);
        },

        onError: (error: Error) => {
            toast.error(error.message || "Failed to import photos");
        },
    });
}

// ==================== AI Preview ====================

export function useAiPreview() {
    return useMutation({
        mutationFn: ({
            photoId,
            request,
        }: {
            photoId: string;
            request: AiTransformRequest;
        }) => api.aiPreview(photoId, request),

        onError: (error: Error) => {
            toast.error(error.message || "AI preview failed");
        },
    });
}

// ==================== AI Apply ====================

export function useAiApply() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            photoId,
            request,
        }: {
            photoId: string;
            request: AiTransformRequest;
        }) => api.aiApply(photoId, request),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
            queryClient.invalidateQueries({ queryKey: libraryKeys.storage() });
            toast.success("AI transformation applied! New photo added to your library.");
        },

        onError: (error: Error) => {
            toast.error(error.message || "AI transformation failed");
        },
    });
}
