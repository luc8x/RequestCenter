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
          <img src="/logo.png" alt="Logo Request Center" className="w-10 h-10" />
          <span className="text-sm font-semibold text-green-500">REQUEST<br/>CENTER</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <hr className="mx-5"/>
        <SidebarGroup>
          <SidebarGroupLabel style={{ color: '#5FD93D' }}>Abas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="text-white">
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon color="#5FD93D" />
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