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

  // Close menu when navigating
  useEffect(() => {
    const handleBodyClick = (e: MouseEvent) => {
      if (menuOpen && !(e.target as Element).closest('.mobile-menu-container')) {
        setMenuOpen(false);
      }
    };
    
    document.body.addEventListener('click', handleBodyClick);
    return () => document.body.removeEventListener('click', handleBodyClick);
  }, [menuOpen]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <nav className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap">
          {/* Logo */}
          <div className="flex-shrink-0 mr-4">
            <Link to="/" className="group flex items-center">
              <div className="mr-2 bg-gradient-to-r from-emerald-500 to-blue-600 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                <svg className="w-5 h-5 text-white sm:w-6 sm:h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
              <div>
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-none tracking-tight">
                  <span className="text-emerald-600">Sabka</span>
                  <span className="text-blue-800">Bazaar</span>
                </div>
                <div className="text-[8px] sm:text-[10px] text-gray-500 uppercase tracking-widest">Premium Shopping</div>
              </div>
            </Link>
          </div>

          {/* Hamburger (Mobile) */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              aria-label="Toggle navigation"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Search Bar - Full Width on Mobile */}
          <div className="order-3 lg:order-2 w-full lg:w-auto lg:flex-1 lg:max-w-md lg:mx-6 mt-3 lg:mt-0">
            <div className="relative">
              <input
                className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 placeholder-gray-400"
                type="text"
                placeholder="Search for products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearch}
              />
              <button
                onClick={() => {
                  if (searchTerm.trim()) {
                    navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
                    setMenuOpen(false);
                  }
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Links and UserMenu - Desktop */}
          <div className="hidden lg:flex order-2 lg:order-3 items-center space-x-4">
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-emerald-600 text-sm font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-emerald-500 after:transition-all">
                Home
              </Link>
              <button
                onClick={() => {
                  const section = document.getElementById('shop-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-600 hover:text-emerald-600 text-sm font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-emerald-500 after:transition-all"
              >
                Shop
              </button>
              <Categories />
              <Link to="/cart" className="text-gray-600 hover:text-emerald-600 text-sm font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-emerald-500 after:transition-all">
                My Cart
              </Link>
              <Link to="/my-orders" className="text-gray-600 hover:text-emerald-600 text-sm font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-emerald-500 after:transition-all">
                My Orders
              </Link>
            </div>

            {/* User Menu (Desktop) */}
            <div>
              {user ? (
                <UserMenu />
              ) : (
                <div className="flex space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 font-medium rounded-md text-sm px-4 py-2 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 font-medium rounded-md text-sm px-4 py-2 shadow-sm hover:shadow transition-all"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden bg-white shadow-lg transition-all duration-300 ease-in-out mobile-menu-container ${
          menuOpen ? 'max-h-[80vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 invisible overflow-hidden'
        }`}
      >
        <ul className="flex flex-col p-4">
          <Link
            to="/"
            className="text-gray-600 hover:text-emerald-600 hover:bg-gray-50 text-sm font-medium py-3 px-4 rounded-md transition-colors"
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
            className="text-left text-gray-600 hover:text-emerald-600 hover:bg-gray-50 text-sm font-medium py-3 px-4 rounded-md transition-colors"
          >
            Shop
          </button>
          <div className="py-2">
            <Categories isMobile={true} />
          </div>
          <Link
            to="/cart"
            className="text-gray-600 hover:text-emerald-600 hover:bg-gray-50 text-sm font-medium py-3 px-4 rounded-md transition-colors flex items-center"
            onClick={() => setMenuOpen(false)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            My Cart
          </Link>
          <Link
            to="/my-orders"
            className="text-gray-600 hover:text-emerald-600 hover:bg-gray-50 text-sm font-medium py-3 px-4 rounded-md transition-colors flex items-center"
            onClick={() => setMenuOpen(false)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            My Orders
          </Link>
        </ul>
        <div className="p-4 border-t border-gray-100">
          {user ? (
            <UserMenu isMobile={true} />
          ) : (
            <div className="flex flex-col space-y-2">
              <Link
                to="/login"
                className="text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 font-medium rounded-md text-sm py-2 text-center transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 font-medium rounded-md text-sm py-2 text-center shadow-sm hover:shadow transition-all"
                onClick={() => setMenuOpen(false)}
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