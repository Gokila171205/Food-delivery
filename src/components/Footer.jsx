import React from 'react';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-24 md:pb-16 border-t border-gray-800">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-6">
              <div className="bg-primary text-white p-1.5 rounded-lg font-bold text-lg">FR</div>
              <span className="font-extrabold text-2xl tracking-tight text-white">FoodRush</span>
            </a>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Delivering happiness to your doorstep, one meal at a time. The best food from top restaurants near you.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <FiFacebook />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <FiTwitter />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <FiInstagram />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <FiLinkedin />
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-primary transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors text-sm">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors text-sm">Help & Support</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider">For Restaurants</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-primary transition-colors text-sm">Partner with us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors text-sm">Business Dashboard</a></li>
            </ul>
          </div>

          {/* Links Col 3 */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-primary transition-colors text-sm">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-primary transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors text-sm">Refund Policy</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2026 FoodRush. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Made with ❤️ in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
