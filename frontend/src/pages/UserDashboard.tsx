import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

const UserDashboard = () => {
  const navigate = useNavigate()
  const [me, setMe] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!me) return null

  const displayName = (me.full_name || `${me.first_name || ''} ${me.last_name || ''}`.trim() || me.username || 'User').trim()

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-emerald-700">My Dashboard</div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">Welcome, {displayName}</h1>
              <p className="text-gray-600 mt-1">Manage your account, orders, and designs.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/design-studio"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Create Design
              </Link>
              <Link
                to="/sell-your-design"
                className="px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors"
              >
                Sell Your Design
              </Link>
            </div>
          </div>
        </div>

        {me.seller_status === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <div className="font-semibold text-amber-900">Seller application pending</div>
            <div className="text-sm text-amber-800 mt-1">Your seller request is under review. Once approved, seller options will appear in your account menu.</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/orders" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-900">My Orders</div>
            <div className="text-sm text-gray-600 mt-1">Track your purchases and delivery status.</div>
          </Link>

          <Link to="/profile" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-900">Profile</div>
            <div className="text-sm text-gray-600 mt-1">Update your personal information.</div>
          </Link>

          <Link to="/address-book" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-900">Address Book</div>
            <div className="text-sm text-gray-600 mt-1">Save delivery addresses for faster checkout.</div>
          </Link>

          <Link to="/settings" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-900">Settings</div>
            <div className="text-sm text-gray-600 mt-1">Manage preferences and security.</div>
          </Link>

          <Link to="/seller" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-900">Become Seller</div>
            <div className="text-sm text-gray-600 mt-1">Apply to open your store and sell designs.</div>
          </Link>

          <Link to="/products" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-900">Shop</div>
            <div className="text-sm text-gray-600 mt-1">Browse latest designs and products.</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
