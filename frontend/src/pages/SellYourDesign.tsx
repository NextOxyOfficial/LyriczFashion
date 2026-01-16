import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI, designCommissionAPI, designLibraryAPI } from '../services/api'

const API_BASE_URL = 'http://localhost:8000'

const toUrl = (path?: string | null) => {
  if (!path) return ''
  const str = String(path).trim()
  if (str.startsWith('http://') || str.startsWith('https://')) return str
  const normalized = str.startsWith('/') ? str : `/${str}`
  return `${API_BASE_URL}${normalized}`
}

const SellYourDesign = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [me, setMe] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [name, setName] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [myItems, setMyItems] = useState<any[]>([])
  const [commissions, setCommissions] = useState<any[]>([])

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    if (!token) {
      navigate('/login')
      return
    }

    setIsLoading(true)
    try {
      const meData = await authAPI.getMe(token)
      setMe(meData)

      const items = await designLibraryAPI.listMy(token)
      setMyItems(Array.isArray(items) ? items : [])

      const com = await designCommissionAPI.listMy(token)
      setCommissions(Array.isArray(com) ? com : [])
    } catch {
      localStorage.removeItem('token')
      navigate('/login')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const displayName = useMemo(() => {
    if (!me) return ''
    return (me.full_name || `${me.first_name || ''} ${me.last_name || ''}`.trim() || me.username || 'User').trim()
  }, [me])

  const totalPending = useMemo(() => {
    let sum = 0
    for (const c of commissions) {
      if (c.status === 'paid') continue
      const amt = Number(c.amount)
      if (!Number.isNaN(amt)) sum += amt
    }
    return sum
  }, [commissions])

  const onSubmit = async () => {
    setError('')
    setSuccess('')
    if (!token) {
      navigate('/login')
      return
    }
    if (!name.trim() || !image) {
      setError('Please provide a name and upload an image.')
      return
    }

    setSubmitting(true)
    try {
      await designLibraryAPI.create(token, {
        name: name.trim(),
        image,
        commission_per_use: 49,
      })
      setSuccess('Design uploaded successfully! It is now available in the Design Studio library.')
      setName('')
      setImage(null)
      await load()
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!me) return null

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-emerald-700">Sell Your Design</div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">Upload your logo to the library</h1>
              <p className="text-gray-600 mt-1">Hi {displayName}, earn ৳49 commission every time someone uses your logo in a custom order.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/design-studio"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              >
                Open Design Studio
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50"
              >
                My Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="font-semibold text-gray-900">Upload a logo</div>
              <div className="text-sm text-gray-600 mt-1">Commission per use: <span className="font-semibold">৳49</span></div>

              {error && <div className="mt-3 text-sm text-red-600 font-medium">{error}</div>}
              {success && <div className="mt-3 text-sm text-emerald-700 font-medium">{success}</div>}

              <div className="mt-4 space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Design name (e.g., Brand Logo)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="w-full text-sm border-2 border-dashed border-emerald-200 rounded-xl p-4 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer file:mr-4 file:py-2 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer file:shadow-sm"
                />

                <button
                  onClick={onSubmit}
                  disabled={submitting}
                  className="w-full px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Uploading...' : 'Upload Design'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="font-semibold text-gray-900">Commission</div>
              <div className="text-sm text-gray-600 mt-1">Pending total: <span className="font-semibold text-gray-900">৳{totalPending}</span></div>
              <div className="text-xs text-gray-500 mt-2">Commission records are created when someone places an order using your logo.</div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="font-semibold text-gray-900">My uploaded designs</div>
              <div className="text-sm text-gray-600 mt-1">These designs will appear in Design Studio library.</div>
            </div>

            {myItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-600">No designs uploaded yet.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {myItems.map((d) => (
                  <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="aspect-square bg-gray-50">
                      <img src={toUrl(d.image)} alt={d.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="text-sm font-semibold text-gray-900 line-clamp-1">{d.name}</div>
                      <div className="text-xs text-gray-500 mt-1">Commission: ৳{d.commission_per_use}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="font-semibold text-gray-900">My commission history</div>
              {commissions.length === 0 ? (
                <div className="text-sm text-gray-600 mt-2">No commission records yet.</div>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-4">Design</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2">Order</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {commissions.slice(0, 20).map((c) => (
                        <tr key={c.id} className="border-t border-gray-100">
                          <td className="py-3 pr-4 font-medium">{c.design?.name || 'Design'}</td>
                          <td className="py-3 pr-4">৳{c.amount}</td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${c.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3">#{c.order}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellYourDesign
