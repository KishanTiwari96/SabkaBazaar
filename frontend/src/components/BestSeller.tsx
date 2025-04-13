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

  useEffect(() => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage

    axios
      .get(`${BACKEND_URL}/products/best-sellers`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
      })
      .then((res) => setProducts(res.data.products))
      .catch((error) => console.error("Error fetching best sellers:", error));
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-semibold mb-4">Best Sellers</h2>

      {/* Horizontal scroll on mobile, grid on bigger screens */}
      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto scrollbar-hide">
        {products.map((p) => (
          <Link
            to={`/products/${p.id}`}
            key={p.id}
            className="min-w-[240px] max-w-[240px] sm:min-w-0 sm:max-w-full flex-shrink-0 sm:flex-shrink border rounded-lg p-3 hover:shadow transition bg-white"
          >
            <div>
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-40 object-cover rounded-md mb-2"
              />
              <h3 className="font-medium text-base line-clamp-2">{p.name}</h3>
              <p className="text-sm text-gray-500">{p.brand?.name || "No Brand"}</p>
              <p className="text-blue-600 font-semibold mt-1">₹{p.price.toLocaleString()}</p>

              <div className="mt-1 flex items-center gap-1">
                <StaticStarRating rating={p.avgRating || 0} />
                <span className="text-xs text-gray-500">
                  ({p.avgRating?.toFixed(1) || "0.0"})
                </span>
              </div>

              {p._count && (
                <p className="text-xs text-gray-400 mt-1">Sold: {p._count.orderItems}x</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
