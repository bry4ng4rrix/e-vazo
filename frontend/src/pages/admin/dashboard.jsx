import React from 'react'
import { Button } from '@/components/ui/button'
import Sidebard from './sidebard'
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
const dashboard = () => {
  return (
    <div className="p-3 min-h-screen ">
      
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        }}
      >
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic, magni! Natus aspernatur fugiat ad id facilis nobis optio nihil ab, unde impedit fugit non distinctio eaque dolorum veritatis, a reprehenderit.
        <Sidebard variant="inset" />
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sed, delectus enim? Aut neque, laborum aperiam reiciendis excepturi eligendi nulla numquam sit obcaecati quia facere aliquam cum nobis officiis consectetur unde.
        <SidebarInset>
          
          <div className="flex flex-1 flex-col">
            
            <div className="@container/main flex flex-1 flex-col gap-2">
            
            </div>
          </div>
          
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default dashboard

