import { useState, useEffect } from "react";
import { useUser } from "./UserContext";

export const UserMenu = () => {
  const { user, setUser } = useUser();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("authToken");
      setUser(null);
      setOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (open && !e.target.closest(".UserMenu")) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative inline-block text-left z-50 UserMenu">
      {/* Name Button */}
      <div
        className="cursor-pointer px-4 py-2 min-w-[70px] bg-gray-200 rounded-md hover:bg-gray-300 text-center"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        {user.name}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-1 w-full bg-white border rounded-b-md shadow-lg z-60"
        >
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
