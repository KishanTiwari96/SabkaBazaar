import { useState } from "react";
import { Link } from "react-router-dom";

export const Categories = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const categories = ["Watches", "Electronics", "Sports", "Toys"];

  return (
    <div className="relative mr-4">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-1 font-medium hover:text-emerald-600 transition cursor-pointer text-green-600"
      >
        Categories
      </button>

      {isDropdownOpen && (
        <div className="absolute mt-2 w-36 bg-white shadow-lg rounded-lg z-70">
          <ul className="p-2">
            {categories.map((cat) => (
              <li
                key={cat}
                className="px-4 py-2 hover:bg-emerald-50 cursor-pointer rounded-md transition"
              >
                <Link
                  to={`/category/${cat.toLowerCase()}`} // Ensure lowercase for consistency
                  onClick={() => setIsDropdownOpen(false)} // Close dropdown on link click
                  className="block w-full h-full"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};