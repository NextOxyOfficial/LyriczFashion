import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Send, Sparkles, ShoppingBag, Truck, Shield, Smartphone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { settingsAPI } from '../services/api'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [contactInfo, setContactInfo] = useState({ hotline: '19008188', email: 'support@lyriczfashion.com', address: 'Dhaka, Bangladesh' })

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const contact = await settingsAPI.getContactInfo()
        setContactInfo(contact)
      } catch (error) {
        console.error('Failed to fetch contact info:', error)
      }
    }
    fetchContactInfo()
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Stay Updated!</h3>
              <p className="text-emerald-50">Subscribe to get special offers, new designs, and exclusive deals.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">LyriczFashion</span>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Design your style, wear your story. Create custom T-shirts with our easy-to-use design studio or shop from talented designers.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Secure Shopping</span>
              <span className="mx-2">•</span>
              <Truck className="w-4 h-4 text-emerald-500" />
              <span>Fast Delivery</span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/designers" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Designers
                </Link>
              </li>
              <li>
                <Link to="/design-studio" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Design Studio
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Account</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/address-book" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Address Book
                </Link>
              </li>
              <li>
                <Link to="/seller" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Become Seller
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/wholesale" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Wholesale Inquiry
                </Link>
              </li>
              <li>
                <Link to="/sell-your-design" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Sell Your Design
                </Link>
              </li>
              <li>
                <a href={`tel:${contactInfo.hotline}`} className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {contactInfo.hotline}
                </a>
              </li>
              <li>
                <a href={`mailto:${contactInfo.email}`} className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {contactInfo.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Info */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h5 className="text-sm font-bold text-white mb-3">We Accept</h5>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-2 bg-gray-800 rounded-lg text-xs font-semibold text-gray-300">Cash on Delivery</div>
                <div className="px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-500">bKash (Soon)</div>
                <div className="px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-500">Nagad (Soon)</div>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-3">Contact Info</h5>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>{contactInfo.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>Hotline: {contactInfo.hotline}</span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-3">Download App (Coming Soon)</h5>
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-gray-800 rounded-lg flex items-center gap-2 opacity-50">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs text-gray-400">App Store</span>
                </div>
                <div className="px-4 py-2 bg-gray-800 rounded-lg flex items-center gap-2 opacity-50">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs text-gray-400">Play Store</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; 2026 LyriczFashion. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
              <Link to="/help" className="hover:text-emerald-400 transition-colors">Help</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
