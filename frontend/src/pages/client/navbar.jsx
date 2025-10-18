import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button';
import { Sun, Moon } from "lucide-react"
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
const navbar = () => {
  const [theme, setTheme] = React.useState("light")
  
    const toggleTheme = () => {
      setTheme(theme === "light" ? "dark" : "light")
      document.documentElement.classList.toggle("dark")
    }

  
  
  return (
    <Card className="sticky top-0 z-50 p-2 flex items-ceenter justify-between">
      <div className='justify-center items-center flex space-x-2'>
        <div>
          logo
        </div>
        
        
  
      </div>
      <ul className='flex  gap-6 justify-center items-center'>
            <Link to="">Home</Link>
            <Link to="download">Musique</Link>
            <Link to="favorite"> Favorite</Link>
            <Link to="profile">Profiles</Link>
          </ul>
      <div className='justify-center items-center flex gap-2'>
         <Button
            variant="ghost"
            onClick={toggleTheme}
            className="p-2 rounded-full"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
         <Button className="bg-green-500"> <Link to="/login" >Login</Link></Button>
      </div>
  
  </Card>
  )
}

export default navbar
