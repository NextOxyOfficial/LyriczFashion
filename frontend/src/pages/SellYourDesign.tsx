import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI, designCommissionAPI, designLibraryAPI, designCategoryAPI, toApiUrl } from '../services/api'

const toUrl = toApiUrl

const SellYourDesign = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [me, setMe] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [name, setName] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [category, setCategory] = useState('')
  const [searchKeywords, setSearchKeywords] = useState('')
  const [myItems, setMyItems] = useState<any[]>([])
  const [commissions, setCommissions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{id: number, name: string} | null>(null)

  const fetchData = async () => {
    if (!token) {
      navigate('/login')
      return
    }
    try {
      const meData = await authAPI.getMe(token)
      setMe(meData)

      const items = await designLibraryAPI.listMy(token)
      setMyItems(Array.isArray(items) ? items : [])

      const com = await designCommissionAPI.listMy(token)
      setCommissions(Array.isArray(com) ? com : [])

      // Fetch categories
      const cats = await designCategoryAPI.list()
      setCategories(Array.isArray(cats) ? cats : [])
    } catch {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  const load = async () => {
    setIsLoading(true)
    try {
      await fetchData()
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLogo = (id: number, name: string) => {
    setDeleteConfirm({ id, name })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm || !token) return
    
    try {
      await designLibraryAPI.delete(token, deleteConfirm.id)
      setMyItems(prev => prev.filter(item => item.id !== deleteConfirm.id))
      setSuccess(`Logo "${deleteConfirm.name}" deleted successfully`)
      
      // Trigger design library refresh
      window.dispatchEvent(new Event('designLibraryUpdated'))
      localStorage.setItem('designLibraryUpdatedAt', Date.now().toString())
    } catch (error) {
      setError('Failed to delete logo')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!image) {
      setImagePreviewUrl('')
      return
    }
    const url = URL.createObjectURL(image)
    setImagePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  const displayName = useMemo(() => {
    if (!me) return ''
    return (me.full_name || `${me.first_name || ''} ${me.last_name || ''}`.trim() || me.username || 'User').trim()
  }, [me])

  const totalPending = useMemo(() => {
    let sum = 0
    for (const c of commissions) {
      if (c.status === 'completed') continue
      const amt = Number(c.amount)
      if (!Number.isNaN(amt)) sum += amt
    }
    return sum
  }, [commissions])

  const totalEarnings = useMemo(() => {
    let sum = 0
    for (const c of commissions) {
      if (c.status !== 'completed') continue
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
      console.log('Uploading logo:', {
        name: name.trim(),
        category: category.trim(),
        search_keywords: searchKeywords.trim(),
        image: image?.name,
        imageSize: image?.size,
        imageType: image?.type,
        token: token ? `${token.substring(0, 10)}...` : 'missing'
      })
      
      const result = await designLibraryAPI.create(token, {
        name: name.trim(),
        image,
        category: category.trim(),
        search_keywords: searchKeywords.trim(),
        commission_per_use: 49,
      })
      
      console.log('Upload successful:', result)
      setSuccess('Published! Your logo is now available in the Design Studio library.')
      setName('')
      setImage(null)
      setCategory('')
      setSearchKeywords('')

      localStorage.setItem('designLibraryUpdatedAt', String(Date.now()))
      window.dispatchEvent(new Event('designLibraryUpdated'))

      await fetchData()
    } catch (e: any) {
      console.error('Upload failed:', e)
      console.error('Error response:', e?.response?.data)
      setError(e?.response?.data?.detail || e?.response?.data?.error || e?.message || 'Upload failed')
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
    <div className="min-h-screen bg-gray-50 py-3 sm:py-6">
      <div className="max-w-2xl lg:max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-medium text-emerald-700">Sell Your Design</div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5 leading-tight">Upload your logo to the library</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Hi {displayName}, earn ৳49 commission every time someone uses your logo.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              <Link to="/design-studio" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-700 text-center">Design Studio</Link>
              <Link to="/dashboard" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white border border-gray-200 text-gray-800 text-xs sm:text-sm font-semibold hover:bg-gray-50 text-center">Dashboard</Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <div className="text-sm font-semibold text-gray-900">Publish your logo</div>
              <div className="text-xs text-gray-500 mt-0.5">Commission per use: <span className="font-semibold text-emerald-600">৳49</span></div>

              {error && <div className="mt-3 text-sm text-red-600 font-medium">{error}</div>}
              {success && <div className="mt-3 text-sm text-emerald-700 font-medium">{success}</div>}

              <div className="mt-4 space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Logo name (e.g., Brand Logo)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <textarea
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                  placeholder="Search keywords (e.g., modern, minimalist, corporate)"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="w-full text-sm border-2 border-dashed border-emerald-200 rounded-xl p-4 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer file:mr-4 file:py-2 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer file:shadow-sm"
                />

                {imagePreviewUrl ? (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-emerald-100">
                        <img src={imagePreviewUrl} alt="preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{image?.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{image ? `${(image.size / 1024).toFixed(1)} KB` : ''}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="px-3 py-2 rounded-xl border border-red-200 text-red-700 font-semibold hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : null}

                <button
                  onClick={onSubmit}
                  disabled={submitting}
                  className="w-full px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-sm font-semibold text-gray-900">Commission</div>
              <div className="flex gap-4 mt-2">
                <div><div className="text-xs text-gray-400">Earned</div><div className="text-base font-bold text-emerald-600">৳{totalEarnings}</div></div>
                <div><div className="text-xs text-gray-400">Pending</div><div className="text-base font-bold text-gray-800">৳{totalPending}</div></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-sm font-semibold text-gray-900">My published logos</div>
              <div className="text-xs text-gray-500 mt-0.5">After you publish, your logos will appear here and in Design Studio library.</div>
            </div>

            {myItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-600">No logos published yet.</div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="max-h-[520px] overflow-y-auto divide-y divide-gray-100">
                  {myItems.map((d) => (
                    <div key={d.id} className="p-3 sm:p-4 flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                        <img src={toUrl(d.image)} alt={d.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{d.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {d.category && <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded mr-1">{d.category}</span>}
                          ৳{d.commission_per_use}/use
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Link
                          to="/design-studio"
                          className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs sm:text-sm hover:bg-emerald-100 transition-colors whitespace-nowrap"
                        >
                          <span className="hidden sm:inline">View in Studio</span>
                          <span className="sm:hidden">Studio</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteLogo(d.id, d.name)}
                          className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 font-semibold text-xs sm:text-sm hover:bg-red-100 transition-colors"
                          title="Delete logo"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-sm font-semibold text-gray-900 mb-2">Commission history</div>
              {commissions.length === 0 ? (
                <div className="text-xs text-gray-500">No commission records yet.</div>
              ) : (
                <div className="space-y-2">
                  {commissions.slice(0, 20).map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 py-2 border-t border-gray-100 first:border-0">
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">{c.design?.name || 'Design'}</div>
                        <div className="text-[10px] text-gray-400">Order #{c.order}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-bold text-gray-800">৳{c.amount}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
                          {c.status === 'completed' ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Logo</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellYourDesign
