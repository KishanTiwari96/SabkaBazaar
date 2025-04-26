import { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useSearchParams, useParams } from 'react-router-dom';

interface FilterSidebarProps {
  onFilterChange: (filters: FilterOptions) => void;
  onClose?: () => void; // Optional close callback for mobile
  availableBrands?: string[]; // Optional brands from search results
}

export interface FilterOptions {
  brand: string;
  sort: string;
  priceRange: [number, number];
  categories: string[];
  rating: number;
  inStock: boolean;
}

const defaultPriceRange: [number, number] = [0, 100000];

export function FilterSidebar({
  onFilterChange,
  onClose,
  availableBrands,
}: FilterSidebarProps) {
  // State for all filter options
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState('');
  const [minPrice, setMinPrice] = useState<number>(defaultPriceRange[0]);
  const [maxPrice, setMaxPrice] = useState<number>(defaultPriceRange[1]);
  const [priceRange, setPriceRange] = useState<[number, number]>(defaultPriceRange);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  
  // Collapsible section states
  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    price: true,
    category: true,
    rating: true,
    sorting: true,
    availability: true
  });

  // URL parameters
  const [searchParams] = useSearchParams();
  const { categoryName } = useParams();

  // Fetch brands and categories
  useEffect(() => {
    const fetchFilterOptions = async () => {
      const search = searchParams.get('search');
      const token = localStorage.getItem('authToken');

      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      try {
        // Only fetch brands if availableBrands is not provided
        if (!availableBrands) {
          // Fetch brands
          let brandsUrl = `${BACKEND_URL}/brands`;
          if (categoryName) brandsUrl += `?category=${categoryName}`;
          if (search) brandsUrl += `${categoryName ? '&' : '?'}search=${search}`;
          
          const brandsRes = await axios.get(brandsUrl, { headers });
          const brandNames = brandsRes.data.map((b: any) => b.name);
          setBrands(brandNames);
        }

        // Fetch categories
        const categoriesRes = await axios.get(`${BACKEND_URL}/categories`, { headers });
        const categoryNames = categoriesRes.data.map((c: any) => c.name);
        setCategories(categoryNames);

        // If we're on a category page, pre-select that category
        if (categoryName) {
          setSelectedCategories([categoryName]);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };

    fetchFilterOptions();
  }, [categoryName, searchParams, availableBrands]);

  // Update brands when availableBrands changes
  useEffect(() => {
    if (availableBrands && availableBrands.length > 0) {
      setBrands(availableBrands);
    }
  }, [availableBrands]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Apply all filters
  const handleApply = () => {
    onFilterChange({
      brand: selectedBrand,
      sort: sortOrder,
      priceRange: [minPrice, maxPrice],
      categories: selectedCategories,
      rating: minRating,
      inStock: inStockOnly
    });
    
    if (onClose) onClose(); // close on mobile
  };

  // Reset all filters
  const handleReset = () => {
    setSelectedBrand('');
    setSortOrder('');
    setMinPrice(defaultPriceRange[0]);
    setMaxPrice(defaultPriceRange[1]);
    setPriceRange(defaultPriceRange);
    setSelectedCategories(categoryName ? [categoryName] : []);
    setMinRating(0);
    setInStockOnly(false);
    
    onFilterChange({
      brand: '',
      sort: '',
      priceRange: defaultPriceRange,
      categories: categoryName ? [categoryName] : [],
      rating: 0,
      inStock: false
    });
  };

  // Price range handlers
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setMinPrice(value);
    
    // Ensure min doesn't exceed max
    if (value > maxPrice) {
      setMaxPrice(value);
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setMaxPrice(value);
    
    // Ensure max isn't less than min
    if (value < minPrice) {
      setMinPrice(value);
    }
  };

  // Render star rating selector
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 fill-current'
            }`}
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">&amp; Up</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-0 overflow-hidden">
      <div className="sticky top-0 bg-white z-10 border-b p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          <button
            onClick={handleReset}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      <div className="px-4 py-2 max-h-[calc(100vh-150px)] overflow-y-auto">
        {/* Brand Filter */}
        <div className="py-3 border-b">
          <button
            className="flex w-full justify-between items-center font-medium text-gray-900"
            onClick={() => toggleSection('brand')}
          >
            <span>Brand</span>
            <svg
              className={`h-5 w-5 transform transition-transform ${
                expandedSections.brand ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.brand && (
            <div className="mt-3 space-y-2">
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="py-3 border-b">
          <button
            className="flex w-full justify-between items-center font-medium text-gray-900"
            onClick={() => toggleSection('price')}
          >
            <span>Price Range</span>
            <svg
              className={`h-5 w-5 transform transition-transform ${
                expandedSections.price ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.price && (
            <div className="mt-3 space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-5/12">
                  <label className="block text-xs text-gray-600 mb-1">Min</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      className="pl-7 w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="Min"
                    />
                  </div>
                </div>
                <div className="w-2 h-0.5 bg-gray-300"></div>
                <div className="w-5/12">
                  <label className="block text-xs text-gray-600 mb-1">Max</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      className="pl-7 w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-2">
                <input
                  type="range"
                  min={defaultPriceRange[0]}
                  max={defaultPriceRange[1]}
                  value={minPrice}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setMinPrice(value);
                    if (value > maxPrice) setMaxPrice(value);
                  }}
                  className="w-full accent-indigo-600 mt-1"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>₹{defaultPriceRange[0]}</span>
                  <span>₹{defaultPriceRange[1]}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="py-3 border-b">
          <button
            className="flex w-full justify-between items-center font-medium text-gray-900"
            onClick={() => toggleSection('category')}
          >
            <span>Category</span>
            <svg
              className={`h-5 w-5 transform transition-transform ${
                expandedSections.category ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.category && (
            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center">
                  <input
                    id={`category-${category}`}
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rating Filter */}
        <div className="py-3 border-b">
          <button
            className="flex w-full justify-between items-center font-medium text-gray-900"
            onClick={() => toggleSection('rating')}
          >
            <span>Rating</span>
            <svg
              className={`h-5 w-5 transform transition-transform ${
                expandedSections.rating ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.rating && (
            <div className="mt-3 space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <input
                    id={`rating-${rating}`}
                    type="radio"
                    checked={minRating === rating}
                    onChange={() => setMinRating(rating)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={`rating-${rating}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {renderStars(rating)}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Availability Filter */}
        <div className="py-3 border-b">
          <button
            className="flex w-full justify-between items-center font-medium text-gray-900"
            onClick={() => toggleSection('availability')}
          >
            <span>Availability</span>
            <svg
              className={`h-5 w-5 transform transition-transform ${
                expandedSections.availability ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.availability && (
            <div className="mt-3">
              <div className="flex items-center">
                <input
                  id="in-stock"
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(!inStockOnly)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor="in-stock"
                  className="ml-2 text-sm text-gray-700"
                >
                  In Stock Only
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Sort Order */}
        <div className="py-3">
          <button
            className="flex w-full justify-between items-center font-medium text-gray-900"
            onClick={() => toggleSection('sorting')}
          >
            <span>Sort By</span>
            <svg
              className={`h-5 w-5 transform transition-transform ${
                expandedSections.sorting ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.sorting && (
            <div className="mt-3">
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
                >
                  <option value="">Default</option>
                  <option value="asc">Price: Low to High</option>
                  <option value="desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <button
          onClick={handleApply}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow transition duration-200 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Apply Filters
        </button>
      </div>
    </div>
  );
}
