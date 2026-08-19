import React from "react";
import { GuestGuard } from "@/components/auth/guest-guard";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <GuestGuard>
            <div className="min-h-svh bg-gray-100">
                <div className="flex min-h-svh flex-col justify-center">
                    <div className="mx-auto w-full max-w-sm px-4">
                        {children}
                    </div>
                </div>
            </div>
        </GuestGuard>
    );
};

export default AuthLayout;