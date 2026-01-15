import { Link } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Search, LogOut, Phone, Heart, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '../store/cartStore'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const cartCount = useCartStore((s) => s.items.reduce((sum, x) => sum + x.quantity, 0))

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const { authAPI } = await import('../services/api')
          const userData = await authAPI.getMe(token)
          setUser(userData)
        } catch (error) {
          localStorage.removeItem('token')
        }
      }
    }
    checkAuth()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Scrolling Text Banner */}
      <div className="bg-gray-900 text-white overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap py-2.5 text-sm font-medium">
          <span className="inline-flex items-center px-8">🔥 Extra Sale 30% off - Limited Time Offer!</span>
          <span className="inline-flex items-center px-8">✨ Free Shipping on Orders Over ৳2000</span>
          <span className="inline-flex items-center px-8">🎨 Custom T-Shirt Design - Upload Your Logo Today</span>
          <span className="inline-flex items-center px-8">🔥 Extra Sale 30% off - Limited Time Offer!</span>
          <span className="inline-flex items-center px-8">✨ Free Shipping on Orders Over ৳2000</span>
          <span className="inline-flex items-center px-8">🎨 Custom T-Shirt Design - Upload Your Logo Today</span>
          <span className="inline-flex items-center px-8">🔥 Extra Sale 30% off - Limited Time Offer!</span>
          <span className="inline-flex items-center px-8">✨ Free Shipping on Orders Over ৳2000</span>
          <span className="inline-flex items-center px-8">🎨 Custom T-Shirt Design - Upload Your Logo Today</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-gray-100 mt-5">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">LyriczFashion</span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
              <div className="flex w-full shadow-md rounded-full overflow-hidden">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="flex-1 px-4 py-2.5 border border-gray-200 border-r-0 focus:outline-none focus:ring-1 focus:ring-gray-300 bg-gray-50 placeholder:font-medium"
                />
                <button className="px-6 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors">
                  Search
                </button>
              </div>
            </div>

            {/* Hotline & Icons */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-md font-bold text-gray-900">Hotline: 19008188</div>
                  <div className="text-xs text-gray-500 font-medium">Pickup your order for free</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-6 h-6" />
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                    <User className="w-6 h-6" />
                  </Link>
                )}

                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                  <Heart className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    0
                  </span>
                </Link>

                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-white py-3">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-1 text-emerald-500 text-[15px] font-bold hover:text-emerald-600 transition-colors">
                Home
                <ChevronDown className="w-3.5 h-3.5" />
              </Link>
              <Link to="/design-studio" className="flex items-center gap-1 text-gray-600 text-[15px] font-bold hover:text-emerald-500 transition-colors">
                TeeSpace
                <ChevronDown className="w-3.5 h-3.5" />
              </Link>
              <Link to="/products" className="flex items-center gap-1 text-gray-600 text-[15px] font-bold hover:text-emerald-500 transition-colors">
                Shop
                <ChevronDown className="w-3.5 h-3.5" />
              </Link>
              <Link to="/seller" className="flex items-center gap-1 text-gray-600 text-[15px] font-bold hover:text-emerald-500 transition-colors">
                Blog
                <ChevronDown className="w-3.5 h-3.5" />
              </Link>
              <Link to="/seller" className="flex items-center gap-1 text-gray-600 text-[15px] font-bold hover:text-emerald-500 transition-colors">
                Pages
                <ChevronDown className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">🔥</span>
              <span className="text-gray-700">Extra</span>
              <span className="text-emerald-500 font-semibold">Sale 30% off</span>
              <span className="text-gray-500">›</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none"
              />
              <button className="px-4 py-2 bg-emerald-500 text-white rounded-r-lg">
                <Search className="w-5 h-5" />
              </button>
            </div>
            <Link to="/" className="block py-2 text-gray-700 font-medium">Home</Link>
            <Link to="/design-studio" className="block py-2 text-gray-700 font-medium">Design Studio</Link>
            <Link to="/products" className="block py-2 text-gray-700 font-medium">Shop</Link>
            <Link to="/seller" className="block py-2 text-gray-700 font-medium">Sell</Link>
            <Link to="/cart" className="block py-2 text-gray-700 font-medium">Cart ({cartCount})</Link>
            {user ? (
              <button onClick={handleLogout} className="block py-2 text-red-600 font-medium">Logout</button>
            ) : (
              <Link to="/login" className="block py-2 text-gray-700 font-medium">Login</Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
