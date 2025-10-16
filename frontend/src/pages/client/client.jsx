import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './navbar'
import Dock  from './dock'
const client = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background p-2">
     
         
         
       
      
           <Navbar/>
           <Dock/>

    
       
        {/* Main content */}
        <main className="flex-1  overflow-y-auto">
         
          <Outlet/>
        </main>
     
    </div>
  )
}

export default client
