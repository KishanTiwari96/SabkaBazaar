import { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { Link } from "react-router-dom";

interface UserMenuProps {
  isMobile?: boolean;
}

export const UserMenu = ({ isMobile = false }: UserMenuProps) => {
  const { user, setUser } = useUser();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("authToken");
      setUser(null);
      setOpen(false);
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (open && !e.target.closest(".UserMenu") && !showLogoutConfirm) {
        setOpen(false);
      }
      
      // Don't close the menu if logout confirm is showing
      if (showLogoutConfirm && !e.target.closest(".LogoutConfirm") && !e.target.closest(".LogoutButton")) {
        setShowLogoutConfirm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, showLogoutConfirm]);

  if (!user) return null;

  // Get first letter of name for avatar fallback
  const nameInitial = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className={`${isMobile ? 'block' : 'relative inline-block z-50'} UserMenu`}>
      {/* Profile Button */}
      <div
        className="cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.onerror = null;
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = "w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm";
                fallback.innerText = nameInitial;
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
            {nameInitial}
          </div>
        )}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-800">{user.name}</span>
          <span className="text-xs text-gray-500 hidden sm:inline">My Account</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={`
            bg-white rounded-lg shadow-xl z-60 border border-gray-200 overflow-hidden transform transition-all duration-200 ease-out
            ${isMobile ? 'static mt-2 w-full' : 'absolute mt-2 w-64 right-0'}
          `}
        >
          {/* User Info Section */}
          <div className="px-4 py-3 bg-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = "w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-lg font-medium shadow-md";
                      fallback.innerText = nameInitial;
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-lg font-medium shadow-md">
                  {nameInitial}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">{user.name}</span>
                <span className="text-xs text-gray-500 truncate max-w-[160px]">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link to="/profile"
              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>

            <Link to="/my-orders"
              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              My Orders
            </Link>

            <hr className="my-1 border-gray-200" />

            <button
              onClick={confirmLogout}
              className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors LogoutButton"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 animate-fadeIn LogoutConfirm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-red-100 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800">Log Out</h3>
            </div>
            
            <p className="text-gray-600 mb-5">
              Are you sure you want to log out?
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
