import { FaFacebook, FaXTwitter, FaYoutube, FaInstagram } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 py-10 mt-10 border-t">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* About */}
        <div>
          <h4 className="text-xl font-semibold mb-4">About</h4>
          <p className="text-sm">
            Welcome to our SabkaBazaar store. Discover the latest in fashion,
            electronics, and more — all in one place.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Consumer Policy</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Cancellation and Returns</a></li>
            <li><a href="#" className="hover:underline">Terms of use</a></li>
            <li><a href="#" className="hover:underline">Privacy</a></li>
            <li><a href="#" className="hover:underline">Security</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
          <p className="text-sm">Email: support@website.com</p>
          <p className="text-sm">Phone: +91 12345 67890</p>
          <p className="text-sm">Address: New Delhi, India</p>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-3 sm:space-x-4 text-lg sm:text-xl">
            <a href="#" className="hover:text-blue-600 transition-colors"><FaFacebook /></a>
            <a href="#" className="hover:text-black transition-colors"><FaXTwitter /></a>
            <a href="#" className="hover:text-red-600 transition-colors"><FaYoutube /></a>
            <a href="#" className="hover:text-pink-500 transition-colors"><FaInstagram /></a>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-6 sm:mt-8">
        © {new Date().getFullYear()} Website. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;