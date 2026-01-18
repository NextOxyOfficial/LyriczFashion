import { Link } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Search, Phone, Heart, ChevronDown, Sparkles, ImageIcon, Store, MapPin, Package, LayoutDashboard } from 'lucide-react'
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useCartStore } from '../store/cartStore'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(180)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const cartCount = useCartStore((s) => s.items.reduce((sum, x) => sum + x.quantity, 0))

  // Update favorites count from localStorage
  const updateFavoritesCount = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setFavoritesCount(favorites.length)
  }

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
    
    // Initialize favorites count
    updateFavoritesCount()
    
    // Listen for storage changes (when favorites are updated from other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'favorites') {
        updateFavoritesCount()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Custom event listener for same-tab updates
    const handleFavoritesUpdate = () => {
      updateFavoritesCount()
    }
    
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate)
    }
  }, [])

  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return

    const measure = () => {
      const next = Math.ceil(el.getBoundingClientRect().height)
      setHeaderHeight((prev) => (next > prev ? next : prev))
    }

    measure()
    window.addEventListener('resize', measure)

    const fonts = (document as any).fonts
    if (fonts?.ready?.then) {
      fonts.ready.then(measure).catch(() => {})
    }

    return () => {
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }

  const displayName =
    (user?.full_name && String(user.full_name).trim()) ||
    `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
    user?.username ||
    'User'

  const isSeller = Boolean(user?.is_seller)
  const sellerStatus = user?.seller_status as string | null | undefined
  const createHref = '/design-studio'

  return (
    <>
    <div style={{ height: headerHeight }} />
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Scrolling Text Banner - Not Sticky */}
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

      {/* Sticky Header */}
      {/* Main Header */}
      <div className="border-gray-100 py-4">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
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
            <div className="hidden md:flex items-center gap-6 flex-shrink-0">
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
                <button className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                  <Heart className="w-6 h-6" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        Hi, {displayName}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`} />
                    </button>

                    <div className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 transition-all duration-200 origin-top ${
                      isUserMenuOpen 
                        ? 'opacity-100 scale-100 translate-y-0' 
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}>
                      <div className="p-3 bg-gradient-to-br from-emerald-50 to-white border-b border-gray-100">
                        <div className="text-sm font-semibold text-gray-900 truncate">{displayName}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs font-semibold text-emerald-600">
                            Balance: ৳{user.balance || '0.00'}
                          </div>
                          {!isSeller && sellerStatus === 'pending' && (
                            <div className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              Seller request pending
                            </div>
                          )}
                        </div>
                      </div>

                      {isSeller && (
                        <div className="p-3 grid grid-cols-2 gap-2">
                          <Link
                            to={createHref}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Sparkles className="w-4 h-4" />
                            Create
                          </Link>
                          <Link
                            to="/sell-your-design"
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <ImageIcon className="w-4 h-4" />
                            Sell
                          </Link>
                        </div>
                      )}

                      <div className="py-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 mr-3" />
                          Dashboard
                        </Link>

                        {isSeller && (
                          <Link
                            to="/seller"
                            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Store className="w-4 h-4 mr-3" />
                            My Store
                          </Link>
                        )}

                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-3" />
                          My Orders
                        </Link>

                        {isSeller && (
                          <Link
                            to="/seller/orders-received"
                            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Package className="w-4 h-4 mr-3" />
                            Orders Received
                          </Link>
                        )}

                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          My Profile
                        </Link>

                        <Link
                          to="/address-book"
                          className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <MapPin className="w-4 h-4 mr-3" />
                          Address Book
                        </Link>

                        {!isSeller && (
                          <div className="px-4 pt-2">
                            <Link
                              to="/seller"
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              Become Seller
                            </Link>
                          </div>
                        )}
                      </div>

                      <hr className="border-gray-200" />
                      <div className="py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                      </div>
                    </div>
                ) : (
                  <Link to="/login" className="p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                    <User className="w-6 h-6" />
                  </Link>
                )}
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

      {/* Navigation Bar - Not Sticky */}
      <nav className="bg-white py-3 shadow-sm">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-emerald-600 text-[15px] font-bold hover:text-emerald-700 transition-colors">
                Home
              </Link>
              <Link to="/designers" className="text-gray-700 text-[15px] font-bold hover:text-emerald-600 transition-colors">
                Designers
              </Link>
              <Link to="/design-studio" className="text-gray-700 text-[15px] font-bold hover:text-emerald-600 transition-colors">
                Design Studio
              </Link>
              <Link to="/help" className="text-gray-700 text-[15px] font-bold hover:text-emerald-600 transition-colors">
                Help
              </Link>
              <Link to="/wholesale" className="text-gray-700 text-[15px] font-bold hover:text-emerald-600 transition-colors">
                Wholesale
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
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Home</Link>
            <Link to="/designers" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Designers</Link>
            <Link to="/design-studio" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Design Studio</Link>
            <Link to="/help" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Help</Link>
            <Link to="/wholesale" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Wholesale</Link>
            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Cart ({cartCount})</Link>
            {user ? (
              <button onClick={handleLogout} className="block py-2 text-red-600 font-medium">Logout</button>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Login</Link>
            )}
          </div>
        </div>
      )}
    </header>
    </>
  )
}

export default Navbar
