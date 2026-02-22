import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Search, Heart, ChevronDown, Sparkles, ImageIcon, Store, MapPin, Package, LayoutDashboard, HelpCircle, TrendingUp } from 'lucide-react'
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useCartStore } from '../store/cartStore'
import { productsAPI, settingsAPI, toApiUrl } from '../services/api'
 
const Navbar = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [promotionalBanners, setPromotionalBanners] = useState<any[]>([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [siteSettings, setSiteSettings] = useState<any>({ site_name: 'LyriczFashion', logo: null, favicon: null })
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(72)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const cartCount = useCartStore((s) => s.items.reduce((sum, x) => sum + x.quantity, 0))
  const [cartBounce, setCartBounce] = useState(false)
  const [showSearchBar, setShowSearchBar] = useState(false)

  // Update favorites count from localStorage
  const updateFavoritesCount = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setFavoritesCount(favorites.length)
  }

  // Trigger cart bounce animation when cart count changes
  useEffect(() => {
    if (cartCount > 0) {
      setCartBounce(true)
      setTimeout(() => setCartBounce(false), 500)
    }
  }, [cartCount])

  // Fetch promotional banners, contact info, and site settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [banners, contact] = await Promise.all([
          settingsAPI.getPromotionalBanners(),
          settingsAPI.getContactInfo(),
        ])
        setPromotionalBanners(banners.filter((b: any) => b.active))
        setSiteSettings(contact) // Contact info includes site settings now
        
        // Update favicon dynamically
        if (contact.favicon) {
          const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link')
          link.type = 'image/x-icon'
          link.rel = 'shortcut icon'
          link.href = toApiUrl(contact.favicon)
          document.getElementsByTagName('head')[0].appendChild(link)
        }
        
        // Update page title
        if (contact.site_name) {
          document.title = contact.site_name
        }
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

  // Close mobile search on outside tap
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest('[data-mobile-search-btn]')
      ) {
        setShowSearchBar(false)
        setShowSuggestions(false)
        setSearchQuery('')
      }
    }
    if (showSearchBar) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('touchstart', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [showSearchBar])

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
      setHeaderHeight(next)
    }

    measure()
    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measure)
      resizeObserver.observe(el)
    }
    window.addEventListener('resize', measure)

    const fonts = (document as any).fonts
    if (fonts?.ready?.then) {
      fonts.ready.then(measure).catch(() => {})
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
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
  const activePromoText = promotionalBanners[currentBannerIndex]?.text || '🔥 Extra Sale 30% off'

  return (
    <>
    <div style={{ height: headerHeight }} />
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur shadow-sm border-b border-gray-100">
      <div className="max-w-[1480px] mx-auto px-1 sm:px-4 lg:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6 min-w-0">
          <button
            className="md:hidden p-2 text-gray-700 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2 min-w-0 flex-shrink-0">
            {siteSettings.logo ? (
              <img
                src={toApiUrl(siteSettings.logo)}
                alt={siteSettings.site_name || 'Logo'}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <>
                <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{siteSettings.site_name?.[0] || 'L'}</span>
                </div>
                <span className="text-base md:text-lg font-bold text-gray-900 truncate">{siteSettings.site_name || 'LyriczFashion'}</span>
              </>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-semibold">
            <Link to={createHref} className="text-emerald-600 hover:text-emerald-700 transition-colors">Create Design</Link>
            <Link to="/" className="text-gray-700 hover:text-emerald-600 transition-colors">Home</Link>
            <Link to="/designers" className="text-gray-700 hover:text-emerald-600 transition-colors">Designers</Link>
            <Link to="/wholesale" className="text-gray-700 hover:text-emerald-600 transition-colors">Wholesale</Link>
            <Link to="/help" className="text-gray-700 hover:text-emerald-600 transition-colors">Help Center</Link>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div ref={searchRef} className="hidden md:flex items-center relative">
            <div className={`flex items-center transition-all duration-300 ease-in-out overflow-hidden ${
              showSearchBar ? 'w-56 lg:w-72' : 'w-9'
            }`}>
              {showSearchBar ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (searchQuery.trim()) {
                      setShowSuggestions(false)
                      setShowSearchBar(false)
                      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
                    }
                  }}
                  className="flex items-center w-full border border-gray-200 rounded-xl bg-white shadow-sm"
                >
                  <Search className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim().length >= 2 && searchSuggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Search..."
                    className="flex-1 px-2 py-2 text-sm bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowSearchBar(false); setShowSuggestions(false); setSearchQuery('') }}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearchBar(true)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-emerald-600 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-h-96 overflow-y-auto z-50">
                <div className="p-2">
                  {searchSuggestions.map((product: any) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      onClick={() => { setShowSuggestions(false); setSearchQuery(''); setShowSearchBar(false) }}
                      className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={toApiUrl(product.image_url || product.design_preview || product.image) || 'https://via.placeholder.com/100'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-emerald-600 truncate">{product.name}</div>
                        {product.designer_name && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />{product.designer_name}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-bold text-emerald-600">৳{product.discount_price || product.price}</div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-gray-100 p-3 bg-gray-50">
                  <button
                    onClick={() => { setShowSuggestions(false); navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`) }}
                    className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    View all results for "{searchQuery}"
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            data-mobile-search-btn
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-emerald-600 transition-colors"
            onClick={() => setShowSearchBar(!showSearchBar)}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link to="/wishlist" className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-emerald-600 transition-colors">
            <Heart className="w-5 h-5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group">
            <div className={`relative ${cartBounce ? 'animate-bounce-scale' : ''}`}>
              {cartCount > 0 ? (
                <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-1.5 rounded-lg">
                  <ShoppingCart className="w-4 h-4 text-white fill-white" />
                </div>
              ) : (
                <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
              )}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5 text-gray-700" />
                <span className="hidden xl:inline text-sm font-medium text-gray-700 max-w-[120px] truncate">{displayName}</span>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              <div className={`absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 transition-all duration-200 origin-top-right ${
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
                  <div className="p-3 space-y-2">
                    <Link
                      to={createHref}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Sparkles className="w-4 h-4" />
                      Create Your Product
                    </Link>
                    <Link
                      to="/sell-your-design"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <ImageIcon className="w-4 h-4" />
                      Sell Your Logo
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
            <Link to="/login" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-emerald-600 transition-colors">
              <User className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>

    </header>

      {/* Mobile Menu - Slide-in Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="relative mr-auto w-[80%] max-w-xs h-full bg-white flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-lg">LyriczFashion</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info or Login */}
            {user ? (
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{user.first_name || user.username || 'User'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center py-2 border border-emerald-600 text-emerald-600 text-sm font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Scrollable Menu Items */}
            <div className="flex-1 overflow-y-auto py-3">
              {/* Create Design CTA */}
              <div className="px-4 mb-3">
                <Link
                  to="/design-studio"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-2xl shadow-md"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Create Your Design</span>
                </Link>
              </div>

              {/* Nav Links */}
              <div className="px-2">
                <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Browse</p>
                {[
                  { to: '/', icon: <Package className="w-5 h-5" />, label: 'Home' },
                  { to: '/products', icon: <ShoppingCart className="w-5 h-5" />, label: 'All Products' },
                  { to: '/designers', icon: <Store className="w-5 h-5" />, label: 'Designers' },
                  { to: '/design-studio', icon: <ImageIcon className="w-5 h-5" />, label: 'Design Studio' },
                  { to: '/wholesale', icon: <TrendingUp className="w-5 h-5" />, label: 'Wholesale' },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    <span className="text-gray-400">{item.icon}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                ))}

                {user && (
                  <>
                    <p className="px-3 py-1.5 mt-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                    {[
                      { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
                      { to: '/orders', icon: <Package className="w-5 h-5" />, label: 'My Orders' },
                      { to: '/wishlist', icon: <Heart className="w-5 h-5" />, label: 'Wishlist' },
                      { to: '/address-book', icon: <MapPin className="w-5 h-5" />, label: 'Address Book' },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        <span className="text-gray-400">{item.icon}</span>
                        <span className="font-medium text-sm">{item.label}</span>
                      </Link>
                    ))}
                  </>
                )}

                <p className="px-3 py-1.5 mt-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Support</p>
                <Link
                  to="/help"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <span className="text-gray-400"><HelpCircle className="w-5 h-5" /></span>
                  <span className="font-medium text-sm">Help Center</span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer */}
            {user && (
              <div className="px-4 py-4 border-t border-gray-100">
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false) }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Search Dropdown - outside header to avoid stacking context issues */}
      {showSearchBar && (
        <div ref={mobileSearchRef} className="md:hidden fixed left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg px-3 py-3" style={{ top: headerHeight }}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (searchQuery.trim()) {
                setShowSuggestions(false)
                setShowSearchBar(false)
                setSearchQuery('')
                navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
              }
            }}
            className="relative"
          >
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search products, designers..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value.trim()) {
                    setShowSuggestions(true)
                  } else {
                    setShowSuggestions(false)
                  }
                }}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setShowSuggestions(false) }}
                  className="p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Mobile Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
              {searchSuggestions.slice(0, 5).map((product: any) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  onClick={() => { setShowSuggestions(false); setSearchQuery(''); setShowSearchBar(false) }}
                  className="flex items-center gap-3 p-3 hover:bg-emerald-50 transition-colors group border-b border-gray-100 last:border-b-0"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={product.image_url || product.design_preview || product.image || 'https://via.placeholder.com/40x40'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate group-hover:text-emerald-600">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      ৳{product.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Mobile Sticky Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-2 py-1.5 pb-safe">
          <Link
            to="/"
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-500 hover:text-emerald-600 transition-colors group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          <Link
            to="/products"
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] font-medium">Shop</span>
          </Link>

          {/* Center Create Button */}
          <Link
            to="/design-studio"
            className="flex flex-col items-center gap-0.5 -mt-5"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200 border-4 border-white">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-600">Create</span>
          </Link>

          <Link
            to="/wishlist"
            className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <Heart className="w-5 h-5" />
            {favoritesCount > 0 && (
              <span className="absolute top-1 right-2 bg-emerald-500 text-white text-[9px] rounded-full min-w-[14px] h-3.5 px-0.5 flex items-center justify-center font-bold">
                {favoritesCount}
              </span>
            )}
            <span className="text-[10px] font-medium">Wishlist</span>
          </Link>

          <Link
            to={user ? '/dashboard' : '/login'}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">{user ? 'Account' : 'Login'}</span>
          </Link>
        </div>
      </nav>

      {/* Spacer for sticky bottom nav on mobile */}
      <div className="md:hidden" />
    </>
  )
}

export default Navbar
