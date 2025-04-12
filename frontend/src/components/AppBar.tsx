import { Categories } from './Categories';
import { UserMenu } from './UserMenu';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useUser } from './UserContext';

export const AppBar = () => {
  const { user } = useUser(); // Get user from context
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchTerm.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-white via-[#f8f9fa] to-white backdrop-blur-md shadow-md border-b border-gray-200">
      <nav className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <div className="text-3xl md:text-4xl font-extrabold tracking-tight">
          <Link to="/" className="hover:opacity-90 transition">
            <span className="text-[#E63946] drop-shadow-sm">Sabka</span>
            <span className="text-[#1D3557]">Bazaar</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 lg:mx-6">
          <div className="relative">
            <input
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none transition-all placeholder-gray-400"
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
            />
            <button
              onClick={() => {
                if (searchTerm.trim()) {
                  navigate(`/category/all?search=${encodeURIComponent(searchTerm.trim())}`);
                  setMenuOpen(false);
                }
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Links and UserMenu */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 text-sm font-medium transition">
              Home
            </Link>
            <button
              onClick={() => {
                const section = document.getElementById('shop-section');
                section?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-gray-700 hover:text-blue-600 text-sm font-medium transition"
            >
              Shop
            </button>
            <Categories />
            <Link to="/cart" className="text-gray-700 hover:text-blue-600 text-sm font-medium transition">
              My Cart
            </Link>
            <Link to="/my-orders" className="text-gray-700 hover:text-blue-600 text-sm font-medium transition">
              My Orders
            </Link>
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden lg:block">
            {user ? (
              <UserMenu />
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-full text-sm px-4 py-1.5 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-full text-sm px-4 py-1.5 transition"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger (Mobile) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            aria-label="Toggle navigation"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden ${menuOpen ? 'block' : 'hidden'} bg-white shadow-md transition-all duration-300 ease-in-out overflow-y-auto`}
        style={{
          zIndex: 40,
          maxHeight: 'calc(100vh - 80px)',
        }}
      >
        <ul className="flex flex-col space-y-2 p-4">
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600 text-sm font-medium py-2"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              setTimeout(() => {
                const section = document.getElementById('shop-section');
                section?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="w-full text-left text-gray-700 hover:text-blue-600 text-sm font-medium py-2"
          >
            Shop
          </button>
          <Categories />
          <Link
            to="/cart"
            className="text-gray-700 hover:text-blue-600 text-sm font-medium py-2"
            onClick={() => setMenuOpen(false)}
          >
            My Cart
          </Link>
          <Link
            to="/my-orders"
            className="text-gray-700 hover:text-blue-600 text-sm font-medium py-2"
            onClick={() => setMenuOpen(false)}
          >
            My Orders
          </Link>
        </ul>
        <div className="p-4 border-t">
          {user ? (
            <UserMenu />
          ) : (
            <div className="flex space-x-2">
              <Link
                to="/login"
                className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-full text-sm px-4 py-1.5 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-full text-sm px-4 py-1.5 transition"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};