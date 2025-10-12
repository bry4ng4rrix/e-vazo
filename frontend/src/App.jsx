import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/login'
import Register from './pages/auth/register'
import Dashboard from './pages/admin/dashboard'
import Artiste from './pages/artiste/layout'
import Aprofile from './pages/artiste/pages/profile'
import Amusique from './pages/artiste/pages/musique'
import Ahome from './pages/artiste/pages/home'

import {Button} from '@/components/ui/button'
const App = () => {



  return (
   <BrowserRouter>  
   <Routes>
    <Route path='/admin' element={<Dashboard />} />
    <Route path='/login' element={<Login />} />
    <Route path='/register' element={<Register/>} />


    <Route path='/artiste' element={<Artiste/>}>
      <Route path='' element={<Ahome/>} />
      <Route path='profile' element={<Aprofile/>} />
      <Route path='musique' element={<Amusique/>} />


    </Route>
   </Routes>
   
   </BrowserRouter>

  )
}

export default App
