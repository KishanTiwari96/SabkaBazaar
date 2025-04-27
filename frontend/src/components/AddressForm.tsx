import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { showNotification } from "./Notification";

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
  const [saving, setSaving] = useState(false);

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
          showNotification({
            message: "Failed to fetch user data. Please try again.",
            type: "error"
          });
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
    } else if (!/^\d{6}$/.test(address.pincode)) {
      newErrors.pincode = "Pincode must be a 6-digit number";
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
      showNotification({
        message: "Please log in to save the address",
        type: "warning"
      });
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);
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
        showNotification({
          message: "Failed to save the address. Please try again.",
          type: "error"
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const commonStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
    "West Bengal", "Delhi", "Jammu and Kashmir"
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white shadow-xl rounded-3xl p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded-full w-1/2 mb-8 mx-auto"></div>
            
            <div className="h-20 bg-gray-100 rounded-2xl mb-8 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-xl mt-8"></div>
            </div>
          </div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-extrabold">Shipping Address</h1>
                <p className="mt-1 opacity-80">Please provide your delivery details</p>
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
                  <div className="w-10 h-10 ring-4 ring-indigo-100 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold scale-110">3</div>
                  <span className="text-xs mt-1 font-medium text-indigo-600">Address</span>
                </div>
                <div className="flex-1 h-1 bg-indigo-200 mx-2"></div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center font-bold">4</div>
                  <span className="text-xs mt-1 text-gray-400">Payment</span>
                </div>
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-100 transform transition-all hover:shadow-md">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  Customer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div className="flex items-center">
                    <span className="text-gray-500 font-medium mr-2">Name:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 font-medium mr-2">Email:</span>
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Address Form */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </span>
                Shipping Address
              </h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      id="street"
                      type="text"
                      placeholder="Enter your street address"
                      className={`w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.street ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    />
                  </div>
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.street}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <input
                        id="city"
                        type="text"
                        placeholder="Enter your city"
                        className={`w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.city ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      />
                    </div>
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                      Pin Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <input
                        id="pincode"
                        type="text"
                        placeholder="Enter your 6-digit pin code"
                        className={`w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${errors.pincode ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                        value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        maxLength={6}
                      />
                    </div>
                    {errors.pincode && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <select
                      id="state"
                      className={`w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none bg-white ${errors.state ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    >
                      <option value="">Select your state</option>
                      {commonStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.state}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg text-lg font-semibold transition-all duration-300 hover:shadow-xl flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    Continue to Payment
                  </>
                )}
              </button>
              <button
                onClick={() => navigate("/order-review", { state: { cartItems, total, productId } })}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-xl shadow-sm text-lg font-semibold transition-all duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Back to Order Review
              </button>
            </div>

            {/* Secure Notice */}
            <div className="mt-8 flex items-center justify-center text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Your information is secure and encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};