import { useState, useEffect } from "react";
import { useUser } from "./UserContext";

export const UserMenu = () => {
  const { user, setUser } = useUser();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Remove token from localStorage (or sessionStorage, depending on where you store it)
      localStorage.removeItem("authToken");  // or sessionStorage.removeItem("authToken");

      // Clear the user state in context
      setUser(null);

      setOpen(false); // Close dropdown after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close dropdown when clicking outside
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
      <div
        className="cursor-pointer px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        onClick={(e) => {
          e.stopPropagation(); // Prevent click from bubbling up
          setOpen(!open);
        }}
      >
        {user.name}
      </div>

      {open && (
        <div
          className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-60"
          style={{ minWidth: "120px", maxHeight: "200px", overflowY: "auto" }}
        >
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
