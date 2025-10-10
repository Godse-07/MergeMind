import React from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'

const HomePage = () => {
  return (
    <div className='flex-grow'>
        <Navbar />
        <div className='pt-20'>
          <HeroSection />
        </div>
    </div>
  )
}

export default HomePage
