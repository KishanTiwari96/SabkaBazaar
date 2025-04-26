import { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { AppBar } from "./AppBar";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders, isGoogleUser } from "../utils/auth";

interface AddressData {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export const Profile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState<AddressData>({
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  // Determine if user is a Google user
  const [isUserFromGoogle, setIsUserFromGoogle] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch user profile if not available
    if (!user) {
      setLoading(true);
      axios.get(`${BACKEND_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      .then(res => {
        if (res.data.user) {
          setUser(res.data.user);
          // Check if this is a Google user
          setIsUserFromGoogle(isGoogleUser(res.data.user));
        } else {
          navigate("/login");
        }
      })
      .catch(() => {
        navigate("/login");
      })
      .finally(() => {
        setLoading(false);
      });
      return;
    }

    // Check if this is a Google user if user object exists
    setIsUserFromGoogle(isGoogleUser(user));
    
    setName(user.name || "");
    
    // Initialize address from user data if available
    if (user.address) {
      try {
        let parsedAddress;
        if (typeof user.address === 'string') {
          try {
            parsedAddress = JSON.parse(user.address);
          } catch {
            parsedAddress = {};
          }
        } else {
          parsedAddress = user.address;
        }
        
        setAddress({
          street: parsedAddress.street || "",
          city: parsedAddress.city || "",
          state: parsedAddress.state || "",
          pincode: parsedAddress.pincode || "",
          country: parsedAddress.country || "India",
        });
      } catch (error) {
        console.error("Error processing address:", error);
        setError("Could not load address information");
      }
    }
  }, [user, navigate, setUser]);

  

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setAddressLoading(true);
    setError("");
    
    try {
      // Create a data object with all the updates needed
      const updates = {
        name: name.trim(),
        address: address
      };
      
      // First update the name if it has changed
      if (name.trim() !== user.name) {
        const nameResponse = await axios.put(
          `${BACKEND_URL}/user/profile`,
          { name: updates.name },
          getAuthHeaders()
        );
        
        if (!nameResponse.data.success) {
          throw new Error("Failed to update name");
        }
      }

      // Update address using the /user/address endpoint
      const addressRes = await axios.put(
        `${BACKEND_URL}/user/address`,
        updates.address,
        getAuthHeaders()
      );

      if (addressRes.data.user) {
        // Update the user state with the returned data
        setUser({
          ...user,
          name: name.trim(), // Use the updated name
          address: addressRes.data.user.address,
        });
        
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        throw new Error("No user data returned from server");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError("Failed to update profile. Please try again.");
      alert("Failed to update profile. Please try again.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!user || !user.id) return;
    
    // Reset error
    setPasswordError("");
    
    // Validate password
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      // Call the API to set password
      const response = await axios.put(
        `${BACKEND_URL}/user/set-password`,
        { password },
        getAuthHeaders()
      );

      if (response.data.success) {
        setIsSettingPassword(false);
        setPassword("");
        setConfirmPassword("");
        alert("Password set successfully! You can now login with your email and password.");
      } else {
        throw new Error(response.data.error || "Failed to set password");
      }
    } catch (error) {
      console.error("Failed to set password:", error);
      setPasswordError("Failed to set password. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Animation helper functions
  const getTabClasses = (tabName: string) => {
    return `px-4 py-2 font-medium transition-all duration-200 rounded-lg ${
      activeTab === tabName
        ? "bg-indigo-600 text-white shadow-md"
        : "text-gray-700 hover:bg-gray-100"
    }`;
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppBar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center mt-16">
            {/* Animated placeholder for profile header */}
            <div className="w-full max-w-4xl relative mb-8 rounded-xl overflow-hidden shadow-md bg-white animate-pulse">
              <div className="h-48 w-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-50"></div>
              
              <div className="absolute top-32 left-8 border-4 border-white rounded-full shadow-xl">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                </div>
              </div>
              
              <div className="pt-20 pb-6 px-8">
                <div className="h-7 w-48 bg-gray-300 rounded-md mb-2"></div>
                <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
              </div>
            </div>
            
            {/* Loading indicator and message */}
            <div className="flex flex-col items-center py-10">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-600 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-700">Loading your profile</h3>
              <p className="text-gray-500 mt-2">Please wait a moment while we fetch your information</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Get first letter of name for avatar fallback
  const nameInitial = user.name ? user.name.charAt(0).toUpperCase() : "?";

  const isFormChanged = 
    (name !== user.name) || 
    (address.street !== (user.address?.street || "")) ||
    (address.city !== (user.address?.city || "")) ||
    (address.state !== (user.address?.state || "")) ||
    (address.pincode !== (user.address?.pincode || "")) ||
    (address.country !== (user.address?.country || "India"));


  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        
        {/* Profile header with cover image and avatar */}
        <div className="relative mb-8 rounded-xl overflow-hidden shadow-md bg-white">
          <div 
            className="h-48 w-full bg-gradient-to-r from-blue-500 to-indigo-600"
          />
          
          <div className="absolute top-32 left-8 border-4 border-white rounded-full shadow-xl">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-medium">
                {nameInitial}
              </div>
            )}
          </div>
          
          <div className="pt-20 pb-6 px-8">
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-indigo-600">{user.email}</p>
            {user.emailVerified && (
              <div className="mt-1 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </div>
            )}
            {isUserFromGoogle && (
              <div className="mt-1 inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full ml-2">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                Google Account
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={getTabClasses("profile")}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={getTabClasses("orders")}
          >
            Order History
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={getTabClasses("security")}
          >
            Security
          </button>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {activeTab === "profile" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-800 py-2">{user.name}</p>
                  )}
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <p className="text-gray-800 py-2">{user.email}</p>
                </div>

                {/* Address Fields */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Shipping Address</h4>
                  
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) => setAddress({...address, street: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({...address, city: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => setAddress({...address, state: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          value={address.pincode}
                          onChange={(e) => setAddress({...address, pincode: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          value={address.country}
                          onChange={(e) => setAddress({...address, country: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="India">India</option>
                          <option value="USA">United States</option>
                          <option value="UK">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {address.street ? (
                        <div>
                          <p className="text-gray-800">{address.street}</p>
                          <p className="text-gray-800">{address.city}, {address.state} {address.pincode}</p>
                          <p className="text-gray-800">{address.country}</p>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No address added yet</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={addressLoading || !isFormChanged}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {addressLoading ? "Saving..." : "Save All Changes"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Order History</h3>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/1144/1144760.png" 
                  alt="Orders"
                  className="w-24 h-24 mx-auto mb-4 opacity-30"
                />
                <h4 className="text-lg font-medium text-gray-700 mb-2">View your order history</h4>
                <p className="text-gray-500 mb-4">Track your previous purchases and check delivery status</p>
                <button 
                  onClick={() => navigate("/my-orders")}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Go to My Orders
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Security Settings</h3>
              
              <div className="space-y-6">
                {/* Password Management */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h4 className="font-medium text-gray-800">Password</h4>
                      {isUserFromGoogle ? (
                        <p className="text-gray-500 text-sm">
                          Set a password to also login with email and password
                        </p>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Update your password regularly to keep your account secure
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => setIsSettingPassword(!isSettingPassword)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors self-start md:self-auto"
                    >
                      {isUserFromGoogle ? "Set Password" : "Change Password"}
                    </button>
                  </div>
                  
                  {/* Password Form */}
                  {isSettingPassword && (
                    <div className="mt-4 border-t pt-4">
                      {passwordError && (
                        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                          {passwordError}
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isUserFromGoogle ? "New Password" : "New Password"}
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter password"
                        />
                        <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Confirm password"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          className="mr-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setIsSettingPassword(false);
                            setPassword("");
                            setConfirmPassword("");
                            setPasswordError("");
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSetPassword}
                          disabled={passwordLoading}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {passwordLoading ? "Saving..." : "Save Password"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
