import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/login'
import Register from './pages/auth/register'
import Dashboard from './pages/admin/dashboard'
import Artiste from './pages/artiste/artiste'

import {Button} from '@/components/ui/button'
const App = () => {



  return (
   <BrowserRouter>  
   <Routes>
    <Route path='/admin' element={<Dashboard />} />
    <Route path='/login' element={<Login />} />
    <Route path='/register' element={<Register/>} />
    <Route path='/artiste' element={<Artiste/>} />
   </Routes>
   
   </BrowserRouter>

  )
}

export default App
