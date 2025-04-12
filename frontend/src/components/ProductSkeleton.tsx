export const ProductSkeleton = () => {
    return (
      <div className="animate-pulse p-8 grid grid-cols-3 gap-10">
        {/* Sidebar Image thumbnails & main image */}
        <div className="col-span-1 flex ml-5 gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="h-20 w-20 bg-gray-300 rounded" />
            ))}
          </div>
  
          {/* Main Image */}
          <div className="h-96 w-96 bg-gray-300 rounded shadow" />
        </div>
  
        {/* Product Info */}
        <div className="col-span-2 ml-7 space-y-4">
          <div className="h-5 w-1/4 bg-gray-300 rounded" />
          <div className="h-8 w-1/2 bg-gray-400 rounded" />
          <div className="h-5 w-1/3 bg-gray-300 rounded" />
  
          <div className="h-8 w-32 bg-gray-400 rounded mt-4" />
          <div className="h-20 w-full bg-gray-200 rounded" />
  
          <div className="h-10 w-36 bg-gray-400 rounded mt-4" />
        </div>
      </div>
    );
  };
  