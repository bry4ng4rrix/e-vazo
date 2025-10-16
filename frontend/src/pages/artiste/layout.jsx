import React from 'react'
import Dock from './dock'
import Navbar from './navbar'
import { Outlet } from 'react-router-dom'
const artiste = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      
     
        <main className="flex-1  overflow-y-auto">
           <Navbar/>
           
          <Outlet/>
        </main>
     <div className='sticky bottom-0'>
      <Dock/>
     </div>
    </div>
  )
}

export default artiste
