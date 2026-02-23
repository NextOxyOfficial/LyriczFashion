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

  const pendingCount = useMemo(() => myItems.filter(i => i.approval_status === 'pending').length, [myItems])

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
    if (pendingCount >= 5) {
      setError('You already have 5 logos pending review. Please wait for admin approval before submitting more.')
      return
    }

    setSubmitting(true)
    try {
      await designLibraryAPI.create(token, {
        name: name.trim(),
        image,
        category: category.trim(),
        search_keywords: searchKeywords.trim(),
        commission_per_use: 49,
      })
      setSuccess('Submitted for review! Your logo will appear in the library once approved by admin.')
      setName('')
      setImage(null)
      setCategory('')
      setSearchKeywords('')
      await fetchData()
    } catch (e: any) {
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
      <div className="max-w-2xl lg:max-w-[1480px] mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-2 py-4 sm:p-6 mb-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-2 py-4 sm:p-6">
              <div className="text-sm font-semibold text-gray-900">Publish your logo</div>
              <div className="text-xs text-gray-500 mt-0.5">Commission per use: <span className="font-semibold text-emerald-600">৳49</span></div>

              {/* Pending review slots */}
              <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-gray-600">Review slots used</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    pendingCount >= 5 ? 'bg-red-100 text-red-600' :
                    pendingCount >= 3 ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>{pendingCount}/5</span>
                </div>
                <div className="flex gap-1">
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className={`flex-1 h-2 rounded-full transition-all ${
                      i < pendingCount
                        ? pendingCount >= 5 ? 'bg-red-400' : pendingCount >= 3 ? 'bg-amber-400' : 'bg-emerald-400'
                        : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
                <div className="mt-1.5 text-[10px] text-gray-400">
                  {pendingCount >= 5
                    ? 'Limit reached — wait for admin approval'
                    : `${5 - pendingCount} slot${5 - pendingCount !== 1 ? 's' : ''} available`
                  }
                </div>
              </div>

              {error && <div className="mt-3 text-sm text-red-600 font-medium">{error}</div>}
              {success && <div className="mt-3 text-sm text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{success}</div>}

              <div className="mt-3 space-y-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Logo name (e.g., Brand Logo)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <textarea
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                  placeholder="Search keywords (e.g., modern, minimalist)"
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="w-full text-xs border-2 border-dashed border-emerald-200 rounded-lg p-2 bg-emerald-50/50 hover:border-emerald-400 transition-all cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer"
                />

                {imagePreviewUrl && (
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-emerald-100 bg-emerald-50">
                    <img src={imagePreviewUrl} alt="preview" className="w-9 h-9 rounded-lg object-cover border border-emerald-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">{image?.name}</div>
                      <div className="text-[10px] text-gray-500">{image ? `${(image.size / 1024).toFixed(1)} KB` : ''}</div>
                    </div>
                    <button type="button" onClick={() => setImage(null)}
                      className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded-md hover:bg-red-50 font-medium flex-shrink-0"
                    >Remove</button>
                  </div>
                )}

                <button
                  onClick={onSubmit}
                  disabled={submitting || pendingCount >= 5}
                  className="w-full py-2.5 text-sm rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : pendingCount >= 5 ? 'Pending limit reached' : 'Submit for Review'}
                </button>
              </div>
            </div>

          </div>

          <div className="lg:col-span-2 space-y-4">
            {/* Single bordered card: Commission + My Logos */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">

              {/* Commission summary */}
              <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900 mb-2">Commission</div>
                <div className="flex gap-6">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Earned</div>
                    <div className="text-lg font-black text-emerald-600">৳{totalEarnings}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Pending</div>
                    <div className="text-lg font-black text-gray-800">৳{totalPending}</div>
                  </div>
                </div>
              </div>

              {/* My logos header */}
              <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">My logos</div>
                  <div className="flex items-center gap-3 text-[10px] font-semibold">
                    <span className="flex items-center gap-1 text-amber-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                      {myItems.filter(i => i.approval_status === 'pending').length} pending
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                      {myItems.filter(i => i.approval_status === 'approved').length} live
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Logos go live in Design Studio once admin approves.</div>
              </div>

              {/* Logo list */}
              {myItems.length === 0 ? (
                <div className="p-6 text-sm text-gray-500 text-center">No logos submitted yet.</div>
              ) : (
                <div className="max-h-[480px] overflow-y-auto divide-y divide-gray-100">
                  {myItems.map((d) => (
                    <div key={d.id} className={`p-3 sm:p-4 flex items-center gap-3 ${
                      d.approval_status === 'approved' ? 'bg-emerald-50/30' :
                      d.approval_status === 'rejected' ? 'bg-red-50/30' : ''
                    }`}>
                      {/* Thumbnail with status dot */}
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-50">
                          <img src={toUrl(d.image)} alt={d.name} className="w-full h-full object-cover" />
                        </div>
                        {/* Status dot */}
                        <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          d.approval_status === 'approved' ? 'bg-emerald-500' :
                          d.approval_status === 'rejected' ? 'bg-red-500' : 'bg-amber-400'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm font-semibold text-gray-900 truncate">{d.name}</span>
                          <span className={`text-[10px] font-semibold whitespace-nowrap flex-shrink-0 ${
                            d.approval_status === 'approved' ? 'text-emerald-600' :
                            d.approval_status === 'rejected' ? 'text-red-500' : 'text-amber-600'
                          }`}>
                            {d.approval_status === 'approved' ? '· Live' :
                             d.approval_status === 'rejected' ? '· Rejected' : '· Pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {d.category && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{d.category}</span>}
                          <span className="text-[10px] text-gray-400">৳{d.commission_per_use}/use</span>
                        </div>
                        {d.approval_status === 'rejected' && d.rejection_reason && (
                          <div className="text-[10px] text-red-500 mt-0.5 truncate">Reason: {d.rejection_reason}</div>
                        )}
                      </div>

                      <div className="flex gap-1.5 flex-shrink-0">
                        {d.approval_status === 'approved' && (
                          <Link to="/design-studio"
                            className="px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs hover:bg-emerald-100 transition-colors"
                          >Studio</Link>
                        )}
                        <button
                          onClick={() => handleDeleteLogo(d.id, d.name)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-400 border border-red-100 hover:text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete"
                        >🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
