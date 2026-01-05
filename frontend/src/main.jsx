import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router";
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import UserProvider from './context/UserProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <App />
        <Toaster />
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
