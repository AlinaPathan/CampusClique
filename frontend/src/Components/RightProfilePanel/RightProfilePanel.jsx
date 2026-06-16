import React from 'react'
import ProfilePic from "../../assets/GradientIcons/ProfilePic.png"
const RightProfilePanel = () => {
  return (
       <div className="relative w-[260px] h-[320px] rounded-xl border-3 border-[#34D399] overflow-hidden">
      
      {/* Top section */}
      <div className="h-[140px] bg-gradient-to-b from-[#1BF0FF] to-[#144DFB]"></div>

      {/* Center overlapping circle */}
      <div className="absolute top-[100px] left-1/2 -translate-x-1/2">
        <img src={ProfilePic} alt="PP" className='w-20 h-20 rounded-full' /></div>
      

      {/* Bottom section */}
      <div className="h-[220px]"></div>

    </div>
  )
}

export default RightProfilePanel