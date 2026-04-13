export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin border-[3px]" />
        <p className="text-sm text-gray-400">{text}</p>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${j === 0 ? 'w-8' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
