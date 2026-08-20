"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthResponse, User } from "@/lib/api";

type AuthState = {
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
    isReady: boolean;

    setAuth: (auth: AuthResponse) => void;
    clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            isReady: false,

            setAuth: (auth) =>
                set({
                    accessToken: auth.accessToken,
                    refreshToken: auth.refreshToken,
                    user: auth.user ?? null,
                }),

            clearAuth: () =>
                set({
                    accessToken: null,
                    refreshToken: null,
                    user: null,
                }),
        }),
        {
            name: "pz-auth",

            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                user: state.user,
            }),

            onRehydrateStorage: () => () => {
                useAuthStore.setState({
                    isReady: true,
                });
            },
        }
    )
);