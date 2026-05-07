export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-4" />
      </div>
    </div>
  );
}
