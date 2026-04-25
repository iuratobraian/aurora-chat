import React from 'react';

interface CardContainerProps {
  children: React.ReactNode;
}

const CardContainer: React.FC<CardContainerProps> = ({ children }) => {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-background">
      {children}
    </div>
  );
};

export default CardContainer;
