"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Image as ImageIcon, Folder, Archive, Trash2, LogOut, UserRound } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useCurrentUser, useLogout } from "@/hooks/use-auth"
import { Spinner } from "@/components/ui/spinner"

export function SidebarNav() {
  const pathname = usePathname()
  const { data: user } = useCurrentUser()
  const { mutate: logout, isPending: loggingOut } = useLogout()

  const navItems = [
    {
      title: "Photos",
      url: "/photos",
      icon: ImageIcon,
    },
    {
      title: "Albums",
      url: "/albums",
      icon: Folder,
    },
    {
      title: "Archive",
      url: "/archive",
      icon: Archive,
    },
    {
      title: "Trash",
      url: "/trash",
      icon: Trash2,
    },
  ]

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex w-full items-center gap-2.5 font-semibold">
          <div className="relative size-9 shrink-0 overflow-hidden rounded-lg">
            <Image src="/brand-mark.svg" alt="PixelZone logo mark" width={36} height={36} className="size-full object-contain" />
          </div>
          <span className="text-lg font-bold tracking-tight">PixelZone</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname?.startsWith(item.url)}
                  >
                    <item.icon className="mr-2 size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/profile" />}
                  isActive={pathname === "/profile"}
                >
                  <UserRound className="mr-2 size-4" />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between p-2 border-t">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="size-7 shrink-0">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            {user && (
              <Link href="/profile" className="min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <p className="text-xs font-medium truncate">{user.displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => logout()}
              disabled={loggingOut}
              title="Logout"
            >
              {loggingOut ? <Spinner className="size-4" /> : <LogOut className="size-4" />}
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
