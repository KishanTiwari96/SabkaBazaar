import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { OrderReviewSkeleton } from "./OrderReviewSkeleton";

export const OrderReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, total } = location.state || {};
  const [user, setUser] = useState<any>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('authToken');

    if (token) {
      // Set the token in the Authorization header for all requests
      axios.defaults.headers['Authorization'] = `Bearer ${token}`;

      // Fetch user information using the token
      axios
        .get(`${BACKEND_URL}/me`)
        .then((res) => setUser(res.data.user))
        .catch((err) => console.error("Failed to fetch user info", err));
    } else {
      console.log("No token found");
    }
  }, []);

  const handleConfirmOrder = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        alert("You need to log in to place an order");
        navigate("/login");
        return;
      }

      // Include the token in the request headers
      await axios.post(
        `${BACKEND_URL}/orders`,
        {
          items: cartItems.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          total,
        }
      );

      setOrderSuccess(true);
      setTimeout(() => navigate("/my-orders"), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    }
  };

  if (!cartItems || !user) return (
    <div>
      <OrderReviewSkeleton />
    </div>
  );

  if (orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-4 text-center animate-fade-in">
        <div className="bg-green-100 rounded-full p-4 shadow-md">
          <svg
            className="w-20 h-20 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mt-6 text-green-700">
          Order Placed Successfully!
        </h2>
        <p className="text-gray-600 mt-3 text-sm sm:text-base">
          Redirecting you to your orders shortly...
        </p>
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
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">📦 Shipping Information</h2>
        <div className="space-y-1 text-gray-700">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
      </div>

      {/* Product Info */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">🧾 Items in Your Cart</h2>
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
              <p className="font-semibold text-lg sm:text-right">₹{item.product.price}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6 text-xl font-bold border-t pt-4">
          Total: ₹{total}
        </div>
      </div>

      {/* Confirm Button */}
      <div className="text-center">
        <button
          onClick={handleConfirmOrder}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl shadow-lg text-lg font-semibold transition-transform hover:scale-105"
        >
          ✅ Confirm Order
        </button>
      </div>
    </div>
  );
};
