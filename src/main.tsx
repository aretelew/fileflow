import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './pages/Home.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "@/pages/Login.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <Routes>
              <Route path='/' element={<Home />} />
              {/*<ProtectedRoute path='/team' element={<Team />} />*/}
          </Routes>
      </BrowserRouter>
  </StrictMode>,
)
