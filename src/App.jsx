import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Navbar from './components/navbar'
import AppRoutes from './routes/route'
import Footer from './components/footer'
import './App.css'
import { ToastContainer } from 'react-toastify'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Navbar/>
    <ToastContainer />
    <AppRoutes/>
    <Footer/>
    </>
  )
}

export default App
