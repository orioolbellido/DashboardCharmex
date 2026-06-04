"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { MonitorPlay, LayoutDashboard, Package, Cpu, BookOpen, TerminalSquare, Settings } from "lucide-react"

// Items de menú basados en los módulos del prompt
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Inventario",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Configurador 3D",
    url: "/configurator",
    icon: MonitorPlay,
  },
  {
    title: "Firmware",
    url: "/firmware",
    icon: Cpu,
  },
  {
    title: "Soporte y KB",
    url: "/support",
    icon: BookOpen,
  }
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <MonitorPlay className="w-8 h-8 text-brand-novastar" />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-foreground">AV/IT Copilot</span>
            <span className="text-xs text-muted-foreground">Gestión de Señal</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-mono text-muted-foreground">MÓDULOS PRINCIPALES</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => window.location.href = item.url} className="hover:bg-accent/50 hover:text-foreground">
                    <item.icon className="text-brand-pixelhue" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
