import React, { useMemo, memo } from 'react';

interface MiniChartProps {
  data: number[];
  color: string;
}

const MiniChart: React.FC<MiniChartProps> = memo(({ data, color }) => {
  const width = 120;
  const height = 40;
  
  const { min, max, range, points } = useMemo(() => {
    if (data.length === 0) {
      return { min: 0, max: 1, range: 1, points: '' };
    }
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const rangeVal = maxVal - minVal || 1;
    
    const pts = data.map((val, index) => {
      const x = (index / (data.length - 1 || 1)) * width;
      const y = height - ((val - minVal) / rangeVal) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return { min: minVal, max: maxVal, range: rangeVal, points: pts };
  }, [data]);

  if (!points) {
    return <svg width={width} height={height} />;
  }

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

MiniChart.displayName = 'MiniChart';

export default MiniChart;
