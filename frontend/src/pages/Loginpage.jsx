import React from 'react'

const Loginpage = () => {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
        <div className='flex items-center gap-2'>
            <img src="/PR_icon.png" alt="PR icon" className='h-12 w-12' />
            <p className='font-bold text-xl'>MergeMind</p>
        </div>
        <div className='mt-10 p-8 border rounded-lg shadow-lg bg-white'>
            <h2 className='text-2xl font-bold mb-6'>Login</h2>
            <div className='flex items-center justify-center gap-4'>
                {/* From part */}

                <form className='flex flex-col gap-4'>
                <div className='flex flex-col'>
                    <label htmlFor="email" className='mb-2 font-semibold'>Email</label>
                    <input type="email" id="email" className='border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600' />
                </div>
                <div className='flex flex-col'>
                    <label htmlFor="password" className='mb-2 font-semibold'>Password</label>
                    <input type="password" id="password" className='border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600' />
                </div>
                <button type="submit" className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mt-4'>Login</button>
            </form>

                {/* Image part */}
                <div>
                    <img src="/Merge_Mind.jpg" alt="merger_mind" className='h-10 w-10'/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Loginpage
