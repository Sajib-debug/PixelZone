import { useAuthStore } from "@/stores/auth-store";

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
).replace(/\/$/, "");

// ==================== Types ====================

export type User = {
    id: string;
    email: string;
    displayName: string;
};

export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    user: User;
};

export type PhotoStatus = "ACTIVE" | "ARCHIVE" | "TRASH";

export type AiTransformType =
    | "REMOVE_BACKGROUND"
    | "BACKGROUND_AND_SHADOW"
    | "CHANGE_BACKGROUND"
    | "GENERATIVE_FILL"
    | "SMART_CROP"
    | "OBJECT_CROP"
    | "RETOUCH"
    | "UPSCALE"
    | "AI_EDIT";

export type PhotoResponse = {
    id: string;
    imagekitFileId: string;
    fileName: string;
    url: string;
    thumbnailUrl: string;
    mimeType: string;
    sizeBytes: number;
    width: number;
    height: number;
    status: PhotoStatus;
    createdAt: string;
    deletedAt: string | null;
    parentPhotoId: string | null;
    aiTransformType: AiTransformType | null;
};

export type PageResponse<T> = {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
};

export type StorageUsageResponse = {
    libraryUsedBytes: number;
    libraryPhotoCount: number;
    imagekitBandwidthBytes: number | null;
    imagekitStorageBytes: number | null;
};

export type ImageKitAssetResponse = {
    fileId: string;
    fileName: string;
    url: string;
    thumbnailUrl: string;
    sizeBytes: number;
    width: number;
    height: number;
    mimeType: string;
    alreadyImported: boolean;
};

export type AlbumResponse = {
    id: string;
    title: string;
    coverPhotoId: string | null;
    coverThumbnailUrl: string | null;
    photoCount: number;
    createdAt: string;
    updatedAt: string;
};

export type AiTransformRequest = {
    type: AiTransformType;
    prompt?: string;
    width?: number;
    height?: number;
    focusObject?: string;
};

export type AiTransformPreviewResponse = {
    previewUrl: string;
    type: AiTransformType;
    transformChain: string;
};

// ==================== Internal fetch utilities ====================

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) return null;

    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error("Refresh token expired");
        }

        const data = (await response.json()) as AuthResponse;
        useAuthStore.getState().setAuth(data);
        return data.accessToken;
    } catch {
        useAuthStore.getState().clearAuth();
        return null;
    } finally {
        refreshPromise = null;
    }
}

