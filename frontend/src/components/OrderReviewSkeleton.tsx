export const OrderReviewSkeleton = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-pulse">
        <div className="h-8 sm:h-10 w-full sm:w-1/3 bg-gray-200 rounded mb-6 sm:mb-10 mx-auto" />
  
        {/* Shipping Info Skeleton */}
        <div className="bg-white shadow-md sm:shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 space-y-2 sm:space-y-3">
          <div className="h-5 sm:h-6 w-2/5 bg-gray-200 rounded" />
          <div className="h-3 sm:h-4 w-1/3 bg-gray-200 rounded" />
          <div className="h-3 sm:h-4 w-1/2 bg-gray-200 rounded" />
          <div className="h-3 sm:h-4 w-1/4 bg-gray-200 rounded" />
        </div>
  
        {/* Cart Items Skeleton */}
        <div className="bg-white shadow-md sm:shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 space-y-4 sm:space-y-6">
          <div className="h-5 sm:h-6 w-2/5 bg-gray-200 rounded" />
          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between items-center gap-3 sm:gap-5">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg shadow" />
                <div className="space-y-1 sm:space-y-2">
                  <div className="h-3 sm:h-4 w-28 sm:w-40 bg-gray-200 rounded" />
                  <div className="h-2 sm:h-3 w-16 sm:w-24 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-200 rounded" />
            </div>
          ))}
          <div className="h-4 sm:h-5 w-20 sm:w-28 bg-gray-200 rounded ml-auto mt-4 sm:mt-6" />
        </div>
  
        {/* Confirm Button Skeleton */}
        <div className="mx-auto w-36 sm:w-48 h-8 sm:h-10 bg-gray-200 rounded-lg" />
      </div>
    );
  };
  