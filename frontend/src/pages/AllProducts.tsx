import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { AppBar } from '../components/AppBar';
import { FilterSidebar, FilterOptions } from '../components/FilterSidebar';
import { StaticStarRating } from '../components/StaticStarRating';
import Footer from '../components/Footer';

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

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    brand: '',
    sort: '',
    priceRange: [0, 100000],
    categories: [],
    rating: 0,
    inStock: false
  });
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let url = `${BACKEND_URL}/products`;
      
      // Add query parameters
      const queryParams = [];
      if (filters.brand) queryParams.push(`brand=${filters.brand}`);
      if (filters.sort) queryParams.push(`sort=${filters.sort}`);
      if (searchQuery) queryParams.push(`search=${searchQuery}`);
      if (filters.categories.length > 0) {
        // If we have multiple categories, add them as separate parameters
        filters.categories.forEach(category => {
          queryParams.push(`category=${category}`);
        });
      }
      
      // Add price range filters
      const minPrice = Number(filters.priceRange[0]);
      const maxPrice = Number(filters.priceRange[1]);
      
      if (!isNaN(minPrice) && minPrice > 0) {
        queryParams.push(`minPrice=${minPrice}`);
      }
      
      if (!isNaN(maxPrice) && maxPrice < 100000) {
        queryParams.push(`maxPrice=${maxPrice}`);
      }
      
      // Add rating filter
      if (filters.rating > 0) {
        const ratingValue = Number(filters.rating);
        if (!isNaN(ratingValue) && ratingValue > 0) {
          queryParams.push(`minRating=${ratingValue}`);
        }
      }
      
      // Add in-stock filter
      if (filters.inStock) {
        queryParams.push(`inStock=true`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(res.data);
        setFilteredProducts(res.data);
        setTotalProducts(res.data.length);
        
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
  }, [filters, searchQuery]);

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
    <div className="relative rounded-xl overflow-hidden shadow-md animate-pulse bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="relative">
        <div className="w-full h-36 sm:h-48 bg-gray-200"></div>
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 h-5 w-16 bg-gray-300 rounded-full"></div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 sm:space-y-2 w-2/3">
            <div className="h-4 sm:h-5 bg-gray-200 rounded w-full"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="mt-2 sm:mt-3 h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="mt-2 sm:mt-3 h-3 sm:h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="mt-3 sm:mt-4 h-3 sm:h-4 bg-gray-200 rounded w-1/4"></div>
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

  // Display applied filters as tags
  const renderFilterTags = () => {
    const tags = [];

    if (filters.brand) {
      tags.push(
        <span key="brand" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mr-2 mb-2">
          Brand: {filters.brand}
          <button
            onClick={() => setFilters({...filters, brand: ''})}
            className="ml-1.5 text-indigo-600 hover:text-indigo-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      );
    }

    if (filters.categories.length > 0) {
      tags.push(
        <span key="category" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mr-2 mb-2">
          Categories: {filters.categories.join(', ')}
          <button
            onClick={() => setFilters({...filters, categories: []})}
            className="ml-1.5 text-purple-600 hover:text-purple-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      );
    }

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) {
      tags.push(
        <span key="price" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mr-2 mb-2">
          Price: ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
          <button
            onClick={() => setFilters({...filters, priceRange: [0, 100000]})}
            className="ml-1.5 text-green-600 hover:text-green-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      );
    }

    if (filters.rating > 0) {
      tags.push(
        <span key="rating" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 mr-2 mb-2">
          {filters.rating}+ Stars
          <button
            onClick={() => setFilters({...filters, rating: 0})}
            className="ml-1.5 text-yellow-600 hover:text-yellow-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      );
    }

    if (filters.inStock) {
      tags.push(
        <span key="stock" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
          In Stock Only
          <button
            onClick={() => setFilters({...filters, inStock: false})}
            className="ml-1.5 text-blue-600 hover:text-blue-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      );
    }

    if (filters.sort) {
      const sortLabels: Record<string, string> = {
        'asc': 'Price: Low to High',
        'desc': 'Price: High to Low',
        'rating': 'Highest Rated',
        'newest': 'Newest First'
      };
      
      tags.push(
        <span key="sort" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 mr-2 mb-2">
          Sort: {sortLabels[filters.sort]}
          <button
            onClick={() => setFilters({...filters, sort: ''})}
            className="ml-1.5 text-red-600 hover:text-red-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      );
    }

    if (tags.length > 0) {
      return (
        <div className="flex flex-wrap items-center mb-4">
          <span className="text-sm text-gray-500 mr-2 mb-2">Applied filters:</span>
          {tags}
          {tags.length > 1 && (
            <button
              onClick={() => setFilters({
                brand: '',
                sort: '',
                priceRange: [0, 100000],
                categories: [],
                rating: 0,
                inStock: false
              })}
              className="text-sm text-gray-500 hover:text-gray-700 underline mb-2"
            >
              Clear All
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppBar />

      <div className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">All Products</h1>
            <p className="text-lg sm:text-xl text-indigo-100 max-w-3xl">
              Discover our wide range of high-quality products. From electronics to fashion, find everything you need at great prices.
            </p>
          </div>
        </div>

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
            {filteredProducts.length} products
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              <FilterSidebar 
                onFilterChange={handleApplyFilters} 
                availableBrands={availableBrands}
              />
            </div>

            {/* Products Section */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {searchQuery
                      ? `Showing results for "${searchQuery}"`
                      : 'All Products'}
                  </h2>
                  <div className="mt-2 md:mt-0 text-sm text-gray-500">
                    {!loading && 
                      `Showing ${filteredProducts.length} of ${totalProducts} products`}
                  </div>
                </div>

                {/* Applied Filters Tags */}
                {renderFilterTags()}

                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, index) => (
                      <ProductSkeleton key={index} />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
                    <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria.</p>
                    <button
                      onClick={() => setFilters({
                        brand: '',
                        sort: '',
                        priceRange: [0, 100000],
                        categories: [],
                        rating: 0,
                        inStock: false
                      })}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <Link
                        to={`/products/${product.id}`}
                        key={product.id}
                        className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                      >
                        <div className="relative overflow-hidden">
                          <div className="h-48 overflow-hidden">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          {product.stock <= 0 && (
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">{product.brand?.name || "No Brand"}</p>
                            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                              {product.name}
                            </h3>
                          </div>
                          
                          <div className="mt-3 flex items-center gap-1">
                            <StaticStarRating rating={product.avgRating || 0} />
                            <span className="text-xs text-gray-500">
                              ({product.avgRating?.toFixed(1) || "0.0"})
                            </span>
                          </div>
                          
                          <p className="text-indigo-600 font-bold mt-2">
                            ₹{product.price.toLocaleString('en-IN')}
                          </p>
                          
                          <div className="mt-4 text-xs font-medium text-indigo-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            View details
                            <svg className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AllProducts; 