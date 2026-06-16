import React from 'react'
import GoogleLogo from "../../assets/Images/GoogleLogo.png"
const SignUpWithGoogle = () => {
  return (
    <div className='h-10 w-80 p-2 rounded-lg bg-white border-2 border-white flex justify-center items-center gap-2 hover:bg-gray-200'>
        <img src={GoogleLogo} alt="GG" className='h-5 w-5' />
        <p className='font-semibold text-gray-800'>Sign up with Google</p>
    </div>
  )
}

export default SignUpWithGoogle