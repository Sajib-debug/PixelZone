"use client";

import { useState, useEffect } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type {
    LoginFormValues,
    RegisterFormValues,
} from "@/lib/validation/auth";
import { useAuthStore } from "@/stores/auth-store";
import { authKeys } from "@/lib/query-keys";


// ==================== Current User ====================

export function useCurrentUser() {
    const accessToken = useAuthStore(
        (state) => state.accessToken
    );

    const cachedUser = useAuthStore(
        (state) => state.user
    );

    return useQuery({
        queryKey: authKeys.me(),

        queryFn: () => api.me(),

        enabled: !!accessToken,

        initialData: cachedUser ?? undefined,

        staleTime: 1000 * 60 * 5,
    });
}


// ==================== Login ====================

export function useLogin() {
    const setAuth = useAuthStore(
        (state) => state.setAuth
    );

    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (values: LoginFormValues) =>
            api.login(values),

        onSuccess: (data) => {
            // Save access token, refresh token and user
            setAuth(data);

            // Update current-user cache
            queryClient.setQueryData(
                authKeys.me(),
                data.user
            );

            toast.success(
                `Welcome back, ${data.user.displayName}!`
            );

            router.replace("/");
        },

        onError: (error: Error) => {
            toast.error(
                error.message || "Login failed"
            );
        },
    });
}


// ==================== Register ====================

export function useRegister() {
    const setAuth = useAuthStore(
        (state) => state.setAuth
    );

    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (values: RegisterFormValues) =>
            api.register(values),

        onSuccess: (data) => {
            // Save authentication data
            setAuth(data);

            // Update current-user cache
            queryClient.setQueryData(
                authKeys.me(),
                data.user
            );

            toast.success(
                `Welcome, ${data.user.displayName}!`
            );

            router.replace("/");
        },

        onError: (error: Error) => {
            toast.error(
                error.message || "Registration failed"
            );
        },
    });
}


// ==================== Logout ====================

export function useLogout() {
    const clearAuth = useAuthStore(
        (state) => state.clearAuth
    );

    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: () => api.logout(),

        onSuccess: () => {
            // Clear Zustand auth state
            clearAuth();

            // Remove cached user
            queryClient.removeQueries({
                queryKey: authKeys.me(),
            });

            toast.success("Logged out successfully");

            router.replace("/login");
        },

        onError: (error: Error) => {
            toast.error(
                error.message || "Logout failed"
            );
        },
    });
}

export function useAuth() {
    const [mounted, setMounted] = useState(false);

    const accessToken = useAuthStore(
        (state) => state.accessToken
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    return {
        isReady: mounted,
        isLoggedIn: !!accessToken,
    };
}