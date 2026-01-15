import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-white">LyriczFashion</span>
            </div>
            <p className="text-gray-400">
              T-shirt printing made easy. Print shirts for yourself or your online business.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/design-studio" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Design Studio
                </Link>
              </li>
              <li>
                <Link to="/seller" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Start Selling
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/design-studio" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Custom T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/seller" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Seller Center
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Browse Designs
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  My Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-400">
                <MapPin className="w-5 h-5 text-emerald-500" />
                <span>Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-5 h-5 text-emerald-500" />
                <span>+880 1234-567890</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-5 h-5 text-emerald-500" />
                <span>info@lyriczfashion.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 LyriczFashion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
