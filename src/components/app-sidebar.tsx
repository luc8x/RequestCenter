import Image from 'next/image'

import { Home, Inbox } from "lucide-react"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Início",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Solicitações",
    url: "/solicitacao",
    icon: Inbox,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-4 p-2">
          <Image alt="Logo" src="/logo.png" width={5} height={5} />
          <span className="text-sm font-semibold rainbow-text">REQUEST CENTER</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <hr className="mx-5"/>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-200">Abas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="text-white">
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon color="#DFE7EB"/>
                      <span>{item.title}</span>
                    </a>
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