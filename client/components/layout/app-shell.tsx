import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { SidebarNav } from "./sidebar-nav"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger />
          <div className="w-full flex-1">
            {/* Context-aware top actions could be placed here */}
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,#dff4fc_0,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#fffafd_100%)] p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
