import { useEffect, useState } from "react";
import axios from "axios";
import { StaticStarRating } from "./StaticStarRating";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../config";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  brand: {
    name: string;
  } | null;
  avgRating?: number;
  _count?: {
    orderItems: number;
  };
}

export default function BestSeller() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    setLoading(true);
    axios
      .get(`${BACKEND_URL}/products/best-sellers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProducts(res.data.products);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching best sellers:", error);
        setLoading(false);
      });
  }, []);

  // Skeleton loader for product cards
  const ProductSkeleton = () => (
    <div className="min-w-[200px] xs:min-w-[240px] max-w-full flex-shrink-0 sm:flex-shrink border rounded-xl p-0 bg-white shadow-md hover:shadow-lg transition-all duration-300 animate-pulse">
      <div className="relative">
        <div className="h-36 sm:h-48 w-full bg-gray-200 rounded-t-xl"></div>
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

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm my-8 sm:my-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Our Best Sellers</h2>
          <p className="text-sm sm:text-base text-gray-600">Top-rated products loved by our customers</p>
        </div>
        <Link 
          to="/products" 
          className="mt-3 sm:mt-0 group inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition duration-300 text-sm"
        >
          View All Products
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="flex overflow-x-auto gap-4 pb-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 scrollbar-hide">
          {[...Array(4)].map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4 pb-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 scrollbar-hide">
          {products.map((p) => (
            <Link
              to={`/products/${p.id}`}
              key={p.id}
              className="min-w-[200px] xs:min-w-[240px] max-w-full flex-shrink-0 sm:flex-shrink group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="relative overflow-hidden">
                <div className="h-36 sm:h-48 overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                {p._count && p._count.orderItems > 50 && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                    Best Seller
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{p.brand?.name || "No Brand"}</p>
                  </div>
                  <p className="text-indigo-600 font-bold ml-2 whitespace-nowrap text-sm sm:text-base">
                    ₹{p.price.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="mt-2 sm:mt-3 flex items-center gap-1">
                  <StaticStarRating rating={p.avgRating || 0} />
                  <span className="text-xs text-gray-500">
                    ({p.avgRating?.toFixed(1) || "0.0"})
                  </span>
                </div>

                {p._count && (
                  <div className="mt-2 sm:mt-3 flex items-center text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {p._count.orderItems} sold
                  </div>
                )}

                <div className="mt-3 sm:mt-4 text-xs font-medium text-indigo-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
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
  );
}
