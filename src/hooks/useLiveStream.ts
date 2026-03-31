import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface LiveStatus {
  isLive: boolean;
  url: string;
  lastUpdated: string;
}

interface UseLiveStreamReturn {
  liveStatus: LiveStatus;
  isLive: boolean;
  liveUrl: string;
}

export function useLiveStream(): UseLiveStreamReturn {
  const [liveStatus, setLiveStatus] = useState<LiveStatus>({
    isLive: false,
    url: '',
    lastUpdated: '',
  });
  const [prevLiveState, setPrevLiveState] = useState(false);

  const liveConfig = useQuery(api.config.getConfig, { key: 'live_status' }) as { value?: LiveStatus } | null;

  useEffect(() => {
    if (liveConfig && liveConfig.value) {
      const status = liveConfig.value;
      setLiveStatus(status);
      
      if (!prevLiveState && status.isLive) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification("🔴 TradeShare TV EN VIVO", {
            body: "La transmisión acaba de iniciar. ¡Únete al análisis en tiempo real!",
          });
        }
      }
      setPrevLiveState(status.isLive);
    }
  }, [liveConfig, prevLiveState]);

  return {
    liveStatus,
    isLive: liveStatus.isLive,
    liveUrl: liveStatus.url,
  };
}

export default useLiveStream;
