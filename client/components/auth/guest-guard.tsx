"use client";

import React, { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

type GuestGuardProps = {
    children: React.ReactNode;
    redirectTo?: string;
};

function GuestGuardContent({ children }: GuestGuardProps) {
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
