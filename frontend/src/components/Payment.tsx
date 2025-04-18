import { BACKEND_URL } from "../config";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadRazorpay } from "./LoadRazorpay";


export const Payment = () => {
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
      // Step 1: Load Razorpay SDK
      const isScriptLoaded = await loadRazorpay();
      if (!isScriptLoaded) {
        alert("Failed to load Razorpay SDK. Please try again.");
        return;
      }
  
      const token = localStorage.getItem("authToken");
  
      if (!token) {
        alert("You need to log in to place an order");
        navigate("/login");
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
          name: user.name,
          email: user.email,
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
                  productPrice: item.product.price, // Assuming product price is available
                  userId: user.id, // Assuming user data is available in the front-end
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
              setTimeout(() => navigate("/my-orders"), 3000);
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error("Payment verification failed", err);
            alert("Payment verification failed.");
          }
        },
        theme: {
          color: "#2563EB", // Customize Razorpay button color
        },
      };
  
      // Open Razorpay payment gateway
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment process failed", err);
      alert("Failed to initiate payment.");
    }
  };
  
  
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-6 py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Complete Your Payment
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Please confirm your order and proceed to payment using Razorpay
        </p>
        <button
          onClick={handleConfirmOrder}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
        >
          Confirm Order & Pay
        </button>
      </div>
    </div>
  );
};
