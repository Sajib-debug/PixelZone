export const authKeys = {
    all: ["auth"] as const,
    me: () => [...authKeys.all, "me"] as const,
};

export const photoKeys = {
    all: ["photos"] as const,
    lists: () => [...photoKeys.all, "list"] as const,
    list: (params: { status?: string; page?: number; size?: number }) =>
        [...photoKeys.lists(), params] as const,
    details: () => [...photoKeys.all, "detail"] as const,
    detail: (id: string) => [...photoKeys.details(), id] as const,
};

export const albumKeys = {
    all: ["albums"] as const,
    lists: () => [...albumKeys.all, "list"] as const,
    detail: (id: string) => [...albumKeys.all, "detail", id] as const,
    photos: (id: string, params?: { page?: number; size?: number }) =>
        [...albumKeys.detail(id), "photos", params] as const,
};

export const libraryKeys = {
    all: ["library"] as const,
    storage: () => [...libraryKeys.all, "storage"] as const,
    imagekitAssets: () => [...libraryKeys.all, "imagekit-assets"] as const,
};