"use client";

import Link from "next/link";
import { ArrowLeft, HardDrive, Images, Mail, UserRound, FolderOpen, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-auth";
import { useAlbums } from "@/hooks/use-albums";
import { usePhotos, useStorageUsage } from "@/hooks/use-photos";

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: storage } = useStorageUsage();
  const { data: albums } = useAlbums();
  const { data: photos } = usePhotos("ACTIVE", 0, 1);
  const initials = user?.displayName
    ? user.displayName.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2)
    : "PZ";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/photos" className="inline-flex size-9 items-center justify-center rounded-full text-[#10264b] transition-colors hover:bg-[#e8f4fa] dark:text-white dark:hover:bg-white/10" aria-label="Back to photos">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <p className="text-sm font-medium text-[#5599c2]">Your account</p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#10264b] dark:text-white">Profile</h1>
        </div>
      </div>

      <Card className="overflow-hidden border-[#d8eaf3] bg-white/85 shadow-[0_18px_50px_rgba(38,83,112,0.1)] dark:border-white/10 dark:bg-[#172847]/90">
        <div className="h-28 bg-[linear-gradient(110deg,#10264b,#5599c2_58%,#f2b8ca)]" />
        <CardHeader className="relative -mt-12 flex flex-row items-end gap-4 px-6">
          <Avatar className="size-24 border-4 border-white bg-[#10264b] text-xl dark:border-[#172847]">
            <AvatarFallback className="bg-[#10264b] text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="pb-2">
            <CardTitle className="text-xl text-[#10264b] dark:text-white">{isLoading ? "Loading profile..." : user?.displayName || "PixelZone user"}</CardTitle>
            <p className="mt-1 text-sm text-[#66758b] dark:text-[#b6c8dc]">Personal PixelZone account</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 px-6 pb-7 pt-6 sm:grid-cols-2">
          <div className="rounded-xl border border-[#e2edf3] bg-[#f8fbff] p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5599c2]"><UserRound className="size-4" /> Display name</div>
            <p className="mt-3 text-base font-semibold text-[#10264b] dark:text-white">{user?.displayName || "Not available"}</p>
          </div>
          <div className="rounded-xl border border-[#e2edf3] bg-[#f8fbff] p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#d87599]"><Mail className="size-4" /> Email address</div>
            <p className="mt-3 break-all text-base font-semibold text-[#10264b] dark:text-white">{user?.email || "Not available"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#d8eaf3] bg-white/80 p-5 dark:border-white/10 dark:bg-[#172847]/80">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5599c2]"><Images className="size-4" /> Library</div>
          <p className="mt-4 text-2xl font-semibold text-[#10264b] dark:text-white">{storage?.libraryPhotoCount?.toLocaleString() ?? photos?.totalElements?.toLocaleString() ?? "—"}</p>
          <p className="mt-1 text-xs text-[#718198] dark:text-[#b6c8dc]">photos in your library</p>
        </div>
        <div className="rounded-2xl border border-[#d8eaf3] bg-white/80 p-5 dark:border-white/10 dark:bg-[#172847]/80">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5599c2]"><HardDrive className="size-4" /> Storage</div>
          <p className="mt-4 text-2xl font-semibold text-[#10264b] dark:text-white">{storage ? formatBytes(storage.libraryUsedBytes) : "—"}</p>
          <p className="mt-1 text-xs text-[#718198] dark:text-[#b6c8dc]">currently in use</p>
        </div>
        <div className="rounded-2xl border border-[#f0d1db] bg-[#fff8fa]/80 p-5 dark:border-white/10 dark:bg-[#172847]/80">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#d87599]"><FolderOpen className="size-4" /> Albums</div>
          <p className="mt-4 text-2xl font-semibold text-[#10264b] dark:text-white">{albums?.length.toLocaleString() ?? "—"}</p>
          <p className="mt-1 text-xs text-[#718198] dark:text-[#b6c8dc]">collections you created</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/photos" className="rounded-xl border border-[#d8eaf3] bg-white/75 p-5 transition-transform hover:-translate-y-0.5 hover:border-[#9fcde1] dark:border-white/10 dark:bg-[#172847]/70">
          <p className="text-sm font-semibold text-[#10264b] dark:text-white">Photo library</p>
          <p className="mt-1 text-xs leading-5 text-[#718198] dark:text-[#b6c8dc]">Browse and manage your photos.</p>
        </Link>
        <Link href="/albums" className="rounded-xl border border-[#d8eaf3] bg-white/75 p-5 transition-transform hover:-translate-y-0.5 hover:border-[#9fcde1] dark:border-white/10 dark:bg-[#172847]/70">
          <p className="text-sm font-semibold text-[#10264b] dark:text-white">Albums</p>
          <p className="mt-1 text-xs leading-5 text-[#718198] dark:text-[#b6c8dc]">Keep collections organized.</p>
        </Link>
        <Link href="/trash" className="rounded-xl border border-[#f0d1db] bg-[#fff8fa]/80 p-5 transition-transform hover:-translate-y-0.5 hover:border-[#e7a9bd] dark:border-white/10 dark:bg-[#172847]/70">
          <div className="flex items-center gap-2"><Trash2 className="size-4 text-[#d87599]" /><p className="text-sm font-semibold text-[#10264b] dark:text-white">Trash</p></div>
          <p className="mt-1 text-xs leading-5 text-[#718198] dark:text-[#b6c8dc]">Restore or permanently remove photos.</p>
        </Link>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
