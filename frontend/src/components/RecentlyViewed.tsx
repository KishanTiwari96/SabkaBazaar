import { useUser } from './UserContext';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const RecentlyViewed = () => {
  const { recentlyViewed, clearRecentlyViewed } = useUser();
  const [isVisible, setIsVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Only show if we have recently viewed products
    setIsVisible(recentlyViewed.length > 0);
    
    // Check screen size
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [recentlyViewed]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = isSmallScreen ? -150 : -200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = isSmallScreen ? 150 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <section className="py-6 sm:py-8 md:py-10 overflow-hidden border-b border-gray-200" id="recently-viewed">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <div className="mb-3 sm:mb-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              Recently Viewed
              <span className="ml-2 py-1 px-2 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                {recentlyViewed.length}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Products you've checked out</p>
          </div>
          
          <div className="flex items-center justify-between sm:justify-start sm:space-x-3">
            <button 
              onClick={clearRecentlyViewed}
              className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
            
            <div className="flex space-x-2 ml-auto sm:ml-0">
              <button 
                onClick={scrollLeft}
                className="p-1 sm:p-1.5 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Scroll left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={scrollRight}
                className="p-1 sm:p-1.5 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Scroll right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Gradient overlay on left */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
          
          {/* Products row with horizontal scroll */}
          <div 
            ref={scrollContainerRef}
            className="flex space-x-3 sm:space-x-4 pb-3 sm:pb-4 pt-1 sm:pt-2 overflow-x-auto scrollbar-hide px-1"
          >
            {recentlyViewed.map((product, index) => (
              <Link 
                to={`/products/${product.id}`} 
                key={product.id}
                className="flex-shrink-0 w-32 sm:w-44 md:w-56 group relative"
              >
                {index === 0 && (
                  <div className="absolute -top-2 -left-2 z-10">
                    <span className="bg-indigo-600 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      Last viewed
                    </span>
                  </div>
                )}
                <div className="relative bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 h-full flex flex-col">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="flex-1 p-2 sm:p-3 md:p-4 flex flex-col">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1 sm:line-clamp-2">{product.name}</h3>
                    
                    {product.category && (
                      <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-500 line-clamp-1">{product.category}</p>
                    )}
                    
                    <div className="mt-auto pt-2 sm:pt-3 flex justify-between items-center">
                      <p className="text-sm sm:text-base font-semibold text-gray-900">₹{product.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Gradient overlay on right */}
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed; 