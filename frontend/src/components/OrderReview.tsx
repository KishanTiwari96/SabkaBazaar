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
  const [showConfetti, setShowConfetti] = useState(false);

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
          // Show confetti when user data loads successfully
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
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

  const calculateSubtotal = () => {
    return cartItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
  };


  const calculateShipping = () => {
    // Free shipping over ₹1000, otherwise ₹100
    return calculateSubtotal() > 1000 ? 0 : 100;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 px-8">
              <h1 className="text-3xl font-extrabold">Review Your Order</h1>
              <p className="mt-2 opacity-80">Complete your purchase securely</p>
            </div>
            <div className="p-8">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-8">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-yellow-700 font-medium">Please log in to view your order.</p>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate("/login", { state: { from: location.pathname } })}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg shadow-md font-medium transition-colors"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 px-8">
              <h1 className="text-3xl font-extrabold">Review Your Order</h1>
              <p className="mt-2 opacity-80">Complete your purchase securely</p>
            </div>
            <div className="p-10 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/products")}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-all hover:shadow-xl"
                >
                  Browse Products
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl shadow-sm font-semibold transition-all"
                >
                  View Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="confetti-container">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    animationDelay: `${Math.random() * 5}s`,
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden transform transition-all hover:shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-8">
            <h1 className="text-3xl font-extrabold">Review Your Order</h1>
            <p className="mt-2 opacity-80">Complete your purchase securely</p>
          </div>

          <div className="p-8">
            {/* Order Summary */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
                Order Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Info */}
                <div className="bg-gray-50 rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-indigo-600 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    Customer Details
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex items-center">
                      <span className="w-20 text-gray-500 font-medium">Name:</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-gray-500 font-medium">Email:</span>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-gray-50 rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-indigo-600 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </span>
                    Delivery Information
                  </h3>
                  <div className="text-gray-700">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm">
                      <p className="text-yellow-800">
                        Your shipping address will be confirmed in the next step.
                      </p>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      Estimated delivery:
                      <span className="font-semibold text-gray-800 ml-1">
                        {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })} - {new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </span>
                Items in Your Cart
              </h2>
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item: any, index: number) => (
                    <div
                      key={item.id}
                      className={`p-6 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} transition-all duration-300 hover:bg-indigo-50`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-start gap-4">
                          <div className="relative group">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-20 h-20 object-cover rounded-xl shadow-md transition-all duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity rounded-xl"></div>
                          </div>
                          <div>
                            <h3 className="font-medium text-lg text-gray-900">{item.product.name}</h3>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            <div className="mt-1 flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                In Stock
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg sm:text-right text-gray-900">
                            ₹{item.product.price.toLocaleString("en-IN")}
                          </p>
                          <p className="text-sm text-gray-500">
                            Total: ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-indigo-600 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </span>
                Price Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center font-semibold text-lg text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  {calculateShipping() === 0 && (
                    <div className="mt-2 text-sm text-green-600">
                      You qualified for free shipping!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/address", { state: { cartItems, total, productId } })}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg text-lg font-semibold transition-all duration-300 hover:shadow-xl flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Proceed to Checkout
              </button>
              <button
                onClick={handleGoBack}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-xl shadow-sm text-lg font-semibold transition-all duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: fall linear forwards;
          animation-duration: 5s;
        }
        
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        `}
      </style>
    </div>
  );
}; 