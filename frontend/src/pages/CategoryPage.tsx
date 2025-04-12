import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { AppBar } from '../components/AppBar';
import { FilterSidebar } from '../components/FilterSidebar';
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
  const [filters, setFilters] = useState<any>({});
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchProducts = async () => {
      let url = `${BACKEND_URL}/products?category=${categoryName}`;
      if (filters.brand) url += `&brand=${filters.brand}`;
      if (filters.sort) url += `&sort=${filters.sort}`;
      if (searchQuery) url += `&search=${searchQuery}`;

      try {
        const token = localStorage.getItem('authToken'); // or use cookies if you're storing the token elsewhere
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to the request headers
          },
        });
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        // Handle error (e.g., token expired, unauthorized, etc.)
      }
    };

    fetchProducts();
  }, [categoryName, filters, searchQuery]);

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setShowMobileFilter(false); // close the mobile filter
  };

  return (
    <div>
      <AppBar />

      {/* Mobile Filter Button */}
      <div className="md:hidden flex items-center px-4 pt-4">
        <button
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Filter
        </button>
      </div>

      {/* Mobile Filter Panel */}
      {showMobileFilter && (
        <div className="md:hidden px-4 pt-2 pb-4">
          <FilterSidebar
            onFilterChange={handleApplyFilters}
            onClose={() => setShowMobileFilter(false)}
          />
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <FilterSidebar onFilterChange={handleApplyFilters} />
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
              {Array.isArray(products) &&
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
                      ₹{product.price}
                    </h3>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
