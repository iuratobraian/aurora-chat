import { useEffect, useCallback } from 'react';

type EventCallback = () => void;

export function useFeedEvents(onRefresh: EventCallback, onOpenCreate: EventCallback, deps: any[] = []) {
  useEffect(() => {
    const handleRefresh = () => onRefresh();
    const handleOpenCreate = () => onOpenCreate();
    
    window.addEventListener('refresh-feed', handleRefresh);
    window.addEventListener('open-create-modal', handleOpenCreate);
    
    return () => {
      window.removeEventListener('refresh-feed', handleRefresh);
      window.removeEventListener('open-create-modal', handleOpenCreate);
    };
  }, [onRefresh, onOpenCreate, ...deps]);
}

export function useDispatchFeedEvent(eventName: 'refresh-feed' | 'open-create-modal') {
  return useCallback(() => {
    window.dispatchEvent(new CustomEvent(eventName));
  }, [eventName]);
}

export default useFeedEvents;
