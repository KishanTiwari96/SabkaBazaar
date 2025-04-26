import { FaFacebook, FaXTwitter, FaYoutube, FaInstagram, FaPinterest, FaLinkedin, FaEnvelope, FaPhone, FaLocationDot } from "react-icons/fa6";
import { FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcApplePay, FaGooglePay } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-white to-gray-100 text-gray-700 pt-12 pb-6 border-t border-gray-200 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section with Logo and Newsletter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-10 border-b border-gray-200">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              SabkaBazaar
            </h2>
            <p className="mt-2 text-sm text-gray-600 max-w-md">
              Your one-stop destination for all your shopping needs. Quality products at unbeatable prices.
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Subscribe to our newsletter</h3>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-4 py-3 w-full md:w-64 rounded-l-lg focus:outline-none border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-r-lg font-medium transition-all duration-200 transform hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10">
          {/* About */}
          <div>
            <h4 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200">About Us</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center cursor-default">
                  <span className="mr-2">›</span> Our Story
                </span>
              </li>
              <li>
                <span className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center cursor-default">
                  <span className="mr-2">›</span> Our Team
                </span>
              </li>
              <li>
                <span className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center cursor-default">
                  <span className="mr-2">›</span> Careers
                </span>
              </li>
              <li>
                <span className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center cursor-default">
                  <span className="mr-2">›</span> Press & Media
                </span>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center cursor-default">
                  <span className="mr-2">›</span> Help Center
                </span>
              </li>
              <li>
                <span className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center cursor-default">
                  <span className="mr-2">›</span> Shipping & Delivery
                </span>
              </li>
              <li>
                <span className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center cursor-default">
                  <span className="mr-2">›</span> Returns & Refunds
                </span>
              </li>
              <li>
                <span className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center cursor-default">
                  <span className="mr-2">›</span> FAQ
                </span>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200">Policies</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center cursor-default">
                  <span className="mr-2">›</span> Terms of Service
                </span>
              </li>
              <li>
                <span className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center cursor-default">
                  <span className="mr-2">›</span> Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center cursor-default">
                  <span className="mr-2">›</span> Security
                </span>
              </li>
              <li>
                <span className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center cursor-default">
                  <span className="mr-2">›</span> Cookie Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaLocationDot className="mr-3 text-indigo-600 mt-1 flex-shrink-0" />
                <span className="text-gray-600">123 Shopping Avenue, New Delhi, India, 110001</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3 text-indigo-600 flex-shrink-0" />
                <span className="text-gray-600">+91 1234 567 890</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-indigo-600 flex-shrink-0" />
                <span className="text-gray-600">support@sabkabazaar.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Social Media and Payment Methods */}
        <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-gray-200">
          {/* Social Media Icons */}
          <div className="mb-6 md:mb-0">
            <h5 className="text-sm font-semibold mb-3 text-gray-800 text-center md:text-left">Connect with us</h5>
            <div className="flex space-x-4">
              <span aria-label="Facebook" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-[#1877F2] text-gray-600 hover:text-white transform hover:scale-110 transition-all duration-200 cursor-default">
                <FaFacebook className="text-xl" />
              </span>
              <span aria-label="Twitter/X" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-black text-gray-600 hover:text-white transform hover:scale-110 transition-all duration-200 cursor-default">
                <FaXTwitter className="text-xl" />
              </span>
              <span aria-label="Instagram" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-gray-600 hover:text-white transform hover:scale-110 transition-all duration-200 cursor-default">
                <FaInstagram className="text-xl" />
              </span>
              <span aria-label="YouTube" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-[#FF0000] text-gray-600 hover:text-white transform hover:scale-110 transition-all duration-200 cursor-default">
                <FaYoutube className="text-xl" />
              </span>
              <span aria-label="LinkedIn" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-[#0A66C2] text-gray-600 hover:text-white transform hover:scale-110 transition-all duration-200 cursor-default">
                <FaLinkedin className="text-xl" />
              </span>
              <span aria-label="Pinterest" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-[#E60023] text-gray-600 hover:text-white transform hover:scale-110 transition-all duration-200 cursor-default">
                <FaPinterest className="text-xl" />
              </span>
            </div>
          </div>
          
          {/* Payment Methods - Updated to use React icons instead of external images */}
          <div>
            <h5 className="text-sm font-semibold mb-3 text-gray-800 text-center md:text-left">Secure Payments</h5>
            <div className="flex items-center justify-center md:justify-end space-x-4">
              <FaCcVisa className="h-9 w-auto text-[#1434CB] hover:scale-110 transition-all duration-200" />
              <FaCcMastercard className="h-9 w-auto text-[#EB001B] hover:scale-110 transition-all duration-200" />
              <FaCcPaypal className="h-9 w-auto text-[#003087] hover:scale-110 transition-all duration-200" />
              <FaCcApplePay className="h-9 w-auto text-[#000000] hover:scale-110 transition-all duration-200" />
              <FaGooglePay className="h-9 w-auto text-[#5F6368] hover:scale-110 transition-all duration-200" />
            </div>
          </div>
        </div>
        
        {/* Copyright and Bottom Links */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center">
          <div className="flex flex-wrap justify-center mb-4 space-x-4 text-sm text-gray-500">
            <span className="hover:text-indigo-600 transition-colors cursor-default">Terms</span>
            <span>·</span>
            <span className="hover:text-indigo-600 transition-colors cursor-default">Privacy</span>
            <span>·</span>
            <span className="hover:text-indigo-600 transition-colors cursor-default">Cookies</span>
            <span>·</span>
            <span className="hover:text-indigo-600 transition-colors cursor-default">Accessibility</span>
          </div>
          <p className="text-sm text-gray-500">
            © {currentYear} SabkaBazaar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;