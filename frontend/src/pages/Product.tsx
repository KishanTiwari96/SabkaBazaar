import { useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AppBar } from "../components/AppBar";
import ReviewSection from "../components/ReviewSection";
import { StaticStarRating } from "../components/StaticStarRating";
import { ProductSkeleton } from "../components/ProductSkeleton";

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
  images?: { url: string }[];
  category: string;
  avgRating?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface SimilarProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  rating: number; 
}

export const Product = () => {
  const [product, setProduct] = useState<Product>();
  const [user, setUser] = useState<User | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const navigate = useNavigate();
  const { id } = useParams();

  const [isSticky, setIsSticky] = useState(true);
  const reviewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (reviewRef.current) observer.observe(reviewRef.current);

    return () => {
      if (reviewRef.current) observer.unobserve(reviewRef.current);
    };
  }, []);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/products/${id}`);
        const prod = res.data.product;
        setProduct(prod);
        setSelectedImage(prod.images?.[0]?.url || prod.imageUrl);
      } catch (error) {
        console.error("Failed to fetch product", error);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/me`, {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
    };

    fetchProduct();
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (id) {
      axios
        .get(`${BACKEND_URL}/products/${id}/similar`)
        .then((res) => {
          const mappedProducts = res.data.products.map((p: any) => ({
            ...p,
            rating: p.avgRating || 0, // 🔁 mapping avgRating to rating
          }));
          setSimilarProducts(mappedProducts);
        })
        .catch((err) => console.error("Failed to fetch similar products", err));
    }
  }, [id]);
  

  const addToCart = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/cart`,
        {
          productId: product?.id,
          quantity: 1,
        },
        { withCredentials: true }
      );
      alert("Added to cart!");
    } catch (err) {
      console.error("Error adding to cart", err);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    navigate("/order-review", {
      state: {
        cartItems: [
          {
            id: product.id,
            product,
            quantity,
          },
        ],
        total: product.price * quantity,
      },
    });
  };

  const increaseQty = () => {
    if (quantity < product!.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  if (!product)
    return (
      <div>
        <AppBar />
        <ProductSkeleton />
      </div>
    );

  return (
    <div>
      <AppBar />
      <div className="flex flex-col lg:flex-row gap-8 mt-7 px-4 lg:px-">
        {/* Image Section */}
        <div className={`flex flex-col lg:flex-row gap-4 ${isSticky ? "lg:sticky top-24 h-fit" : ""}`}>
          {/* Thumbnails */}
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[400px]">
            {(product.images?.length ? product.images : [{ url: product.imageUrl }]).map(
              (img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`h-20 w-20 object-cover cursor-pointer rounded border ${
                    selectedImage === img.url
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedImage(img.url)}
                />
              )
            )}
          </div>

          {/* Main Image */}
          <div>
            <img
              src={selectedImage}
              alt="Selected Product"
              className="h-96 w-96 object-cover rounded shadow"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 ml-5 sm:ml-0">
          <h3 className="text-gray-500 text-lg font-medium">
            {product.brand?.name || "Unknown Brand"}
          </h3>
          <h3 className="text-black text-xl font-semibold mt-1">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <StaticStarRating rating={product.avgRating || 0} />
            <span className="text-gray-500 text-sm">
              ({product.avgRating?.toFixed(1) || "0.0"})
            </span>
          </div>
          <h3 className="mt-4 text-xl font-semibold">₹{product.price}</h3>
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={addToCart}
            >
              Add to Cart
            </button>

            <div className="flex items-center gap-2 border px-3 py-1 rounded">
              <button onClick={decreaseQty} className="text-xl font-bold px-2">
                −
              </button>
              <span className="text-lg">{quantity}</span>
              <button onClick={increaseQty} className="text-xl font-bold px-2">
                +
              </button>
            </div>

            <span className="text-lg font-medium">
              Total: ₹{(product.price * quantity).toFixed(2)}
            </span>
          </div>
          <button
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleBuyNow}
          >
            ✅ Buy Now
          </button>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">About this item</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ">
              {product.description.split("\n").map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div ref={reviewRef} className="mt-12 px-4 lg:px-16">
  <ReviewSection productId={product.id} currentUser={user} />
</div>


      {/* Similar Products */}
{similarProducts.length > 0 && (
  <div className="mt-12">
    <h2 className="text-2xl font-semibold mb-4 ml-5 sm:ml-10">Similar Products</h2>

    {/* Desktop view */}
    <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-6 px-5 sm:px-10">
      {similarProducts.map((prod) => (
        <div
          key={prod.id}
          className="border rounded-xl p-4 hover:shadow-lg transition cursor-pointer bg-white"
          onClick={() => {
            navigate(`/products/${prod.id}`);
            window.location.reload();
          }}
        >
          <img
            src={prod.imageUrl}
            alt={prod.name}
            className="w-full h-40 object-cover rounded-md mb-3"
          />
          <h3 className="text-lg font-medium text-gray-800">{prod.name}</h3>

          {/* Rating */}
          <div className="mt-1 flex items-center gap-2">
            <StaticStarRating rating={prod.rating} />
            <span className="text-sm text-gray-600">({prod.rating.toFixed(1)})</span>
          </div>

          <p className="text-gray-600 mt-1">₹{prod.price}</p>
        </div>
      ))}
    </div>

    {/* Mobile view */}
    <div className="sm:hidden overflow-x-auto px-4 -mx-4">
      <div className="flex gap-4 w-max">
        {similarProducts.map((prod) => (
          <div
            key={prod.id}
            className="min-w-[180px] max-w-[180px] border rounded-xl p-3 hover:shadow-md transition cursor-pointer bg-white"
            onClick={() => {
              navigate(`/products/${prod.id}`);
              window.location.reload();
            }}
          >
            <img
              src={prod.imageUrl}
              alt={prod.name}
              className="w-full h-32 object-cover rounded-md mb-2"
            />
            <h3 className="text-sm font-medium text-gray-800 truncate">{prod.name}</h3>

            {/* Rating */}
            <div className="mt-1 flex items-center gap-2">
              <StaticStarRating rating={prod.rating} />
              <span className="text-xs text-gray-600">({prod.rating.toFixed(1)})</span>
            </div>

            <p className="text-gray-600 text-sm mt-1">₹{prod.price}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

    </div>
  );
};
