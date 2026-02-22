import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store } from 'lucide-react'
import { storeAPI, toApiUrl } from '../services/api'

const toUrl = toApiUrl

type DesignerStore = {
  id: number
  name: string
  slug: string
  logo?: string | null
  banner?: string | null
  description?: string | null
  owner?: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
  }
}

const Designers = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [stores, setStores] = useState<DesignerStore[]>([])

  useEffect(() => {
    const load = async () => {
      setError('')
      setIsLoading(true)
      try {
        const data = await storeAPI.listStores()
        setStores(Array.isArray(data) ? data : [])
      } catch (e: any) {
        setError(e?.response?.data?.detail || e?.message || 'Failed to load designers')
        setStores([])
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const getOwnerName = (s: DesignerStore) => {
    const first = s.owner?.first_name || ''
    const last = s.owner?.last_name || ''
    const full = `${first} ${last}`.trim()
    return full || s.owner?.username || s.name
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading designers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="text-sm font-medium text-emerald-700">Designers</div>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Meet Our Designers</h1>
          <p className="text-gray-600 mt-2">Explore stores created by designers and discover unique collections.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">{error}</div>
        )}

        {stores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No designers found</h3>
            <p className="text-gray-600">No active designer stores are available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((s) => (
              <Link
                key={s.id}
                to={`/store/${s.slug}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  {s.banner ? (
                    <img src={toUrl(s.banner)} alt={s.name} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-r from-emerald-600 to-emerald-400" />
                  )}
                  <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                    {s.logo ? (
                      <img src={toUrl(s.logo)} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-500 font-semibold">
                        {s.name?.slice(0, 1) || 'D'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-12 p-6">
                  <div className="text-sm text-gray-500">Designed by</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">{getOwnerName(s)}</div>
                  <div className="text-sm text-emerald-600 font-semibold mt-1">{s.name}</div>
                  {s.description && (
                    <div className="text-sm text-gray-600 mt-2 line-clamp-2">{s.description}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Designers
