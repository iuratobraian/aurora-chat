import React from 'react';

interface RainbowButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const RainbowButton: React.FC<RainbowButtonProps> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="relative group p-[2px] rounded-xl overflow-hidden transition-all active:scale-95"
    >
      <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#4fcf70_0%,#fad648_25%,#a767e5_50%,#12bcfe_75%,#4fcf70_100%)] group-hover:animate-[spin_1.5s_linear_infinite]" />
      <div className="relative flex items-center justify-center h-full w-full px-6 py-3 bg-black rounded-[10px] text-white text-sm font-bold uppercase tracking-widest">
        {children}
      </div>
    </button>
  );
};

export default RainbowButton;
