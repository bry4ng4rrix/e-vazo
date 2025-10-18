import { Outlet } from "react-router-dom"
import Navbar from "./navbar"
import Dock from "./dock"

const client = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background p-2">
      <Navbar />

      {/* Main content */}
     
        <Outlet />
     

    
    </div>
  )
}

export default client
