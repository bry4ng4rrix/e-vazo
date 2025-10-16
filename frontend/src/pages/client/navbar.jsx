import React from 'react'
import { Card } from '@/components/ui/card'
import { Navbar01 } from '@/components/ui/shadcn-io/navbar-01';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from "lucide-react"
const navbar = () => {
  const [theme, setTheme] = React.useState("light")
  
    const toggleTheme = () => {
      setTheme(theme === "light" ? "dark" : "light")
      document.documentElement.classList.toggle("dark")
    }
  
  return (
    <Card className="sticky top-0 z-50 p-2 flex items-ceenter justify-between">
      <div className='justify-center items-center flex'>
        E-vazo
      </div>
      <div className='justify-center items-center flex gap-2'>
         <Button
            variant="ghost"
            onClick={toggleTheme}
            className="p-2 rounded-full"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
          <Button className="bg-green-500">Login</Button>
      </div>
  
  </Card>
  )
}

export default navbar
