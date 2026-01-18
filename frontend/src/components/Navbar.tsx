import { Link } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Search, Phone, Heart, ChevronDown, Sparkles, ImageIcon, Store, MapPin, Package, LayoutDashboard, Home as HomeIcon, Users, Truck, HelpCircle, TrendingUp } from 'lucide-react'
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useCartStore } from '../store/cartStore'
import { productsAPI, settingsAPI } from '../services/api'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [promotionalBanners, setPromotionalBanners] = useState<any[]>([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [contactInfo, setContactInfo] = useState({ hotline: '19008188', email: 'support@lyriczfashion.com', address: 'Dhaka, Bangladesh' })
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(180)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const cartCount = useCartStore((s) => s.items.reduce((sum, x) => sum + x.quantity, 0))

  // Update favorites count from localStorage
  const updateFavoritesCount = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setFavoritesCount(favorites.length)
  }

  // Fetch promotional banners and contact info
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [banners, contact] = await Promise.all([
          settingsAPI.getPromotionalBanners(),
          settingsAPI.getContactInfo(),
        ])
        setPromotionalBanners(banners.filter((b: any) => b.active))
        setContactInfo(contact)
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }
    fetchSettings()
  }, [])

  // Auto-rotate promotional banners
  useEffect(() => {
    if (promotionalBanners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % promotionalBanners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [promotionalBanners.length])

  // Search suggestions with debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsSearching(true)
      try {
        const products = await productsAPI.getFeed()
        const query = searchQuery.toLowerCase()
        const filtered = products
          .filter((p: any) => 
            p.name?.toLowerCase().includes(query) ||
            p.designer_name?.toLowerCase().includes(query) ||
            p.store_name?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
          )
          .slice(0, 6)
        setSearchSuggestions(filtered)
        setShowSuggestions(filtered.length > 0)
      } catch (error) {
        setSearchSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      {/* Promotional Banner - Dynamic */}
      <div className="bg-emerald-600 text-white py-2 overflow-hidden relative">
        {promotionalBanners.length > 0 ? (
          <div className="relative h-6">
            {promotionalBanners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                  index === currentBannerIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                }`}
              >
                {banner.link ? (
                  <Link to={banner.link} className="hover:underline">{banner.text}</Link>
                ) : (
                  <span>{banner.text}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center"><span>🔥 Extra Sale 30% off - Limited Time Offer!</span></div>
        )}
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

            {/* Search Bar - Dynamic & Functional with Suggestions */}
            <div className="hidden md:flex items-center flex-1 max-w-xl mx-8 relative" ref={searchRef}>
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  if (searchQuery.trim()) {
                    setShowSuggestions(false)
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`
                  }
                }}
                className="flex w-full shadow-md rounded-full overflow-hidden relative z-10"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length >= 2 && searchSuggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search for T-shirts, designs, designers..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 border-r-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 placeholder:font-medium transition-all"
                />
                <button 
                  type="submit"
                  className="px-6 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </form>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {searchSuggestions.map((product: any) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        onClick={() => {
                          setShowSuggestions(false)
                          setSearchQuery('')
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-colors group"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={product.image_url || product.design_preview || product.image || 'https://via.placeholder.com/100'} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                            {product.name}
                          </div>
                          {product.designer_name && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Sparkles className="w-3 h-3" />
                              {product.designer_name}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-bold text-emerald-600 flex-shrink-0">
                          ৳{product.discount_price || product.price}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 p-3 bg-gray-50">
                    <button
                      onClick={() => {
                        setShowSuggestions(false)
                        window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`
                      }}
                      className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isSearching && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <span className="text-sm">Searching...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Hotline & Icons */}
            <div className="hidden md:flex items-center gap-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-md font-bold text-gray-900">Hotline: {contactInfo.hotline}</div>
                  <div className="text-xs text-gray-500 font-medium">Pickup your order for free</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                  <Heart className="w-6 h-6" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </Link>

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
              {/* Create Design Button - Left Side with Cool Effect */}
              <Link 
                to="/design-studio" 
                className="relative px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-[15px] font-bold rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 group overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <Sparkles className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Create Design</span>
              </Link>

              <Link to="/" className="flex items-center gap-1.5 text-emerald-600 text-[15px] font-bold hover:text-emerald-700 transition-colors">
                <HomeIcon className="w-4 h-4" />
                Home
              </Link>
              <Link to="/designers" className="flex items-center gap-1.5 text-gray-700 text-[15px] font-bold hover:text-emerald-600 transition-colors">
                <Users className="w-4 h-4" />
                Designers
              </Link>
              <Link to="/wholesale" className="flex items-center gap-1.5 text-gray-700 text-[15px] font-bold hover:text-emerald-600 transition-colors">
                <Truck className="w-4 h-4" />
                Wholesale/Dropshipping
              </Link>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">🔥</span>
                <span className="text-gray-700">Extra</span>
                <span className="text-emerald-500 font-semibold">Sale 30% off</span>
                <span className="text-gray-500">›</span>
              </div>
              <Link to="/help" className="flex items-center gap-1.5 text-gray-700 text-[15px] font-bold hover:text-emerald-600 transition-colors">
                <HelpCircle className="w-4 h-4" />
                Help
              </Link>
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
            <Link to="/design-studio" onClick={() => setIsMenuOpen(false)} className="block py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-md">✨ Create Design</Link>
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Home</Link>
            <Link to="/designers" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Designers</Link>
            <Link to="/wholesale" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Wholesale/Dropshipping</Link>
            <Link to="/help" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Help</Link>
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
