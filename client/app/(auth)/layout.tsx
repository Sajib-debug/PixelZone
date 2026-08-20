import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { GuestGuard } from "@/components/auth/guest-guard";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <GuestGuard>
            <div className="min-h-svh bg-[radial-gradient(circle_at_top_right,#d9f1fb_0,transparent_36%),linear-gradient(135deg,#f9fcff_0%,#fdf6f9_100%)] text-foreground">
                <div className="mx-auto flex w-full max-w-6xl justify-between px-6 py-6">
                    <Link href="/" className="group inline-flex items-center gap-2 text-sm font-semibold text-[#10264b] transition-colors hover:text-[#3d85aa]">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                        Back to home
                    </Link>
                    <Link href="/" aria-label="PixelZone home" className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-[#10264b]">
                            <Image src="/logo.png" alt="PixelZone logo" width={36} height={36} className="scale-[2.2] object-contain" />
                        </span>
                        <span className="text-sm font-semibold text-[#10264b]">PixelZone</span>
                    </Link>
                </div>
                <div className="flex min-h-[calc(100svh-88px)] flex-col justify-center">
                    <div className="mx-auto w-full max-w-sm px-4">
                        {children}
                    </div>
                </div>
            </div>
        </GuestGuard>
    );
};

export default AuthLayout;