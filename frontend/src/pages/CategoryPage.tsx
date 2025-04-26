import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { AppBar } from '../components/AppBar';
import { FilterSidebar, FilterOptions } from '../components/FilterSidebar';
import { StaticStarRating } from '../components/StaticStarRating';

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

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    brand: '',
    sort: '',
    priceRange: [0, 100000],
    categories: [],
    rating: 0,
    inStock: false
  });
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let url = `${BACKEND_URL}/products?category=${categoryName}`;
      if (filters.brand) url += `&brand=${filters.brand}`;
      if (filters.sort) url += `&sort=${filters.sort}`;
      if (searchQuery) url += `&search=${searchQuery}`;
      
      // Add other filters if they exist
      if (filters.rating > 0) {
        const ratingValue = Number(filters.rating);
        if (!isNaN(ratingValue) && ratingValue > 0) {
          url += `&minRating=${ratingValue}`;
        }
      }
      
      if (filters.inStock) {
        url += `&inStock=true`;
      }
      
      const minPrice = Number(filters.priceRange[0]);
      const maxPrice = Number(filters.priceRange[1]);
      
      if (!isNaN(minPrice) && minPrice > 0) {
        url += `&minPrice=${minPrice}`;
      }
      
      if (!isNaN(maxPrice) && maxPrice < 100000) {
        url += `&maxPrice=${maxPrice}`;
      }

      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(res.data);
        
        // Extract unique brands from products
        const brands = res.data
          .map((product: Product) => product.brand?.name)
          .filter((brand: string | undefined): brand is string => 
            brand !== undefined && brand !== null && brand !== ''
          );
        setAvailableBrands([...new Set(brands)] as string[]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setLoading(false);
        setAvailableBrands([]);
      }
    };

    fetchProducts();
  }, [categoryName, filters, searchQuery]);

  const handleApplyFilters = (newFilters: FilterOptions) => {
    // Ensure proper typing for priceRange and rating
    const formattedFilters: FilterOptions = {
      ...newFilters,
      priceRange: [
        typeof newFilters.priceRange[0] === 'string' ? Number(newFilters.priceRange[0]) : newFilters.priceRange[0],
        typeof newFilters.priceRange[1] === 'string' ? Number(newFilters.priceRange[1]) : newFilters.priceRange[1]
      ] as [number, number],
      rating: typeof newFilters.rating === 'string' ? Number(newFilters.rating) : newFilters.rating
    };
    
    setFilters(formattedFilters);
    setShowMobileFilter(false);
  };

  // Skeleton loader for product cards
  const ProductSkeleton = () => (
    <div className="min-w-[150px] max-w-full flex flex-col border rounded-lg overflow-hidden bg-white p-3 shadow hover:shadow-md transition-all duration-300">
      <div className="w-full h-40 sm:h-52 bg-gray-200 rounded-t animate-pulse"></div>
      <div className="p-2 flex flex-col gap-2">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );

  // Get active filter count for mobile display
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

  return (
    <div>
      <AppBar />

      {/* Mobile Filter Button */}
      <div className="md:hidden sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setShowMobileFilter(!showMobileFilter)}
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
          {products.length} products
        </div>
      </div>

      {/* Mobile Filter Panel */}
      {showMobileFilter && (
        <div className="md:hidden px-4 pt-2 pb-4">
          <FilterSidebar
            onFilterChange={handleApplyFilters}
            onClose={() => setShowMobileFilter(false)}
            availableBrands={availableBrands}
          />
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <FilterSidebar 
            onFilterChange={handleApplyFilters} 
            availableBrands={availableBrands}
          />
        </div>

        {/* Products Section */}
        <div className="col-span-1 md:col-span-3">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              {searchQuery
                ? `Showing results for "${searchQuery}"`
                : `Showing results for "${categoryName}"`}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading ? (
                // Show skeletons while loading
                Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              ) : (
                // Show actual products once loaded
                Array.isArray(products) &&
                products.map((product) => (
                  <Link
                    to={`/products/${product.id}`}
                    key={product.id}
                    className="relative rounded-xl overflow-hidden shadow cursor-pointer hover:scale-[1.02] transition-transform duration-300 hover:shadow-lg"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="p-3 w-full h-60 object-cover"
                    />
                    <h3 className="ml-5 text-gray-500 text-lg font-medium">
                      {product.brand?.name}
                    </h3>
                    <h3 className="ml-5 text-black text-md font-medium">{product.name}</h3>
                    <div className="ml-5 flex items-center gap-1">
                      <StaticStarRating rating={product.avgRating || 0} />
                      <span className="text-xs text-gray-600">
                        ({product.avgRating?.toFixed(1) || '0.0'})
                      </span>
                    </div>
                    <h3 className="ml-5 text-black text-xl font-semibold">
                      ₹{product.price.toLocaleString('en-IN')}
                    </h3>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
