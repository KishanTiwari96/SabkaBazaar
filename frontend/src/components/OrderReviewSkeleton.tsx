export const OrderReviewSkeleton = () => {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse">
        <div className="h-10 w-1/3 bg-gray-300 rounded mb-10 mx-auto" />
  
        {/* Shipping Info Skeleton */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-200 space-y-3">
          <div className="h-6 w-2/5 bg-gray-300 rounded" />
          <div className="h-4 w-1/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="h-4 w-1/4 bg-gray-200 rounded" />
        </div>
  
        {/* Cart Items Skeleton */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-200 space-y-6">
          <div className="h-6 w-2/5 bg-gray-300 rounded" />
          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between items-center gap-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-300 rounded-lg shadow" />
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          ))}
          <div className="h-5 w-28 bg-gray-300 rounded ml-auto mt-6" />
        </div>
  
        {/* Confirm Button Skeleton */}
        <div className="mx-auto w-48 h-10 bg-gray-300 rounded-lg" />
      </div>
    );
  };
  