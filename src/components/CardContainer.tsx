import React from 'react';

interface CardContainerProps {
  children: React.ReactNode;
}

const CardContainer: React.FC<CardContainerProps> = ({ children }) => {
  return (
    <div className="relative w-full h-full p-1 md:p-6 flex items-center justify-center overflow-hidden bg-[#0f1115]">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute -left-1/4 -top-1/4 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -right-1/4 -bottom-1/4 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Main Glass Card */}
      <div className="relative w-full h-full max-w-7xl bg-[#3d3c3d] rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col overflow-hidden">
        {/* Inner glow effect */}
        <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent" />
        
        {/* Decorative white blur spot from specs */}
        <div className="absolute -left-1/2 -top-1/2 w-56 h-48 bg-white/10 blur-[50px] pointer-events-none" />
        
        {/* Content */}
        <div className="relative flex-1 flex flex-col z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CardContainer;
