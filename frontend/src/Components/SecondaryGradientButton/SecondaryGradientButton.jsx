import React from 'react'

const SecondaryGradientButton = ({buttonName,onClick}) => {
    return (
        <div  onClick={onClick}  className="inline-flex items-center justify-center px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap border-1 border-[#2FA4FF]
text-white">{buttonName}</div>
    )
}

export default SecondaryGradientButton