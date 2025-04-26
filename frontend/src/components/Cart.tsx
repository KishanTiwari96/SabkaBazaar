import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { AppBar } from "./AppBar";
import { useNavigate, Link } from "react-router-dom";
import Footer from "./Footer";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  brand?: {
    name: string;
  };
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const res = await axios.get(`${BACKEND_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems(res.data.cart);
    } catch (err) {
      console.error("Error fetching cart", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${BACKEND_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.data.user) {
          navigate("/login");
        } else {
          fetchCart();
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        navigate("/login");
      }
    };

    checkAuthentication();
  }, [navigate]);

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setIsUpdating(id);
    const token = localStorage.getItem("authToken");

    try {
      await axios.put(
        `${BACKEND_URL}/cart/${id}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = async (id: string) => {
    setIsRemoving(id);
    const token = localStorage.getItem("authToken");

    try {
      await axios.delete(`${BACKEND_URL}/cart/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCart();
    } catch (err) {
      console.error("Error removing item", err);
    } finally {
      setIsRemoving(null);
    }
  };

  const clearCart = async () => {
    const confirmed = window.confirm("Are you sure you want to clear your cart?");
    if (!confirmed) return;
    
    setIsClearing(true);
    const token = localStorage.getItem("authToken");

    try {
      await axios.delete(`${BACKEND_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCart();
    } catch (err) {
      console.error("Error clearing cart", err);
    } finally {
      setIsClearing(false);
    }
  };

  const handlePlaceOrder = () => {
    navigate("/order-review", {
      state: {
        cartItems,
        total: calculateTotal(cartItems),
      },
    });
  };

  const total = calculateTotal(cartItems);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppBar />
      
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md overflow-hidden mb-8">
            <div className="px-6 py-8 md:px-10 text-white">
              <h1 className="text-3xl font-extrabold">Shopping Cart</h1>
              <p className="mt-2 text-indigo-100">
                {cartItems.length === 0
                  ? "Your cart is empty"
                  : `You have ${itemCount} item${itemCount !== 1 ? "s" : ""} in your cart`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="flex flex-col items-center justify-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet</p>
                <Link to="/products" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150 shadow-md hover:shadow-lg">
                  Browse Products
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Cart Items</h2>
                  </div>
                  <ul className="divide-y divide-gray-100">
              {[...cartItems].reverse().map((item) => (
                      <li key={item.id} className="p-6">
                        <div className="flex flex-col sm:flex-row">
                          {/* Product Image */}
                          <div className="flex-shrink-0 rounded-lg overflow-hidden w-full sm:w-32 h-32 bg-gray-100 mb-4 sm:mb-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 sm:ml-6 flex flex-col">
                            <div className="flex flex-col sm:flex-row sm:justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 line-clamp-2">
                                  <Link to={`/products/${item.productId}`}>
                                    {item.product.name}
                                  </Link>
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  {item.product.brand?.name || "Brand"}
                                </p>
                              </div>
                              <div className="mt-1 sm:mt-0">
                                <p className="text-lg font-bold text-indigo-600">
                                  ₹{item.product.price.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 space-y-4 sm:space-y-0">
                              {/* Quantity Selector */}
                              <div className="flex items-center">
                                <span className="text-sm text-gray-600 mr-3">Quantity:</span>
                                <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition rounded-l-lg disabled:opacity-50"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1 || isUpdating === item.id}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <span className="w-10 text-center font-medium text-gray-700">
                                    {isUpdating === item.id ? (
                                      <div className="h-5 w-5 mx-auto border-t-2 border-indigo-500 rounded-full animate-spin"></div>
                                    ) : (
                                      item.quantity
                                    )}
                                  </span>
                                  <button
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition rounded-r-lg disabled:opacity-50"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={isUpdating === item.id}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              
                              {/* Price & Remove Button */}
                              <div className="flex items-center justify-between sm:justify-end space-x-4">
                                <p className="text-sm font-medium text-gray-700">
                                  Subtotal: <span className="text-gray-900 font-semibold">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                                </p>
                                <button
                                  className="text-red-500 hover:text-red-700 transition flex items-center disabled:opacity-50"
                                  onClick={() => removeItem(item.id)}
                                  disabled={isRemoving === item.id}
                                >
                                  {isRemoving === item.id ? (
                                    <div className="h-4 w-4 mr-1 border-t-2 border-red-500 rounded-full animate-spin"></div>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  )}
                                  Remove
                      </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {cartItems.length > 0 && (
                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                      <button
                        className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center disabled:opacity-50"
                        onClick={clearCart}
                        disabled={isClearing}
                      >
                        {isClearing ? (
                          <div className="h-4 w-4 mr-2 border-t-2 border-red-500 rounded-full animate-spin"></div>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                        Clear Cart
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
                      <span className="text-gray-900 font-medium">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                  </div>
                  
                  <div className="my-6 border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-indigo-600">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                      onClick={handlePlaceOrder}
                      disabled={cartItems.length === 0}
                      className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Proceed to Checkout
                  </button>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">We Accept</h3>
                    <div className="flex space-x-2">
                      <div className="bg-gray-100 p-2 rounded">
                        <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="40" height="24" rx="4" fill="#E6E6E6"/>
                          <path d="M15.4 14.8C15.4 16.5673 13.9673 18 12.2 18C10.4327 18 9 16.5673 9 14.8C9 13.0327 10.4327 11.6 12.2 11.6C13.9673 11.6 15.4 13.0327 15.4 14.8Z" fill="#EB001B"/>
                          <path d="M31 14.8C31 16.5673 29.5673 18 27.8 18C26.0327 18 24.6 16.5673 24.6 14.8C24.6 13.0327 26.0327 11.6 27.8 11.6C29.5673 11.6 31 13.0327 31 14.8Z" fill="#F79E1B"/>
                          <path d="M23.4 7.4H16.6V18H23.4V7.4Z" fill="#FF5F00"/>
                        </svg>
                      </div>
                      <div className="bg-gray-100 p-2 rounded">
                        <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="40" height="24" rx="4" fill="#E6E6E6"/>
                          <path d="M21.5 8.2L19.3 16H17.1L19.3 8.2H21.5ZM31 14.3L32.2 11.1L32.8 14.3H31ZM33.7 16H35.8L33.9 8.2H32.1C31.6 8.2 31.2 8.5 31 8.9L27.7 16H30L30.5 14.6H33.4L33.7 16ZM27.6 13.2C27.6 10.5 24.3 10.3 24.3 9.2C24.3 8.8 24.7 8.4 25.5 8.3C26.9 8.2 28 8.6 28.8 9L29.4 7.2C28.6 6.9 27.5 6.6 26.3 6.6C24 6.6 22.3 7.8 22.3 9.7C22.3 11.9 25.6 12.1 25.6 13.2C25.6 13.7 25 14 24.2 14C22.7 14 21.7 13.5 20.9 13.1L20.3 15C21.1 15.4 22.4 15.7 23.6 15.7C26 15.7 27.6 14.5 27.6 13.2ZM16.8 8.2L13.1 16H10.8L9 9.7C8.9 9.3 8.7 9.1 8.3 8.9C7.5 8.6 6.2 8.3 5 8.1L5.1 7.9H8.8C9.3 7.9 9.7 8.3 9.8 8.8L10.8 13.5L13.2 7.9H16.8V8.2Z" fill="#2566AF"/>
                        </svg>
                      </div>
                      <div className="bg-gray-100 p-2 rounded">
                        <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="40" height="24" rx="4" fill="#E6E6E6"/>
                          <path d="M27.34 6.3H22.9V17.68H27.34V6.3Z" fill="#3C8AF0"/>
                          <path d="M23.28 12C23.28 9.548 24.384 7.336 26.12 6.3C25.02 5.468 23.652 5 22.18 5C18.508 5 15.5 8.14 15.5 12C15.5 15.86 18.508 19 22.18 19C23.652 19 25.02 18.532 26.12 17.7C24.384 16.664 23.28 14.452 23.28 12Z" fill="#3C8AF0"/>
                          <path d="M34.4997 12C34.4997 15.86 31.4918 19 27.8198 19C26.3478 19 24.9797 18.532 23.8797 17.7C25.6158 16.664 26.7198 14.452 26.7198 12C26.7198 9.548 25.6158 7.336 23.8797 6.3C24.9797 5.468 26.3478 5 27.8198 5C31.4918 5 34.4997 8.14 34.4997 12Z" fill="#3C8AF0"/>
                        </svg>
                      </div>
                      <div className="bg-gray-100 p-2 rounded">
                        <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="40" height="24" rx="4" fill="#E6E6E6"/>
                          <path d="M17 17.5H13V10.5H17V17.5ZM15 9C14.17 9 13.5 8.33 13.5 7.5C13.5 6.67 14.17 6 15 6C15.83 6 16.5 6.67 16.5 7.5C16.5 8.33 15.83 9 15 9ZM27 17.5H23V14C23 13.01 22.99 11.7 21.5 11.7C19.99 11.7 19.75 12.81 19.75 13.95V17.5H15.75V10.5H19.5V12H19.55C19.95 11.17 21.03 10.3 22.5 10.3C26.5 10.3 27 12.33 27 14.98V17.5Z" fill="#0077B7"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
            </div>
        )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
};