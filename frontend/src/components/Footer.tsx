import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, Send, Sparkles, ShoppingBag, Truck, Shield, Smartphone, Phone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { settingsAPI, toApiUrl } from '../services/api'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [siteSettings, setSiteSettings] = useState<any>({
    hotline: '19008188', email: 'support@lyriczfashion.com', address: 'Dhaka, Bangladesh',
    site_name: 'LyriczFashion', logo: null,
    meta_description: 'Design your style, wear your story. Create custom T-shirts with our easy-to-use design studio or shop from talented designers.',
  })

  useEffect(() => {
    settingsAPI.getContactInfo().then(data => {
      if (data) setSiteSettings(data)
    }).catch(() => {})
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
        <div className="max-w-[1480px] mx-auto px-0.5 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-center md:text-left px-2 sm:px-0">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Stay Updated!</h3>
              <p className="text-sm sm:text-base text-emerald-50">Subscribe to get special offers, new designs, and exclusive deals.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto px-2 sm:px-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 text-white text-sm sm:text-base rounded-xl hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-[1480px] mx-auto px-0.5 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2 px-2 sm:px-0 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4">
              {siteSettings.logo ? (
                <img src={toApiUrl(siteSettings.logo)} alt={siteSettings.site_name || 'Logo'} className="h-8 sm:h-10 w-auto object-contain" />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              )}
              {!siteSettings.logo && (
                <span className="text-xl sm:text-2xl font-bold text-white">{siteSettings.site_name || 'LyriczFashion'}</span>
              )}
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-4 leading-relaxed max-w-xs">
              {siteSettings.meta_description || 'Design your style, wear your story. Create custom T-shirts with our easy-to-use design studio or shop from talented designers.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
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
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
              <span>Secure Shopping</span>
              <span className="mx-1 sm:mx-2">•</span>
              <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
              <span>Fast Delivery</span>
            </div>
          </div>

          {/* Shop */}
          <div className="px-2 sm:px-0 text-center">
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white">Shop</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/products" className="text-sm sm:text-base text-gray-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2">
                  <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/designers" className="text-sm sm:text-base text-gray-400 hover:text-emerald-400 transition-colors">
                  Designers
                </Link>
              </li>
              <li>
                <Link to="/design-studio" className="text-sm sm:text-base text-gray-400 hover:text-emerald-400 transition-colors">
                  Design Studio
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm sm:text-base text-gray-400 hover:text-emerald-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-sm sm:text-base text-gray-400 hover:text-emerald-400 transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="px-2 sm:px-0 text-center">
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white">Account</h4>
            <ul className="space-y-2 sm:space-y-3">
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

          {/* Legal */}
          <div className="px-2 sm:px-0 text-center lg:hidden">
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white">Legal</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="px-2 sm:px-0 text-center">
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white">Support</h4>
            <ul className="space-y-2 sm:space-y-3">
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
            </ul>
          </div>
        </div>

        {/* Contact Info - centered below grid */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 py-5 border-t border-gray-800 mt-6">
          <a href={`tel:${siteSettings.hotline}`} className="text-gray-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-emerald-500" />
            {siteSettings.hotline}
          </a>
          <a href={`mailto:${siteSettings.email}`} className="text-gray-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-emerald-500" />
            {siteSettings.email}
          </a>
        </div>

        {/* Payment Methods & Info */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 mb-6 sm:mb-8 px-2 sm:px-0">
            <div className="text-center">
              <h5 className="text-sm font-bold text-white mb-3">We Accept</h5>
              <div className="flex flex-wrap justify-center gap-2">
                <div className="px-3 py-2 bg-gray-800 rounded-lg text-xs font-semibold text-gray-300">Cash on Delivery</div>
                <div className="px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-500">bKash (Soon)</div>
                <div className="px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-500">Nagad (Soon)</div>
              </div>
            </div>
            <div className="text-center">
              <h5 className="text-sm font-bold text-white mb-3">Download App (Coming Soon)</h5>
              <div className="flex justify-center gap-2">
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
        <div className="border-t border-gray-800 pt-6 sm:pt-8 mt-6 sm:mt-8 pb-24 md:pb-0">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-gray-500 px-2 sm:px-0">
            <p>&copy; 2026 LyriczFashion. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6">
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
