import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";

export const Address = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, total, productId } = location.state || {};

  const [address, setAddress] = useState({
    street: "",
    city: "",
    pincode: "",
    state: "",
  });
  const [errors, setErrors] = useState({
    street: "",
    city: "",
    pincode: "",
    state: "",
  });
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndAddress = async () => {
      const token = localStorage.getItem("authToken");
      console.log("Token:", token); // Debug: Log the token
      if (!token) {
        console.log("No token found, redirecting to login");
        setLoading(false);
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      try {
        // Fetch user info, which includes address
        console.log("Fetching user from:", `${BACKEND_URL}/me`);
        const userRes = await axios.get(`${BACKEND_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("User response:", userRes.data); // Debug: Log response
        const fetchedUser = userRes.data.user;
        if (fetchedUser) {
          setUser({ name: fetchedUser.name, email: fetchedUser.email });
          if (fetchedUser.address) {
            setAddress(fetchedUser.address);
          }
        } else {
          throw new Error("No user data in response");
        }
      } catch (error: any) {
        console.error("Failed to fetch user:", error);
        if (error.response?.status === 401) {
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
    fetchUserAndAddress();
  }, [navigate, location.pathname]);

  const validateForm = () => {
    const newErrors = {
      street: "",
      city: "",
      pincode: "",
      state: "",
    };
    let isValid = true;

    if (!address.street.trim()) {
      newErrors.street = "Street address is required";
      isValid = false;
    }
    if (!address.city.trim()) {
      newErrors.city = "City is required";
      isValid = false;
    }
    if (!address.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
      isValid = false;
    }
    if (!address.state.trim()) {
      newErrors.state = "State is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Please log in to save the address");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!validateForm()) {
      alert("Please fill out all address fields");
      return;
    }

    try {
      await axios.put(`${BACKEND_URL}/user/address`, address, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/payment", { state: { cartItems, total, productId } });
    } catch (error: any) {
      console.error("Error saving address:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/login", { state: { from: location.pathname } });
      } else {
        alert("Failed to save the address. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white shadow-lg rounded-2xl p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6 mx-auto"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 font-sans">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-800">
        📍 Shipping Address
      </h1>

      {/* User Info */}
      {user ? (
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
            👤 User Information
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
      ) : (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-8 text-center">
          Please log in to view your user information.
        </div>
      )}

      {/* Address Form */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          🏠 Enter Your Address
        </h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              id="street"
              type="text"
              placeholder="Enter your street address"
              className={`w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.street ? "border-red-500" : "border-gray-300"
                }`}
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
            />
            {errors.street && (
              <p className="text-red-500 text-sm mt-1">{errors.street}</p>
            )}
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              id="city"
              type="text"
              placeholder="Enter your city"
              className={`w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.city ? "border-red-500" : "border-gray-300"
                }`}
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>
          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
              Pincode
            </label>
            <input
              id="pincode"
              type="text"
              placeholder="Enter your pincode"
              className={`w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.pincode ? "border-red-500" : "border-gray-300"
                }`}
              value={address.pincode}
              onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
            />
            {errors.pincode && (
              <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
            )}
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              id="state"
              type="text"
              placeholder="Enter your state"
              className={`w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.state ? "border-red-500" : "border-gray-300"
                }`}
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl shadow-lg text-lg font-semibold transition-transform hover:scale-105"
          >
            Save and Proceed to Payment
          </button>
        </form>
      </div>

      {/* Go Back to Order Review */}
      <div className="text-center mt-6">
        <button
          onClick={() => navigate("/order-review", { state: { cartItems, total, productId } })}
          className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl shadow-sm text-lg font-semibold transition-transform hover:scale-105"
        >
          🔙 Back to Order Review
        </button>
      </div>
    </div>
  );
};