async function request<T>(
    path: string,
    options: RequestInit = {},
    auth = true
): Promise<T> {
    const headers = new Headers(options.headers);

    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    if (auth) {
        const token = useAuthStore.getState().accessToken;

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
    }

    let response: Response;

    try {
        response = await fetch(`${API_URL}/${path}`, {
            ...options,
            headers,
        });
    } catch {
        throw new Error(
            "Cannot reach PixelZone server. Start the Spring Boot backend or check NEXT_PUBLIC_API_URL."
        );
    }

    const isAuthPath =
        path.startsWith("auth/login") ||
        path.startsWith("auth/register") ||
        path.startsWith("auth/refresh") ||
        path.startsWith("auth/logout");

    if (response.status === 401 && !isAuthPath) {
        if (!refreshPromise) {
            refreshPromise = performRefresh();
        }
        const newAccessToken = await refreshPromise;
        if (newAccessToken) {
            headers.set("Authorization", `Bearer ${newAccessToken}`);
            try {
                response = await fetch(`${API_URL}/${path}`, {
                    ...options,
                    headers,
                });
            } catch {
                throw new Error(
                    "Cannot reach PixelZone server. Start the Spring Boot backend or check NEXT_PUBLIC_API_URL."
                );
            }
        } else {
            useAuthStore.getState().clearAuth();
        }
    }

    if (!response.ok) {
        let message = "An error occurred";

        if (response.status === 401) {
            useAuthStore.getState().clearAuth();
        }

        try {
            const body = await response.json();

            if (body?.message) {
                message = body.message;
            }
        } catch {
            // Response body is not JSON
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

// ==================== API ====================

export const api = {
    // ---- Auth ----
    register: (body: {
        email: string;
        password: string;
        displayName: string;
    }) =>
        request<AuthResponse>(
            "auth/register",
            {
                method: "POST",
                body: JSON.stringify(body),
            },
            false
        ),

    login: (body: {
        email: string;
        password: string;
    }) =>
        request<AuthResponse>(
            "auth/login",
            {
                method: "POST",
                body: JSON.stringify(body),
            },
            false
        ),

    refresh: (body: { refreshToken: string }) =>
        request<AuthResponse>(
            "auth/refresh",
            {
                method: "POST",
                body: JSON.stringify(body),
            },
            false
        ),

    logout: () => {
        const refreshToken = useAuthStore.getState().refreshToken;

        return request<void>(
            "auth/logout",
            {
                method: "POST",
                body: JSON.stringify({ refreshToken }),
            },
        );
    },

    me: () => request<User>("auth/me"),

    // ---- Photos ----
    getPhoto: (id: string) =>
        request<PhotoResponse>(`photo/${id}`),

    listPhotos: (params: {
        status?: PhotoStatus;
        page?: number;
        size?: number;
    } = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.set("status", params.status);
        if (params.page !== undefined) searchParams.set("page", String(params.page));
        if (params.size !== undefined) searchParams.set("size", String(params.size));
        const qs = searchParams.toString();
        return request<PageResponse<PhotoResponse>>(`photos${qs ? `?${qs}` : ""}`);
    },

    uploadPhoto: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return request<PhotoResponse>("photo/upload", {
            method: "POST",
            body: formData,
        });
    },

    archivePhotos: (photoIds: string[]) =>
        request<void>("photos/archive", {
            method: "POST",
            body: JSON.stringify({ photoIds }),
        }),

    trashPhotos: (photoIds: string[]) =>
        request<void>("photos/trash", {
            method: "POST",
            body: JSON.stringify({ photoIds }),
        }),

    restorePhotos: (photoIds: string[]) =>
        request<void>("photos/restore", {
            method: "POST",
            body: JSON.stringify({ photoIds }),
        }),

    permanentDeletePhotos: (photoIds: string[]) =>
        request<void>("photos/delete-permanent", {
            method: "POST",
            body: JSON.stringify({ photoIds }),
        }),

    // ---- Library ----
    getStorageUsage: () =>
        request<StorageUsageResponse>("library/storage"),

    listImageKitAssets: () =>
        request<ImageKitAssetResponse[]>("library/imagekit-assets"),

    importAssets: (imagekitFileIds: string[]) =>
        request<PhotoResponse[]>("library/import", {
            method: "POST",
            body: JSON.stringify({ imagekitFileIds }),
        }),

    // ---- Albums ----
    listAlbums: () =>
        request<AlbumResponse[]>("albums"),

    createAlbum: (body: { title: string }) =>
        request<AlbumResponse>("albums", {
            method: "POST",
            body: JSON.stringify(body),
        }),

    getAlbum: (id: string) =>
        request<AlbumResponse>(`albums/${id}`),

    getAlbumPhotos: (id: string, params: { page?: number; size?: number } = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page !== undefined) searchParams.set("page", String(params.page));
        if (params.size !== undefined) searchParams.set("size", String(params.size));
        const qs = searchParams.toString();
        return request<PageResponse<PhotoResponse>>(`albums/${id}/photos${qs ? `?${qs}` : ""}`);
    },

    updateAlbum: (id: string, body: { title: string }) =>
        request<AlbumResponse>(`albums/${id}`, {
            method: "PATCH",
            body: JSON.stringify(body),
        }),

    deleteAlbum: (id: string) =>
        request<void>(`albums/${id}`, { method: "DELETE" }),

    addPhotosToAlbum: (albumId: string, photoIds: string[]) =>
        request<void>(`albums/${albumId}/photos`, {
            method: "POST",
            body: JSON.stringify({ photoIds }),
        }),

    removePhotoFromAlbum: (albumId: string, photoId: string) =>
        request<void>(`albums/${albumId}/photos/${photoId}`, {
            method: "DELETE",
        }),

    // ---- AI ----
    aiPreview: (photoId: string, body: AiTransformRequest) =>
        request<AiTransformPreviewResponse>(`photos/${photoId}/ai/preview`, {
            method: "POST",
            body: JSON.stringify(body),
        }),

    aiApply: (photoId: string, body: AiTransformRequest) =>
        request<PhotoResponse>(`photos/${photoId}/ai/apply`, {
            method: "POST",
            body: JSON.stringify(body),
        }),
};