import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { ShoppingBag, User, MapPin, Settings, Store, ShoppingCart, Sparkles, ChevronRight, AlertCircle } from 'lucide-react'

const UserDashboard = () => {
  const navigate = useNavigate()
  const [me, setMe] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token')
      if (!token) { navigate('/login'); return }
      setIsLoading(true)
      try {
        const data = await authAPI.getMe(token)
        setMe(data)
      } catch {
        localStorage.removeItem('token')
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!me) return null

  const displayName = (me.full_name || `${me.first_name || ''} ${me.last_name || ''}`.trim() || me.username || 'User').trim()
  const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

  const menuItems = [
    { to: '/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'My Orders', desc: 'Track purchases & delivery', color: 'bg-blue-50 text-blue-600' },
    { to: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile', desc: 'Update personal info', color: 'bg-purple-50 text-purple-600' },
    { to: '/address-book', icon: <MapPin className="w-5 h-5" />, label: 'Address Book', desc: 'Manage delivery addresses', color: 'bg-orange-50 text-orange-600' },
    { to: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings', desc: 'Preferences & security', color: 'bg-gray-100 text-gray-600' },
    { to: me?.is_seller ? '/sell-your-design' : '/seller', icon: <Store className="w-5 h-5" />, label: 'Sell your Logo', desc: me?.is_seller ? 'Upload logos & earn' : 'Become a seller', color: 'bg-emerald-50 text-emerald-600' },
    { to: '/products', icon: <ShoppingCart className="w-5 h-5" />, label: 'Shop', desc: 'Browse all products', color: 'bg-pink-50 text-pink-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-6">
      <div className="max-w-2xl mx-auto px-3 sm:px-6">

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-4 sm:p-6 mb-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-emerald-100 text-xs font-medium">My Dashboard</p>
              <h1 className="text-lg sm:text-2xl font-bold truncate">Welcome, {displayName}</h1>
              <p className="text-emerald-100 text-xs mt-0.5 hidden sm:block">Manage your account, orders, and designs.</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Link
              to="/design-studio"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white text-emerald-700 text-sm font-bold rounded-xl hover:bg-emerald-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Create Design
            </Link>
            <Link
              to="/wishlist"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/30"
            >
              Wishlist
            </Link>
          </div>
        </div>

        {/* Pending seller notice */}
        {me.seller_status === 'pending' && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Seller application pending</p>
              <p className="text-xs text-amber-700 mt-0.5">Under review. You'll be notified once approved.</p>
            </div>
          </div>
        )}

        {/* Menu Grid - 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-emerald-100 transition-all group"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                {item.icon}
              </div>
              <div className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{item.label}</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-snug">{item.desc}</div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 mt-2 group-hover:text-emerald-400 transition-colors" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}

export default UserDashboard
