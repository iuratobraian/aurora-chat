import React from 'react';
import Lottie from 'lottie-react';

interface LottieAnimationProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({ 
  animationData, 
  loop = true, 
  autoplay = true, 
  className = "",
  style = {}
}) => {
  return (
    <div className={className} style={style}>
      <Lottie 
        animationData={animationData} 
        loop={loop} 
        autoplay={autoplay} 
      />
    </div>
  );
};
