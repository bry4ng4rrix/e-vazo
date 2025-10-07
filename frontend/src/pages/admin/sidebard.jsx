"use client";

import * as React from "react";
import {
  Calendar,
  ChartBar,
  LayoutDashboard,
  Database,
  FileText,
  Folder,
  HelpCircle,
  Layers,
  List,
  Search,
  Settings,
  Users,
} from "lucide-react";


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "#", icon: LayoutDashboard },
    { title: "Lifecycle", url: "#", icon: List },
    { title: "Analytics", url: "#", icon: ChartBar },
    { title: "Projects", url: "#", icon: Folder },
    { title: "Team", url: "#", icon: Users },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: Layers,
      isActive: true,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
    {
      title: "Proposal",
      icon:  FileText,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
    {
      title: "Prompts",
      icon:  FileText,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
  ],
  navSecondary: [
    { title: "Settings", url: "#", icon: Settings },
    { title: "Get Help", url: "#", icon: HelpCircle },
    { title: "Search", url: "#", icon: Search },
  ],
  documents: [
    { name: "Data Library", url: "#", icon: Database },
    { name: "Reports", url: "#", icon:  FileText },
    { name: "Word Assistant", url: "#", icon: FileText },
  ],
};

export default function AppSidebar(props) {
  return (
    <SidebarProvider >
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                <a href="#" className="flex items-center gap-2">
                  <Layers size={20} />
                  <span className="text-base font-semibold">Acme Inc.</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="mb-6" label="Main">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="flex items-center gap-2">
                    <item.icon size={16} />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}  
          </SidebarMenu>
          
          
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu label="Secondary">
            {data.navSecondary.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="flex items-center gap-2">
                    <item.icon size={16} />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
