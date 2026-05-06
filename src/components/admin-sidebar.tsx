"use client"

import { Bus, MapPin, Route, CalendarClock, DollarSign, LayoutDashboard, Settings, FileText, UserCog } from "lucide-react"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"

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
import { Button } from "@/components/ui/button"

const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Transportations",
    url: "/admin/transportations",
    icon: Bus,
  },
  {
    title: "Stops",
    url: "/admin/stops",
    icon: MapPin,
  },
  {
    title: "Routes",
    url: "/admin/routes",
    icon: Route,
  },
  {
    title: "Schedules",
    url: "/admin/schedules",
    icon: CalendarClock,
  },
  {
    title: "Fares",
    url: "/admin/fares",
    icon: DollarSign,
  },
  {
    title: "Pengguna",
    url: "/admin/users",
    icon: UserCog,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="bg-white border-r border-slate-200">
      <SidebarHeader className="flex h-16 items-center justify-start px-4 border-b border-slate-100 bg-white">
        <Logo textSize="text-lg" iconSize={24} />
      </SidebarHeader>
      <SidebarContent className="bg-white px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      isActive={isActive}
                      className={`h-11 px-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? "bg-[#E3F2FD] text-[#0F172A] font-semibold hover:bg-[#E3F2FD]" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]"
                      }`}
                    >
                      <a href={item.url} className="flex items-center gap-3">
                        <item.icon className={`h-5 w-5 ${isActive ? "text-[#0053db]" : "text-slate-400"}`} />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-white p-4 border-t border-slate-100">
        <Button 
          className="w-full h-12 rounded-xl bg-[#E3F2FD] hover:bg-[#bbdefb] text-[#0053db] font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
          onClick={() => {
            window.print()
          }}
        >
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
