"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";

type AuthGuardProps = {
    children: React.ReactNode;
    redirectTo?: string;
};

export function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isReady, isLoggedIn } = useAuth();

    useEffect(() => {
        if (isReady && !isLoggedIn) {
            // Preserve the original path to redirect back after successful login
            const searchParams = new URLSearchParams();
            if (pathname && pathname !== "/" && !pathname.startsWith("/login") && !pathname.startsWith("/register")) {
                searchParams.set("redirectTo", pathname);
            }
            const queryString = searchParams.toString();
            const fullRedirectUrl = queryString ? `${redirectTo}?${queryString}` : redirectTo;

            router.replace(fullRedirectUrl);
        }
    }, [isReady, isLoggedIn, redirectTo, pathname, router]);

    // Show loading spinner while the auth state is being rehydrated from storage
    // or if we are redirecting the user to the login page.
    if (!isReady || !isLoggedIn) {
        return (
            <div className="flex min-h-svh items-center justify-center bg-background px-6">
                <div className="flex flex-col items-center gap-4">
                    <Spinner className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-center text-sm text-muted-foreground animate-pulse">
                        {!isReady ? "Restoring your session..." : "Redirecting to sign in..."}
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}