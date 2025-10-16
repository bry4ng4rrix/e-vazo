import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/login'
import Register from './pages/auth/register'
import Dashboard from './pages/admin/dashboard'
import Artiste from './pages/artiste/layout'
import Aprofile from './pages/artiste/pages/profile'
import Amusique from './pages/artiste/pages/musique'
import Ahome from './pages/artiste/pages/home'

import Client from './pages/client/client'
import Cprofile from './pages/client/pages/profiles'
import Cdownload from './pages/client/pages/download'
import Cfavorit from './pages/client/pages/favorite'
import Chome from './pages/client/pages/home'
const App = () => {



  return (
   <BrowserRouter>  
   <Routes>
    <Route path='/admin' element={<Dashboard />} />
    <Route path='/login' element={<Login />} />
    <Route path='/register' element={<Register/>} />
    <Route path='' element={<Ahome/>} />


    <Route path='/artiste' element={<Artiste/>}>
     
      <Route path='profile' element={<Aprofile/>} />
      <Route path='musique' element={<Amusique/>} />


    </Route>

     <Route path='/client' element={<Client/>}>
      <Route path='' element={<Chome/>} />
      <Route path='profile' element={<Cprofile/>} />
      <Route path='download' element={<Cdownload/>} />
      <Route path='favorite' element={<Cfavorit/>} />


    </Route>


   </Routes>
   
   </BrowserRouter>

  )
}

export default App
