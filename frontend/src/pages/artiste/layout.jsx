import React from 'react'
import Sidebar from './sidebar'
import Navbar from './navbar'
import { Outlet } from 'react-router-dom'
const artiste = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex flex-1">
         
         
       
        {/* Sidebar */}
        <aside >
          <Sidebar />
        </aside>
       
        {/* Main content */}
        <main className="flex-1  overflow-y-auto">
           <Navbar/>
          <Outlet/>
        </main>
      </div>
    </div>
  )
}

export default artiste
