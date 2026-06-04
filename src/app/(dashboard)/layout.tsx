import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-hidden flex flex-col bg-background text-foreground">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-card px-6">
          <SidebarTrigger />
          <div className="w-full flex-1">
            <h1 className="font-semibold text-lg">Charmex · Gestión de Señal</h1>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
