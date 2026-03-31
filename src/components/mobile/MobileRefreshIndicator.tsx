import React, { useState, useRef, useCallback, useEffect } from 'react';

interface MobileRefreshIndicatorProps {
  isRefreshing: boolean;
  progress?: number;
  message?: string;
}

const MobileRefreshIndicator: React.FC<MobileRefreshIndicatorProps> = ({
  isRefreshing,
  progress = 0,
  message = 'Actualizando...',
}) => {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'pulling' | 'refreshing'>('idle');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRefreshing) {
      setAnimationPhase('refreshing');
    } else if (progress > 0) {
      setAnimationPhase('pulling');
    } else {
      setAnimationPhase('idle');
    }
  }, [isRefreshing, progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 48;
    canvas.width = size;
    canvas.height = size;

    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const radius = 18;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 3;
      ctx.stroke();

      if (animationPhase === 'refreshing') {
        angle += 0.15;

        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(0.5, '#a78bfa');
        gradient.addColorStop(1, '#3b82f6');

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, angle, angle + Math.PI * 1.5);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 6, angle + Math.PI, angle + Math.PI * 0.5);
        ctx.strokeStyle = '#00e676';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        for (let i = 0; i < 3; i++) {
          const sparkAngle = angle + (i * Math.PI * 2) / 3;
          const sparkX = centerX + Math.cos(sparkAngle) * (radius + 8);
          const sparkY = centerY + Math.sin(sparkAngle) * (radius + 8);
          const sparkSize = 2 + Math.sin(angle * 2 + i) * 1;

          ctx.beginPath();
          ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#3b82f6' : '#00e676';
          ctx.fill();
        }
      } else if (animationPhase === 'pulling') {
        const pullAngle = -Math.PI / 2 + (progress * Math.PI * 2);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, pullAngle);
        ctx.strokeStyle = progress >= 1 ? '#00e676' : '#3b82f6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        const arrowX = centerX + Math.cos(pullAngle) * radius;
        const arrowY = centerY + Math.sin(pullAngle) * radius;
        
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(pullAngle + Math.PI / 2);
        
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(4, 2);
        ctx.lineTo(-4, 2);
        ctx.closePath();
        ctx.fillStyle = progress >= 1 ? '#00e676' : '#3b82f6';
        ctx.fill();
        
        ctx.restore();
      } else {
        const pulse = Math.sin(Date.now() / 500) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59, 130, 246, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animationPhase, progress]);

  if (animationPhase === 'idle') return null;

  return (
    <div className="md:hidden fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="glass bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl">
        <canvas
          ref={canvasRef}
          className="w-12 h-12"
        />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">
            {animationPhase === 'refreshing' ? message : 'Desliza para actualizar'}
          </span>
          {animationPhase === 'pulling' && (
            <span className="text-xs text-gray-400">
              {progress >= 1 ? '¡Suelta ahora!' : `${Math.round(progress * 100)}%`}
            </span>
          )}
          {animationPhase === 'refreshing' && (
            <div className="flex items-center gap-1 mt-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileRefreshIndicator;
