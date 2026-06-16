import React from "react";

const PrimaryGradientButton = ({ buttonName, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full
        py-3
        rounded-lg
        text-sm
        font-semibold
        text-white
        bg-gradient-to-r from-[#1BF0FF] to-[#144DFB]
        hover:opacity-90
        active:scale-[0.98]
        transition-all
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
      `}
    >
      {buttonName}
    </button>
  );
};

export default PrimaryGradientButton;
