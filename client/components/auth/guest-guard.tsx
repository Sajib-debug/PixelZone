"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";

type GuestGuardProps = {
    children: React.ReactNode;
    redirectTo?: string;
};

function GuestGuardContent({ children, redirectTo = "/" }: GuestGuardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isReady, isLoggedIn } = useAuth();

    useEffect(() => {
        if (isReady && isLoggedIn) {
            // Check if there is a 'redirectTo' parameter in the query
            const destination = searchParams.get("redirectTo") || redirectTo;
            router.replace(destination);
        }
    }, [isReady, isLoggedIn, redirectTo, searchParams, router]);

    // Show loading spinner while the auth state is being rehydrated from storage
    // or if we are redirecting the user to the destination page.
    if (!isReady || isLoggedIn) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Spinner className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export function GuestGuard(props: GuestGuardProps) {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-4">
                        <Spinner className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground animate-pulse">
                            Loading...
                        </p>
                    </div>
                </div>
            }
        >
            <GuestGuardContent {...props} />
        </Suspense>
    );
}
