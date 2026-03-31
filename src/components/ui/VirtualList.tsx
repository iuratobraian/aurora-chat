import { memo } from 'react';
import { Virtuoso } from 'react-virtuoso';

interface VirtualListProps<T> {
  data: T[];
  renderItem: (index: number, item: T) => React.ReactNode;
  overscan?: number;
  className?: string;
  itemClassName?: string;
  style?: React.CSSProperties;
}

export function VirtualList<T>({
  data,
  renderItem,
  overscan = 200,
  className = '',
  itemClassName = '',
  style,
}: VirtualListProps<T>) {
  return (
    <Virtuoso
      className={className}
      style={style}
      data={data}
      overscan={overscan}
      itemContent={(index, item) => (
        <div className={itemClassName}>{renderItem(index, item)}</div>
      )}
    />
  );
}

export const ListSkeleton = memo(function ListSkeleton({
  count = 5,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-card-dark rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
});

export const TableSkeleton = memo(function TableSkeleton({
  rows = 5,
  columns = 4,
  className = '',
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`bg-card-dark rounded-lg overflow-hidden ${className}`}>
      <div className="grid gap-4 p-4 border-b border-white/10"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 p-4 border-b border-white/5"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
});
