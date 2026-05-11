export default function SkeletonCard() {
  return (
    <div className="surface-shell rounded-3xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-blue-100/70" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-blue-100 rounded w-3/4" />
        <div className="h-3 bg-blue-100 rounded w-full" />
        <div className="h-3 bg-blue-100 rounded w-2/3" />
        <div className="h-6 bg-blue-100 rounded w-1/3 mt-4" />
      </div>
    </div>
  );
}
