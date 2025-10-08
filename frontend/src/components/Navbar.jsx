import React from 'react'
import { useNavigate } from 'react-router'

const Navbar = () => {

    const navigate = useNavigate();

  return (
    <div className='h-20 w-full border-b-2 flex items-center justify-around'>
        <div className='flex items-center gap-2'>
            <img src="/PR_icon.png" alt="logo" className='h-12 w-12'/>
            <p className='font-bold text-xl'>MergeMind</p>
        </div>
        <div className='flex items-center gap-16'>
            <p>Features</p>
            <p>Docs</p>
        </div>
        <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition' onClick={() => {
            navigate("/login");
        }}>
            Get Started
        </button>
    </div>
  )
}

export default Navbar
