/**
 * CacheBadge
 * 
 * Displays data freshness status with color-coded indicators.
 * Green: Fresh (< 5 min)
 * Yellow: Stale (5-15 min)
 * Red: Old (> 15 min)
 */

import React from 'react';
import { Icon } from './icons/Icon';
import { RESILIENCE_CONFIG } from '../config/resilience';

interface CacheBadgeProps {
  /** Timestamp of last update */
  lastUpdated: number | null;
  /** Optional refresh handler */
  onRefresh?: () => void;
  /** Stale threshold in ms (default: 5 min) */
  staleThreshold?: number;
  /** Additional CSS classes */
  className?: string;
}

export function CacheBadge({
  lastUpdated,
  onRefresh,
  staleThreshold = RESILIENCE_CONFIG.STALE_THRESHOLD,
  className = '',
}: CacheBadgeProps) {
  if (!lastUpdated) {
    return null;
  }

  const cacheAge = Date.now() - lastUpdated;
  const cacheAgeMinutes = Math.floor(cacheAge / 60000);

  // Determine status and styling
  let status: 'fresh' | 'stale' | 'old';
  let textColor: string;
  let icon: string;
  let label: string;

  if (cacheAge < staleThreshold) {
    // Fresh: < 5 min - Green
    status = 'fresh';
    textColor = 'text-green-400';
    icon = 'check_circle';
    
    if (cacheAge < 60000) {
      label = 'Actualizado ahora';
    } else {
      label = `Hace ${cacheAgeMinutes} min`;
    }
  } else if (cacheAge < 15 * 60 * 1000) {
    // Stale: 5-15 min - Yellow
    status = 'stale';
    textColor = 'text-yellow-400';
    icon = 'schedule';
    label = `Hace ${cacheAgeMinutes} min`;
  } else {
    // Old: > 15 min - Red
    status = 'old';
    textColor = 'text-red-400';
    icon = 'warning';
    label = `Hace ${cacheAgeMinutes} min`;
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs ${className}`}>
      <Icon name={icon} className={`${textColor} text-sm`} />
      <span className={`${textColor} font-medium`}>
        {label}
      </span>
      
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="ml-1 p-1 hover:bg-white/5 rounded transition-all group"
          title="Actualizar datos"
        >
          <Icon 
            name="refresh" 
            className="text-gray-400 text-sm group-hover:text-primary transition-colors" 
          />
        </button>
      )}
    </div>
  );
}

export default CacheBadge;
