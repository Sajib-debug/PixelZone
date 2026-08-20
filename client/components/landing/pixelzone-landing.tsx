"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Archive, FolderOpen, HardDrive, Images, LockKeyhole, Sparkles, Trash2, WandSparkles } from "lucide-react";

const productAreas = [
  {
    icon: Images,
    title: "Photos, in focus",
    description: "Keep your personal photo library close, clear, and easy to browse.",
  },
  {
    icon: Archive,
    title: "Organized by you",
    description: "Use albums and archive tools to give every memory its place.",
  },
  {
    icon: LockKeyhole,
    title: "Your private space",
    description: "A focused home for the images and collections that matter to you.",
  },
];

const showcasePhotos = [
  { src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85", alt: "Mountain landscape", className: "col-span-2 row-span-2" },
  { src: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=700&q=85", alt: "Coastal village", className: "" },
  { src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=700&q=85", alt: "Forest path", className: "" },
  { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85", alt: "Warm evening landscape", className: "col-span-2" },
];

export function PixelZoneLanding() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#f8fbff] text-[#101b35]">
      <div className="relative isolate bg-[linear-gradient(rgba(16,38,75,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(16,38,75,0.035)_1px,transparent_1px)] bg-[size:32px_32px]">

        <div className="pointer-events-none absolute right-6 top-24 hidden items-center gap-3 rounded-full border border-[#10264b]/10 bg-white/60 px-3 py-2 opacity-[0.34] shadow-sm backdrop-blur-[2px] sm:flex lg:right-12" aria-hidden="true">
          <span className="flex size-8 items-center justify-center overflow-hidden rounded-lg bg-[#10264b] dark:bg-[#d8edf7]">
            <Image src="/brand-mark.svg" alt="" width={36} height={36} className="size-full object-contain" />
          </span>
          <span className="text-xs font-bold tracking-[0.16em] text-[#10264b] dark:text-[#d8edf7]">PIXELZONE</span>
        </div>

        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-10" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-3" aria-label="PixelZone home">
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-[0_8px_24px_rgba(16,38,75,0.18)] sm:size-11">
              <Image src="/brand-mark.svg" alt="PixelZone logo mark" width={44} height={44} className="size-full object-contain" priority />
            </span>
            <span className="text-[17px] font-semibold tracking-[-0.025em] text-[#10264b]">PixelZone</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-5">
            <a href="#about" className="hidden text-sm font-medium text-[#52617c] transition-colors hover:text-[#10264b] sm:inline-flex">
              About
            </a>
            <Link href="/login" className="px-2 py-2 text-sm font-medium text-[#52617c] transition-colors hover:text-[#10264b] sm:px-3">
              Login
            </Link>
            <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-[#10264b] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(16,38,75,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-[#193867]">
              <span className="hidden sm:inline">Get started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </nav>

        <section className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pb-20 pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:pb-28 lg:pt-20">
          <div className="max-w-xl animate-[fade-up_0.7s_ease-out_both]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b9dff2] bg-white/75 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#27658c] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#e68aa9]" aria-hidden="true" />
              Your personal photo space
            </div>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-[#10264b] sm:text-7xl">
              Memories deserve a place that feels like yours.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-[#52617c] sm:text-lg">
              PixelZone brings your photos, albums, archive, and transformations into one calm, beautifully organized space.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-[#10264b] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(16,38,75,0.2)] transition-transform hover:-translate-y-0.5 hover:bg-[#193867]">
                Create your space
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/login" className="rounded-lg border border-[#c9d6e4] bg-white px-5 py-3.5 text-sm font-semibold text-[#10264b] transition-colors hover:border-[#8bb9d7] hover:bg-[#f0f8fd]">
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative min-h-[25rem] animate-[fade-up_0.8s_0.1s_ease-out_both] sm:min-h-[31rem]">
            <div className="absolute inset-x-5 top-5 bottom-0 rounded-[2rem] bg-[#10264b] shadow-[0_24px_70px_rgba(16,38,75,0.24)] sm:inset-x-12" />
            <div className="absolute inset-x-0 top-0 rounded-[2rem] border border-white/80 bg-white p-3 shadow-[0_18px_50px_rgba(55,101,135,0.2)] sm:p-5">
              <div className="flex items-center justify-between border-b border-[#e6edf4] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-[#10264b]">
                    <Image src="/brand-mark.svg" alt="" width={32} height={32} className="h-full w-full object-contain" />
                  </span>
                  <span className="text-sm font-semibold text-[#10264b]">My PixelZone</span>
                </div>
                <span className="rounded-full bg-[#eef8fc] px-3 py-1 text-[11px] font-semibold text-[#27658c]">Private library</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 pt-4 sm:gap-3">
                {showcasePhotos.slice(0, 3).map((photo) => (
                  <div key={photo.src} className="relative aspect-[1.1] overflow-hidden rounded-xl">
                    <Image src={photo.src} alt="" fill sizes="(max-width: 640px) 30vw, 180px" className="object-cover" unoptimized />
                  </div>
                ))}
                <div className="relative col-span-2 aspect-[2.1] overflow-hidden rounded-xl">
                  <Image src={showcasePhotos[3].src} alt="" fill sizes="(max-width: 640px) 60vw, 360px" className="object-cover" unoptimized />
                </div>
                <div className="flex aspect-square items-center justify-center rounded-xl bg-[#e7f3f8] text-[#5599c2]">
                  <Images className="h-7 w-7" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f5f9fc] px-3.5 py-3">
                <div>
                  <p className="text-xs font-semibold text-[#10264b]">A space for every story</p>
                  <p className="mt-1 text-[11px] text-[#718198]">Photos · Albums · Archive</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#5599c2]" aria-hidden="true" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-2 flex items-center gap-2 rounded-xl border border-[#f0d1db] bg-white px-3.5 py-3 shadow-[0_12px_35px_rgba(84,112,135,0.18)] sm:-left-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff0f4] text-[#d87599]"><Trash2 className="h-4 w-4" aria-hidden="true" /></span>
              <span className="text-xs font-semibold text-[#10264b]">Organized your way</span>
            </div>
          </div>
        </section>
      </div>

      <section className="border-y border-[#e2edf3] bg-white/75">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">
          <div className="relative grid min-h-[22rem] grid-cols-3 grid-rows-3 gap-2.5 sm:min-h-[28rem] sm:gap-3">
            {showcasePhotos.map((photo) => (
              <div key={photo.src} className={`relative overflow-hidden rounded-xl border border-white shadow-[0_10px_30px_rgba(38,83,112,0.12)] ${photo.className}`}>
                <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 1024px) 90vw, 540px" className="object-cover transition-transform duration-500 hover:scale-105" unoptimized />
              </div>
            ))}
            <div className="absolute -bottom-3 right-4 flex items-center gap-2 rounded-xl border border-[#d8eaf3] bg-white px-3.5 py-3 shadow-[0_12px_35px_rgba(84,112,135,0.16)] sm:right-8">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff0f4] text-[#d87599]"><WandSparkles className="h-4 w-4" aria-hidden="true" /></span>
              <span className="text-xs font-semibold text-[#10264b]">Transform a favorite</span>
            </div>
          </div>
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5599c2]">See the whole picture</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#10264b] sm:text-4xl">One calm workspace for every part of your library.</h2>
            <p className="mt-5 text-base leading-7 text-[#66758b]">Browse your photos, group them into albums, keep everyday views tidy with Archive, and recover or permanently remove items from Trash.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3"><FolderOpen className="mt-0.5 h-5 w-5 shrink-0 text-[#5599c2]" aria-hidden="true" /><div><p className="text-sm font-semibold text-[#10264b]">Albums that stay clear</p><p className="mt-1 text-xs leading-5 text-[#718198]">Group moments into collections you can revisit.</p></div></div>
              <div className="flex gap-3"><HardDrive className="mt-0.5 h-5 w-5 shrink-0 text-[#d87599]" aria-hidden="true" /><div><p className="text-sm font-semibold text-[#10264b]">Storage at a glance</p><p className="mt-1 text-xs leading-5 text-[#718198]">See the usage and photo count from your library.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-y border-[#e2edf3] bg-white/80">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5599c2]">A simpler way to remember</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#10264b] sm:text-4xl">Everything you need to keep your photo life in order.</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {productAreas.map((area) => {
              const Icon = area.icon;
              return (
                <article key={area.title} className="border-t-2 border-[#c5e5f3] pt-5">
                  <Icon className="h-5 w-5 text-[#5599c2]" aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-semibold text-[#10264b]">{area.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#66758b]">{area.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="flex flex-col items-start justify-between gap-8 rounded-2xl bg-[#10264b] px-7 py-9 text-white shadow-[0_20px_55px_rgba(16,38,75,0.18)] sm:flex-row sm:items-center sm:px-10">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.04em]">Ready to make room for your memories?</p>
            <p className="mt-2 text-sm text-[#c6d9ea]">Start with a personal photo space that stays beautifully simple.</p>
          </div>
          <Link href="/register" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#f2b8ca] px-5 py-3 text-sm font-semibold text-[#10264b] transition-colors hover:bg-[#f8cad8]">
            Get started
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e2edf3] bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-7 text-sm text-[#66758b] sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div>
            <p className="font-semibold text-[#10264b]">PixelZone</p>
            <p className="mt-1 text-xs">Your personal photo space.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <a href="#about" className="transition-colors hover:text-[#10264b]">About</a>
            <Link href="/login" className="transition-colors hover:text-[#10264b]">Login</Link>
            <Link href="/register" className="transition-colors hover:text-[#10264b]">Register</Link>
          </div>
          <p className="text-xs">© 2026 PixelZone</p>
        </div>
      </footer>
    </main>
  );
}
