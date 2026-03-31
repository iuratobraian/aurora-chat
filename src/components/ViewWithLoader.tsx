import React, { memo, useState, useEffect } from 'react';
import { useNavigationLoader } from '../hooks/useNavigationLoader';
import { useNavigation } from '../../context/NavigationContext';
import { SectionLoader, ViewTransition } from '../components/NavigationLoader';
import SkeletonLoader from '../components/SkeletonLoader';

interface ViewWithLoaderProps {
  viewName: string;
  onDataFetch: () => Promise<any>;
  renderContent: (data: any) => React.ReactNode;
}

export const ViewWithLoader: React.FC<ViewWithLoaderProps> = memo(({
  viewName,
  onDataFetch,
  renderContent
}) => {
  const { isLoading, isTransitioning, currentPhrase, progress, loadData } = useNavigationLoader({
    view: viewName,
    minDisplayTime: 1500,
    maxDataAge: 5 * 60 * 1000
  });

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await loadData(onDataFetch);
      if (result) {
        setData(result);
      }
    };
    fetchData();
  }, [viewName]);

  if (isLoading && !data) {
    return (
      <div className="animate-in fade-in duration-300">
        <SkeletonLoader variant="feed" count={3} />
      </div>
    );
  }

  return (
    <ViewTransition isVisible={!isTransitioning} viewName={viewName}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {data && renderContent(data)}
      </div>
    </ViewTransition>
  );
});

ViewWithLoader.displayName = 'ViewWithLoader';

export const useViewData = (viewName: string, fetchFn: () => Promise<any>, options?: {
  minDisplayTime?: number;
  maxDataAge?: number;
  skipIfLoaded?: boolean;
}) => {
  const { isLoading, loadData, skipLoader, isTransitioning } = useNavigationLoader({
    view: viewName,
    minDisplayTime: options?.minDisplayTime ?? 1500,
    maxDataAge: options?.maxDataAge ?? 5 * 60 * 1000
  });

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = async (force = false) => {
    try {
      const result = await loadData(fetchFn);
      if (result !== null) {
        setData(result);
      }
    } catch (err) {
      setError(err as Error);
    }
  };

  useEffect(() => {
    load();
  }, [viewName]);

  return {
    data,
    setData,
    isLoading,
    isTransitioning,
    error,
    refresh: () => load(true),
    skipLoader
  };
};

export default ViewWithLoader;
