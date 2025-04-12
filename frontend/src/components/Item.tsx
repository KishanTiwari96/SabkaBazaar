import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";
import axios from "axios";

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
}

export const Item = ({ id }: { id: string }) => {
  const [product, setProduct] = useState<Product>();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage

        const config = token
          ? {
              headers: {
                Authorization: `Bearer ${token}`, // Include the token in the request headers
              },
            }
          : {};

        const res = await axios.get(`${BACKEND_URL}/products/${id}`, config); // Include the token if available
        setProduct(res.data.product);
      } catch (error) {
        console.error("Failed to fetch product", error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3">
      <div className="col-span-1">
        <img className="h-96 ml-5" src={product.imageUrl} alt={product.name} />
      </div>
      <div className="col-span-2 ml-5">
        <h3 className="ml-5 text-gray-500 text-lg font-medium">
          {product.brand?.name || "Unknown Brand"}
        </h3>
        <h3 className="ml-5 text-black text-xl font-medium">{product.name}</h3>
        <div className="flex">
          <h3 className="ml-5 text-green-400 text-xl font-semibold">
            ₹{product.price}
          </h3>
        </div>
      </div>
    </div>
  );
};
