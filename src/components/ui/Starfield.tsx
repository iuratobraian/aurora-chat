import React from 'react';

interface StarfieldProps {
  count?: number;
  speed?: 'slow' | 'medium' | 'fast';
  className?: string;
}

const speedMap = {
  slow: 60,
  medium: 40,
  fast: 20,
};

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDuration: number;
  animationDelay: number;
}

const generateStars = (count: number, speed: number): Star[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.7 + 0.3,
    animationDuration: Math.random() * speed + speed / 2,
    animationDelay: Math.random() * 5,
  }));
};

export const Starfield: React.FC<StarfieldProps> = ({
  count = 50,
  speed = 'medium',
  className = '',
}) => {
  const [stars] = React.useState(() => generateStars(count, speedMap[speed]));

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.animationDuration}s`,
            animationDelay: `${star.animationDelay}s`,
          }}
        />
      ))}
    </div>
  );
};
