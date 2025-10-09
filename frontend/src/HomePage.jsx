import React from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'

const HomePage = () => {
  return (
    <div className='flex-grow'>
        <Navbar />
        <HeroSection />
    </div>
  )
}

export default HomePage
