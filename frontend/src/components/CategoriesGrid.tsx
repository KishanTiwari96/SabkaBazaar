import { Link } from "react-router-dom";

const categories = [
  {
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2101&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Watches",
    image: "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1pYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Sports",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Utensils",
    image: "https://images.unsplash.com/flagged/photo-1554334162-2b5d9b31c882?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Men's Fashion",
    image: "https://plus.unsplash.com/premium_photo-1673734625879-2dd5410bc3e1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Women's Fashion",
    image: "https://plus.unsplash.com/premium_photo-1689575247968-d1040651e57f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Stationery",
    image: "https://images.unsplash.com/photo-1568301856220-8d0dc08a6d48?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Toys",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export const CategoryGrid = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h2
        id="shop-section"
        className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6"
      >
        Shop by Category
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {categories.map((category, index) => (
          <Link
            key={index}
            to={`/category/${encodeURIComponent(category.name.toLowerCase())}`}
            className="relative rounded-xl overflow-hidden shadow-md hover:scale-105 transition-transform duration-300 cursor-pointer group"
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-24 sm:h-32 md:h-36 object-cover transition-opacity group-hover:opacity-90"
            />
            <h3 className="text-center text-base sm:text-lg md:text-xl font-semibold text-gray-800 mt-2">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
};
