import { BACKEND_URL } from "../config";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadRazorpay } from "./LoadRazorpay";
import { showNotification } from "./Notification";

export const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, total, productId } = location.state || {};
  const [user, setUser] = useState<any>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

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

  const calculateSubtotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((acc: number, item: any) => 
      acc + (item.product.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.05);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 500 ? 0 : 50;
  };

  const handleConfirmOrder = async () => {
    try {
      setLoading(true);
      // Step 1: Load Razorpay SDK
      const isScriptLoaded = await loadRazorpay();
      if (!isScriptLoaded) {
        showNotification({
          message: "Failed to load Razorpay SDK. Please try again.",
          type: "error"
        });
        setLoading(false);
        return;
      }
  
      const token = localStorage.getItem("authToken");
  
      if (!token) {
        showNotification({
          message: "You need to log in to place an order",
          type: "warning"
        });
        navigate("/login");
        setLoading(false);
        return;
      }
  
      // Step 2: Create Razorpay Order (Server-side API call)
      const createOrderRes = await axios.post(
        `${BACKEND_URL}/create-razorpay-order`,
        {
          amount: total,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const { orderId, amount, currency } = createOrderRes.data;
      setLoading(false);
      setProcessingPayment(true);
    
      const keyRes = await axios.get(`${BACKEND_URL}/razorpay-key`);
      const { key } = keyRes.data;

      // Step 3: Configure Razorpay Checkout
      const options = {
        key, // Your Razorpay Key ID
        amount: amount.toString(),
        currency,
        name: "SabkaBazaar",
        description: "Complete your purchase",
        order_id: orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        handler: async (response: any) => {
          try {
            // Step 4: Verify payment with backend and store order in DB
            const verifyRes = await axios.post(
              `${BACKEND_URL}/razorpay/verify`,
              {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                items: cartItems.map((item: any) => ({
                  productId: item.product.id,
                  quantity: item.quantity,
                  productPrice: item.product.price,
                  userId: user.id,
                })),
                total,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
  
            const verifyData = verifyRes.data;
            if (verifyData.success) {
              // Step 5: Show success message and navigate to "My Orders"
              setOrderSuccess(true);
              showNotification({
                message: "Payment successful! Your order has been placed.",
                type: "success",
                duration: 5000
              });
              setTimeout(() => navigate("/my-orders"), 3000);
            } else {
              showNotification({
                message: "Payment verification failed.",
                type: "error"
              });
              setProcessingPayment(false);
            }
          } catch (err) {
            console.error("Payment verification failed", err);
            showNotification({
              message: "Payment verification failed.",
              type: "error"
            });
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
          }
        },
        theme: {
          color: "#4F46E5", // Indigo color matching our theme
        },
      };
  
      // Open Razorpay payment gateway
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment process failed", err);
      showNotification({
        message: "Failed to initiate payment.",
        type: "error"
      });
      setLoading(false);
      setProcessingPayment(false);
    }
  };
  
  if (orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-ping absolute h-32 w-32 rounded-full bg-green-400 opacity-30"></div>
          </div>
          <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-full p-6 shadow-lg relative z-10">
          <svg
              className="w-20 h-20 text-white"
            fill="none"
            stroke="currentColor"
              strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold mt-8 text-gray-800 animate-fade-in">
          Order Placed Successfully!
        </h2>
        <p className="text-gray-600 mt-4 text-base sm:text-lg max-w-md">
          Thank you for your purchase. Your order has been confirmed!
        </p>
        <p className="text-indigo-600 font-medium mt-2 animate-pulse">
          Redirecting to your orders...
        </p>
        <button 
          onClick={() => navigate("/my-orders")}
          className="mt-8 px-6 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all duration-300"
        >
          View My Orders
        </button>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Items to Checkout</h2>
          <p className="text-gray-600 mb-6">Your cart is empty. Please add items to your cart before proceeding to payment.</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow transition duration-300 hover:from-indigo-700 hover:to-purple-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-extrabold">Payment</h1>
                <p className="mt-1 opacity-80">Complete your order with secure payment</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Progress Tracker */}
            <div className="mb-10">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">1</div>
                  <span className="text-xs mt-1 text-gray-600">Cart</span>
                </div>
                <div className="flex-1 h-1 bg-indigo-200 mx-2">
                  <div className="h-full bg-indigo-600 w-full"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">2</div>
                  <span className="text-xs mt-1 text-gray-600">Review</span>
                </div>
                <div className="flex-1 h-1 bg-indigo-200 mx-2">
                  <div className="h-full bg-indigo-600 w-full"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">3</div>
                  <span className="text-xs mt-1 text-gray-600">Address</span>
                </div>
                <div className="flex-1 h-1 bg-indigo-200 mx-2">
                  <div className="h-full bg-indigo-600 w-full"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 ring-4 ring-indigo-100 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold scale-110">4</div>
                  <span className="text-xs mt-1 font-medium text-indigo-600">Payment</span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
                Order Summary
              </h2>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="max-h-48 overflow-y-auto mb-4 pr-2 space-y-3">
                  {cartItems.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                          {item.product.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-semibold text-gray-800">{item.product.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-800">₹{item.product.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{calculateSubtotal()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="font-medium">₹{calculateTax()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    {calculateShipping() === 0 ? (
                      <span className="font-medium text-green-600">FREE</span>
                    ) : (
                      <span className="font-medium">₹{calculateShipping()}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-gray-200 mt-2">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="font-bold text-indigo-600">₹{total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </span>
                Payment Method
              </h2>

              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Razorpay Secure Payment</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-white text-opacity-80 mb-6">
                  Your payment is secure with industry-standard encryption. Click below to proceed with the payment gateway.
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="bg-white/20 p-2 rounded-md flex items-center justify-center w-14">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="bg-white/20 p-2 rounded-md flex items-center justify-center w-14">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="bg-white/20 p-2 rounded-md flex items-center justify-center w-14">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Action */}
            <div className="flex justify-center mb-4">
        <button
          onClick={handleConfirmOrder}
                disabled={loading || processingPayment}
                className={`relative w-full max-w-md py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 
                  ${loading || processingPayment ? 'opacity-80 cursor-not-allowed' : 'hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transform hover:-translate-y-1'}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Preparing Payment...
                  </div>
                ) : processingPayment ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Pay with Razorpay • ₹{total}
                  </div>
                )}
                {!loading && !processingPayment && (
                  <span className="absolute top-0 right-0 mt-1 mr-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                )}
              </button>
            </div>

            {/* Back Button */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/address", { state: { cartItems, total, productId } })}
                disabled={loading || processingPayment}
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Address
        </button>
            </div>

            {/* Secure Payment Notice */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Secure Payment</span>
              </div>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Your payment information is processed securely. We do not store credit card details or share customer information with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
