import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI, storeAPI } from '../services/api'

const API_BASE_URL = 'http://localhost:8000'

const toUrl = (path?: string | null) => {
  if (!path) return ''
  const str = String(path).trim()
  if (str.startsWith('http://') || str.startsWith('https://')) return str
  const normalized = str.startsWith('/') ? str : `/${str}`
  return `${API_BASE_URL}${normalized}`
}

const MyStore = () => {
  const navigate = useNavigate()
  const [me, setMe] = useState<any>(null)
  const [store, setStore] = useState<any>(null)
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

        if (data.is_seller) {
          const myStore = await storeAPI.getMyStore(token)
          setStore(myStore)
        } else {
          setStore(null)
        }
      } catch {
        localStorage.removeItem('token')
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [navigate])

  const displayName = useMemo(() => {
    if (!me) return ''
    return (me.full_name || `${me.first_name || ''} ${me.last_name || ''}`.trim() || me.username || 'User').trim()
  }, [me])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading store...</p>
        </div>
      </div>
    )
  }

  if (!me) return null

  if (!me.is_seller) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="text-sm font-medium text-emerald-700">My Store</div>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Seller access required</h1>
            <p className="text-gray-600 mt-2">Hi {displayName}, your seller account is not approved yet.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/seller" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
                Become Seller
              </Link>
              <Link to="/dashboard" className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="text-sm font-medium text-emerald-700">My Store</div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Manage your store</h1>
          <p className="text-gray-600 mt-1">View store details and your public store page.</p>
        </div>

        {!store ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="font-semibold text-gray-900">No store found</div>
            <div className="text-sm text-gray-600 mt-1">Create your store from Seller Dashboard.</div>
            <div className="mt-4">
              <Link to="/seller" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
                Go to Seller Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">Store Name</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{store.name}</div>
                  <div className="text-sm text-gray-600 mt-2">{store.description || 'No description yet.'}</div>
                </div>
                {store.logo && (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                    <img src={toUrl(store.logo)} alt={store.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to={`/store/${store.slug}`}
                  className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  View Public Store
                </Link>
                <Link
                  to="/seller"
                  className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50"
                >
                  Manage in Seller Dashboard
                </Link>
              </div>
            </div>

            {store.banner && (
              <div className="h-40 bg-gray-100">
                <img src={toUrl(store.banner)} alt="Store banner" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyStore
