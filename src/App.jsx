import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Navbar from './components/navbar'
import AppRoutes from './routes/route'
import Footer from './components/footer'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Navbar/>
    <AppRoutes/>
    <Footer/>
    </>
  )
}

export default App
