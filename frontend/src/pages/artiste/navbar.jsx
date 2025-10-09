"use client"

import React, { useState } from "react"

import {Link} from "react-router-dom" // ou "next/link" si tu es sur Next.js
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sun, Moon } from "lucide-react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const Navbar = () => {
  const [theme, setTheme] = React.useState("light")

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
    document.documentElement.classList.toggle("dark")
  }


  return (
    <header className="w-full border-b bg-card shadow-md sticky top-0 z-50">
      <div className=" mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
         
          <span className="font-bold text-lg">E vazo</span>
        </div>

        {/* Navigation Menu */}
       

        {/* Actions: Theme switch + profile */}
        <div className="flex items-center">
          {/* Theme switch */}
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="p-2 rounded-full"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>

          {/* Avatar */}
          <Avatar>
            <AvatarImage src="/avatar.jpg" alt="Profil" />
          </Avatar>
        </div>
      </div>
    </header>
  )
}

export default Navbar
