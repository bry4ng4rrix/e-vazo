import React, { useState } from "react";
import {Home,Users,Star,Workflow,Bell,Settings,LogOut,Sun,Moon,} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const menuItems = [
    { label: "Acceuil",link : "artiste" , icon: <Home /> },
    { label: "Profile",link : "artiste/profile" , icon: <Users /> },
    { label: "Musiques",link : "artiste/musique" , icon: <Workflow /> },
    { label: "Settings",link : "" , icon: <Settings /> },
  ];

  return (
    <TooltipProvider>
      <div
        className={`h-screen border-r bg-muted/40 flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-48"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {!isCollapsed && <span className="font-semibold">E-vazo</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? "→" : "←"}
          </Button>
        </div>

        {/* SEARCH */}
       

        {/* NAVIGATION */}
        <div className="flex flex-col gap-1 mt-2 flex-grow">
          {menuItems.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Link
                  to={`/${item.link}`}
                  className={`${isCollapsed ? "text-sm" : " "}  flex  items-center gap-3 p-3 justify-start w-full hover:bg-primary/10`}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t flex flex-col gap-2">
          

          <Button variant="outline" className="flex items-center gap-2 justify-start">
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Déconnexion</span>}
          </Button>

        
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;



