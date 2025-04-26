import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { AppBar } from '../components/AppBar';
import { Link } from 'react-router-dom';
import { StaticStarRating } from '../components/StaticStarRating';
import Footer from '../components/Footer';
import { FilterSidebar, FilterOptions } from '../components/FilterSidebar';

interface Product {
  id: string;
  name: string;
  brand?: {
    name: string;
  };
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  avgRating?: number;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    brand: '',
    sort: '',
    priceRange: [0, 100000],
    categories: [],
    rating: 0,
    inStock: false
  });
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNoResults(false);

      try {
        const token = localStorage.getItem('authToken');
        
        // Build query parameters for filtering
        let endpoint = `${BACKEND_URL}/products?search=${query}`;
        
        // Brand filter
        if (filters.brand) {
          endpoint += `&brand=${encodeURIComponent(filters.brand)}`;
        }
        
        // Category filter
        if (filters.categories.length > 0) {
          filters.categories.forEach(category => {
            endpoint += `&category=${encodeURIComponent(category)}`;
          });
        }
        
        // Rating filter
        if (filters.rating > 0) {
          endpoint += `&minRating=${filters.rating}`;
        }
        
        // Stock filter
        if (filters.inStock) {
          endpoint += `&inStock=true`;
        }
        
        // Price range filter
        if (filters.priceRange[0] > 0) {
          endpoint += `&minPrice=${filters.priceRange[0]}`;
        }
        if (filters.priceRange[1] < 100000) {
          endpoint += `&maxPrice=${filters.priceRange[1]}`;
        }
        
        // Sort filter
        if (filters.sort) {
          endpoint += `&sort=${filters.sort}`;
        }

        console.log('Fetching products with URL:', endpoint);
        console.log('Using filters:', JSON.stringify(filters, null, 2));

        const res = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('API response:', res.status);
        
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data);
          setProductCount(res.data.length);
          setNoResults(false);
          
          // Extract unique brands from search results
          const brands = res.data
            .map((product: Product) => product.brand?.name)
            .filter((brand: string | undefined): brand is string => 
              brand !== undefined && brand !== null && brand !== ''
            );
          setAvailableBrands([...new Set(brands)]);
        } else {
          setNoResults(true);
          setProducts([]);
          setProductCount(0);
          setAvailableBrands([]);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setNoResults(true);
        setProducts([]);
        setProductCount(0);
        setAvailableBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, filters]);

  // Handle filter application
  const handleApplyFilters = (newFilters: FilterOptions) => {
    console.log('Applying filters:', newFilters);
    
    // Ensure priceRange is properly formatted as numbers
    const formattedFilters: FilterOptions = {
      ...newFilters,
      priceRange: [
        Number(newFilters.priceRange[0]),
        Number(newFilters.priceRange[1])
      ] as [number, number],
      rating: Number(newFilters.rating)
    };
    
    setFilters(formattedFilters);
    setShowMobileFilters(false);
  };

  // Clear all applied filters
  const clearAllFilters = () => {
    const resetFilters: FilterOptions = {
      brand: '',
      sort: '',
      priceRange: [0, 100000] as [number, number],
      categories: [],
      rating: 0,
      inStock: false
    };
    console.log('Clearing all filters');
    setFilters(resetFilters);
  };

  // Function to count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.brand) count++;
    if (filters.categories.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.sort) count++;
    if (
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 100000
    ) {
      count++;
    }
    return count;
  };

  // Skeleton loader for product cards
  const ProductSkeleton = () => (
    <div className="min-w-[150px] max-w-full flex flex-col border rounded-lg overflow-hidden bg-white p-3 shadow hover:shadow-md transition-all duration-300">
      <div className="w-full h-48 sm:h-52 bg-gray-200 rounded-t animate-pulse"></div>
      <div className="p-2 flex flex-col gap-2">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <AppBar />
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white">
            {query ? `Search results for "${query}"` : 'Search Results'}
          </h1>
          <p className="text-indigo-100 text-sm md:text-base max-w-2xl">
            {productCount > 0 ? 
              `Found ${productCount} product${productCount === 1 ? '' : 's'} matching your search.` : 
              loading ? 'Searching...' : 'No products found. Try adjusting your search.'}
          </p>
        </div>
      </div>
      
      {/* Mobile Filter Button */}
      <div className="md:hidden sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="bg-black text-white px-4 py-2 rounded flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="flex h-5 w-5 items-center justify-center bg-indigo-500 text-white text-xs font-bold rounded-full ml-1">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
        
        <div className="text-sm text-gray-500">
          {productCount} products
        </div>
      </div>

      {/* Mobile Filter Panel */}
      {showMobileFilters && (
        <div className="md:hidden px-4 pt-2 pb-4">
          <FilterSidebar
            onFilterChange={handleApplyFilters}
            onClose={() => setShowMobileFilters(false)}
            availableBrands={availableBrands}
          />
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-4 mt-2 md:mt-4 max-w-screen-xl mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden md:block md:sticky md:top-4 md:self-start">
          <div className="px-4">
            <FilterSidebar 
              onFilterChange={handleApplyFilters} 
              availableBrands={availableBrands}
            />
          </div>
        </div>
        
        {/* Products Section */}
        <div className="col-span-1 md:col-span-3">
          <div className="p-4 md:p-6">
            {/* Applied Filters Summary */}
            {Object.values(filters).some(val => 
              Array.isArray(val) ? val.length > 0 : Boolean(val)
            ) && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-200">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-medium text-gray-700">Active Filters:</span>
                  
                  {filters.brand && (
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs flex items-center">
                      {filters.brand}
                      <button 
                        onClick={() => setFilters({...filters, brand: ''})}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {filters.categories.length > 0 && (
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs flex items-center">
                      {filters.categories.length === 1 ? 
                        filters.categories[0] : 
                        `${filters.categories.length} categories`}
                      <button 
                        onClick={() => setFilters({...filters, categories: []})}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {filters.rating > 0 && (
                    <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs flex items-center">
                      {filters.rating}+ Stars
                      <button 
                        onClick={() => setFilters({...filters, rating: 0})}
                        className="ml-1 text-yellow-600 hover:text-yellow-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {filters.inStock && (
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs flex items-center">
                      In Stock
                      <button 
                        onClick={() => setFilters({...filters, inStock: false})}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center">
                      ₹{filters.priceRange[0].toLocaleString('en-IN')} - ₹{filters.priceRange[1].toLocaleString('en-IN')}
                      <button 
                        onClick={() => setFilters({...filters, priceRange: [0, 100000] as [number, number]})}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {filters.sort && (
                    <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded-full text-xs flex items-center">
                      {filters.sort}
                      <button 
                        onClick={() => setFilters({...filters, sort: ''})}
                        className="ml-1 text-rose-600 hover:text-rose-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  <button
                    onClick={clearAllFilters}
                    className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors flex items-center"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {loading ? (
                // Show skeletons while loading
                Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              ) : noResults ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-16 w-16 md:h-20 md:w-20 text-gray-300 mb-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">No products found</h2>
                  <p className="text-gray-500 max-w-md mb-6">
                    We couldn't find any products matching your search for "{query}". Try different keywords or adjust your filters.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link 
                      to="/products" 
                      className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Browse All Products
                    </Link>
                    {Object.values(filters).some(val => 
                      Array.isArray(val) ? val.length > 0 : Boolean(val)
                    ) && (
                      <button
                        onClick={clearAllFilters}
                        className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // Show actual products once loaded
                Array.isArray(products) &&
                products.map((product) => (
                  <Link
                    to={`/products/${product.id}`}
                    key={product.id}
                    className="relative rounded-xl overflow-hidden shadow cursor-pointer hover:scale-[1.02] transition-transform duration-300 hover:shadow-lg bg-white"
                  >
                    <div className="relative p-3 pt-4 flex items-center justify-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-44 sm:h-52 md:h-48 lg:h-52 object-contain"
                        loading="lazy"
                      />
                      {product.stock <= 0 && (
                        <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-medium px-1.5 py-0.5 rounded-full border border-red-200">
                          Out of stock
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t">
                      <div className="text-gray-500 text-sm font-medium">
                        {product.brand?.name || "Generic"}
                      </div>
                      <div className="text-black text-sm font-medium line-clamp-1 mb-1">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <StaticStarRating rating={product.avgRating || 0} />
                        <span className="text-xs text-gray-600">
                          ({product.avgRating?.toFixed(1) || '0.0'})
                        </span>
                      </div>
                      <div className="text-black text-lg font-semibold pb-1">
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            {/* Pagination or "Show More" button could be added here */}
            {products.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="text-xs text-gray-500">
                  Showing {products.length} products
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />

      <style>
        {`
        @media (min-width: 480px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        `}
      </style>
    </div>
  );
};

export default SearchResults; 