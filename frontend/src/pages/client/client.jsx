import { Outlet } from "react-router-dom"
import Navbar from "./navbar"
import Dock from "./dock"

const client = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background p-2">
      <Navbar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      <div className="  z-50">
        <Dock />
      </div>
    </div>
  )
}

export default client
