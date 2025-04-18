import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { OrderReviewSkeleton } from "./OrderReviewSkeleton";

export const OrderReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Load from location.state or localStorage
  const { cartItems, total, productId } = location.state || JSON.parse(localStorage.getItem("orderReviewState") || "{}") || {
    cartItems: [],
    total: 0,
    productId: null,
  };
  
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Save state to localStorage for reload persistence
    localStorage.setItem("orderReviewState", JSON.stringify({ cartItems, total, productId }));
    
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("No token found, redirecting to login");
        setLoading(false);
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      try {
        console.log("Fetching user from:", `${BACKEND_URL}/me`);
        axios.defaults.headers["Authorization"] = `Bearer ${token}`;
        const res = await axios.get(`${BACKEND_URL}/me`);
        console.log("User response:", res.data);
        const fetchedUser = res.data.user;
        if (fetchedUser && fetchedUser.name && fetchedUser.email) {
          setUser({ name: fetchedUser.name, email: fetchedUser.email });
        } else {
          throw new Error("Invalid user data");
        }
      } catch (err: any) {
        console.error("Failed to fetch user info:", err);
        if (err.response?.status === 401) {
          console.log("Unauthorized, clearing token and redirecting to login");
          localStorage.removeItem("authToken");
          navigate("/login", { state: { from: location.pathname } });
        } else {
          alert("Failed to fetch user data. Please try again.");
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate, location.pathname]);

  const handleGoBack = () => {
    if (productId) {
      navigate(`/products/${productId}`);
    } else {
      navigate("/cart");
      alert("Product ID not found. Redirecting to cart.");
    }
  };

  if (loading) {
    return (
      <div>
        <OrderReviewSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 font-sans">
        <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-800">
          🛒 Review Your Order
        </h1>
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-8 text-center">
          Please log in to view your order.
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 font-sans">
        <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-800">
          🛒 Review Your Order
        </h1>
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-200">
          <p className="text-gray-700 text-center">Your cart is empty.</p>
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/cart")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg text-lg font-semibold transition-transform hover:scale-105"
            >
              Go to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 font-sans">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-800">
        🛒 Review Your Order
      </h1>

      {/* User Info */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          📦 Shipping Information
        </h2>
        <div className="space-y-1 text-gray-700">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </div>

      {/* Product Info */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          🧾 Items in Your Cart
        </h2>
        <div className="space-y-6">
          {cartItems.map((item: any) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row justify-between sm:items-center gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg shadow-md"
                />
                <div>
                  <h3 className="font-medium text-lg">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-semibold text-lg sm:text-right">
                ₹{item.product.price.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6 text-xl font-bold border-t pt-4">
          Total: ₹{total.toLocaleString("en-IN")}
        </div>
      </div>

      {/* Proceed to Address Button */}
      <div className="text-center">
        <button
          onClick={() => navigate("/address", { state: { cartItems, total, productId } })}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl shadow-lg text-lg font-semibold transition-transform hover:scale-105"
        >
          Proceed to Buy
        </button>
      </div>

      {/* Go Back to Product Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleGoBack}
          className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl shadow-sm text-lg font-semibold transition-transform hover:scale-105"
        >
          🔙 Go Back to Product
        </button>
      </div>
    </div>
  );
}; 