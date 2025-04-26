export const ProductSkeleton = () => {
    return (
    <div className="animate-pulse bg-white rounded-xl overflow-hidden p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Product Images */}
        <div className="flex flex-col space-y-4">
          {/* Main Image */}
          <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-200 rounded-xl" />
          
          {/* Thumbnails */}
          <div className="flex space-x-2 justify-center">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
  
        {/* Product Info */}
        <div className="flex flex-col space-y-4">
          {/* Brand */}
          <div className="h-4 w-24 bg-gray-200 rounded" />
          
          {/* Title */}
          <div className="h-7 sm:h-8 w-full bg-gray-300 rounded" />
          
          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-200 rounded-full" />
          </div>
          
          {/* Price */}
          <div className="h-8 w-32 bg-gray-300 rounded mt-2" />
          
          {/* Delivery Info */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="hidden sm:block h-4 w-1 bg-gray-200 rounded" />
            <div className="flex">
              <div className="h-4 w-4 mr-1 bg-gray-200 rounded-full" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 mr-1 bg-gray-200 rounded-full" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
          
          {/* Quantity */}
          <div className="mt-4">
            <div className="h-5 w-20 bg-gray-200 rounded mb-2" />
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gray-200 rounded-l" />
              <div className="h-10 w-12 bg-gray-200" />
              <div className="h-10 w-10 bg-gray-200 rounded-r" />
              <div className="ml-4 h-4 w-32 bg-gray-200 rounded" />
            </div>
          </div>
          
          {/* Add to Cart button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="h-12 w-full bg-gray-300 rounded-lg" />
            <div className="h-12 w-full bg-gray-300 rounded-lg" />
          </div>
        </div>
      </div>
      
      {/* Enhanced Product Description & Specs Section */}
      <div className="mt-10 border-t border-gray-200 pt-6">
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Left column - Description */}
          <div className="lg:w-2/3 space-y-8">
            {/* About This Item - Enhanced */}
            <div className="bg-gradient-to-br from-white to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-7 w-7 bg-gray-300 rounded-full mr-3" />
                <div className="h-6 w-48 bg-gray-300 rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                {[1, 2, 3, 4, 5, 6].map((_, i) => (
                  <div key={i} className="flex items-start py-2 border-b border-gray-200">
                    <div className="h-5 w-5 bg-gray-200 rounded-full mr-2 flex-shrink-0" />
                    <div className="h-4 w-full bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Product Description with tabs - Enhanced */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="px-6 pt-4 flex">
                  <div className="h-10 w-32 bg-gray-200 rounded-t mr-2" />
                  <div className="h-10 w-28 bg-gray-200 rounded-t mx-2" />
                  <div className="h-10 w-24 bg-gray-200 rounded-t ml-2" />
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="h-6 w-64 bg-gray-300 rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-4 w-5/6 bg-gray-200 rounded" />
                    <div className="h-4 w-full bg-gray-200 rounded" />
                  </div>
                  
                  {/* Visual callouts for key specs */}
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((_, i) => (
                      <div key={i} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
                        <div className="h-4 w-20 bg-gray-300 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Warranty Info - Enhanced */}
            <div className="rounded-xl overflow-hidden">
              <div className="h-14 bg-gray-300 rounded-t px-6 py-4">
                <div className="flex items-center">
                  <div className="h-6 w-6 bg-gray-200 rounded-full mr-2" />
                  <div className="h-5 w-40 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="bg-gray-100 px-6 py-4 border border-gray-200 rounded-b">
                <div className="h-5 w-full bg-gray-200 rounded" />
                <div className="h-4 w-4/5 bg-gray-200 rounded mt-2" />
                <div className="mt-4 flex space-x-2">
                  <div className="h-6 w-28 bg-gray-300 rounded-full" />
                  <div className="h-6 w-32 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Technical details - Enhanced */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            {/* Specifications */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="h-6 w-6 bg-gray-300 rounded-full mr-2" />
                <div className="h-6 w-40 bg-gray-300 rounded" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((_, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-gray-200">
                    <div className="h-5 w-24 bg-gray-200 rounded" />
                    <div className="h-5 w-20 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Delivery Info - Enhanced */}
            <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="h-5 w-5 bg-gray-300 rounded-full mr-2" />
                <div className="h-5 w-32 bg-gray-300 rounded" />
              </div>
              <div className="pl-7 space-y-2">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-1.5 w-1.5 bg-gray-300 rounded-full mr-2" />
                    <div className="h-4 w-full bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Additional Info & Return Policy - Combined */}
            <div className="mt-6 rounded-xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 divide-y divide-gray-200">
                <div className="bg-gray-100 p-5 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <div className="h-4 w-4 bg-gray-300 rounded-full mr-1" />
                    <div className="h-4 w-40 bg-gray-300 rounded" />
                  </div>
                  <div className="h-3 w-full bg-gray-200 rounded" />
                </div>
                
                <div className="bg-gray-100 p-5 border-l border-r border-b border-gray-200">
                  <div className="flex items-center mb-2">
                    <div className="h-4 w-4 bg-gray-300 rounded-full mr-1" />
                    <div className="h-4 w-28 bg-gray-300 rounded" />
                  </div>
                  <div className="h-3 w-full bg-gray-200 rounded" />
                </div>
              </div>
            </div>
            
            {/* Payment Options */}
            <div className="mt-6 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="h-4 w-4 bg-gray-300 rounded-full mr-1" />
                <div className="h-5 w-32 bg-gray-300 rounded" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div key={i} className="h-8 w-12 bg-gray-200 rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  };
  