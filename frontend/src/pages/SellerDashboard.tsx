import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Copy, ExternalLink, ShoppingBag, Sparkles, Store as StoreIcon, Phone, FileText, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react'
import { sellerAPI, storeAPI, designAPI, ordersAPI, toApiUrl } from '../services/api'

type Me = {
  id: number
  email: string
  full_name: string
  is_admin: boolean
  is_seller: boolean
  seller_status?: 'pending' | 'approved' | 'rejected' | null
}

type Store = {
  id: number
  name: string
  slug: string
  logo?: string | null
  banner?: string | null
  description?: string | null
}

type Product = {
  id: number
  name: string
  price: string
  buy_price: string
  discount_price?: string | null
  stock: number
  is_published: boolean
  design_preview?: string | null
  image?: string | null
  profit_per_unit?: string
  available_stock?: number
  admin_buy_price?: string
  views?: number
  sold?: number
}

type SellerOrderItem = {
  id: number
  product_id: number
  product_name: string
  quantity: number
  buy_price: string
  price: string
  line_total: string
  line_profit: string
}

type SellerOrder = {
  id: number
  created_at: string
  status: string
  payment_method: string
  customer_name?: string | null
  customer_phone?: string | null
  shipping_address: string
  buyer_email: string
  items: SellerOrderItem[]
  seller_total: string
  seller_profit: string
}

type SellerOrderSummary = {
  store_id: number | null
  orders: SellerOrder[]
  stats: {
    orders_count: number
    items_sold: number
    seller_revenue: string
    seller_profit: string
  }
}

const toUrl = toApiUrl

const SellerDashboard = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [me, setMe] = useState<Me | null>(null)
  const [phone, setPhone] = useState('')

  const [store, setStore] = useState<Store | null>(null)
  const [storeName, setStoreName] = useState('')
  const [storeDescription, setStoreDescription] = useState('')
  const [storeLogo, setStoreLogo] = useState<File | null>(null)
  const [storeBanner, setStoreBanner] = useState<File | null>(null)
  const [copied, setCopied] = useState(false)

  const [designs, setDesigns] = useState<Product[]>([])
  const [sellerOrders, setSellerOrders] = useState<SellerOrderSummary | null>(null)

  const token = localStorage.getItem('token')

  const storePublicUrl = store?.slug ? `${window.location.origin}/store/${store.slug}` : ''

  const onCopyStoreLink = async () => {
    if (!storePublicUrl) return
    try {
      await navigator.clipboard.writeText(storePublicUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      alert('Copy failed')
    }
  }

  const load = async () => {
    if (!token) {
      navigate('/login')
      return
    }

    setIsLoading(true)
    try {
      const { authAPI } = await import('../services/api')
      const meData = await authAPI.getMe(token)
      setMe(meData)

      if (meData.is_seller) {
        const myStore = await storeAPI.getMyStore(token)
        setStore(myStore)
        if (myStore) {
          const myDesigns = await designAPI.listMyDesigns(token)
          setDesigns(myDesigns)

          try {
            const summary = await ordersAPI.getSellerOrders(token)
            setSellerOrders(summary)
          } catch {
            setSellerOrders(null)
          }
        }
      }
    } catch (e) {
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

  const onBecomeSeller = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      await sellerAPI.becomeSeller(token, phone || undefined)
      await load()
    } catch (e: any) {
      alert(e.response?.data?.detail || e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const onCreateStore = async () => {
    if (!token) return
    if (!storeName.trim()) {
      alert('Store name is required')
      return
    }

    setIsLoading(true)
    try {
      await storeAPI.createStore(token, {
        name: storeName.trim(),
        description: storeDescription.trim() || undefined,
        logo: storeLogo,
        banner: storeBanner,
      })
      await load()
    } catch (e: any) {
      alert(e.response?.data?.detail || e.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!me) return null

  const sellerStatus = me.seller_status

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-emerald-700">{store ? 'My Store' : 'Seller Dashboard'}</div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{store ? store.name : 'Become a Seller'}</h1>
              <p className="text-gray-600 mt-1">{store ? 'Manage your store and products' : 'Start selling your designs and earn commissions'}</p>
            </div>

            {store && (
              <Link
                to="/seller/designs/new"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Create New Product
              </Link>
            )}
          </div>
        </div>

      {!me.is_seller ? (
        sellerStatus === 'pending' ? (
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-amber-900">Application Under Review</h2>
                <p className="text-amber-800 mt-2">Your seller request is being reviewed by our team. Once approved, you'll be able to create your store and start selling designs.</p>
                <div className="mt-4 p-4 bg-white rounded-xl border border-amber-100">
                  <div className="text-sm font-semibold text-gray-900 mb-2">What happens next?</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Review typically takes 24-48 hours</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> You'll receive an email notification</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Start uploading designs immediately after approval</li>
                  </ul>
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Link
                    to="/sell-your-design"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Sell Your Design
                  </Link>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : sellerStatus === 'rejected' ? (
          <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-red-700">Application Not Approved</h2>
                <p className="text-gray-700 mt-2">Your seller application was not approved. You can apply again after updating your profile information.</p>
                
                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Providing a phone number helps us verify your account faster.</p>
                </div>

                <button
                  onClick={onBecomeSeller}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  Apply Again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                  <StoreIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900">Create Your Store</h3>
                <p className="text-sm text-gray-600 mt-1">Set up your own branded store and showcase your designs.</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900">Sell Designs</h3>
                <p className="text-sm text-gray-600 mt-1">Upload your T-shirt designs and earn on every sale.</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Manage Orders</h3>
                <p className="text-sm text-gray-600 mt-1">Track orders and manage your business efficiently.</p>
              </div>
            </div>

            {/* Application Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900">Apply to Become a Seller</h2>
              <p className="text-gray-600 mt-1 mb-6">Join our community of designers and start selling your T-shirt designs today.</p>

              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100 p-5 mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">Providing a phone number helps us verify your account and contact you if needed.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onBecomeSeller}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Submit Application
                </button>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )
      ) : !store ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <StoreIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Your Store</h2>
              <p className="text-gray-600 mt-1">Set up your store with a name, logo, and description to start selling your designs.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Store Name *</label>
              <div className="relative">
                <StoreIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Your Brand Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Store Description</label>
              <div className="relative">
                <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  rows={4}
                  placeholder="Tell customers about your store and what makes your designs unique"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Store Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setStoreLogo(e.target.files?.[0] || null)}
                  className="w-full text-sm border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2">Recommended: Square image, at least 200x200px</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Store Banner (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setStoreBanner(e.target.files?.[0] || null)}
                  className="w-full text-sm border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2">Recommended: Wide image, at least 1200x400px</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={onCreateStore}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Create Store
            </button>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative">
              {store.banner ? (
                <img src={toUrl(store.banner)} alt={store.name} className="w-full h-56 md:h-64 object-cover" />
              ) : (
                <div className="w-full h-56 md:h-64 bg-gradient-to-r from-emerald-600 to-emerald-400" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 border border-white/30 flex items-center justify-center">
                      {store.logo ? (
                        <img src={toUrl(store.logo)} alt="logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-white/80 text-sm">Logo</div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{store.name}</h2>
                      {store.description && (
                        <p className="text-white/90 mt-1 max-w-2xl line-clamp-2">{store.description}</p>
                      )}
                      <p className="text-white/80 mt-2 text-sm">{storePublicUrl}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/store/${store.slug}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/90 hover:bg-white text-gray-900 font-semibold"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Store
                    </Link>
                    <button
                      type="button"
                      onClick={onCopyStoreLink}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copied' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/seller/orders-received"
              className="flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <ShoppingBag className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Orders Received</h3>
                <p className="text-sm text-gray-600">View and manage customer orders</p>
              </div>
            </Link>

            <Link
              to="/design-studio"
              className="flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Sparkles className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Create Design</h3>
                <p className="text-sm text-gray-600">Design custom products</p>
              </div>
            </Link>

            <Link
              to="/sell-your-design"
              className="flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <Sparkles className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">My Logo Designs</h3>
                <p className="text-sm text-gray-600">Upload and manage your designs</p>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Products</h3>
              <span className="text-sm text-gray-500">{designs.length} items</span>
            </div>

            {designs.length === 0 ? (
              <div className="text-gray-600">No products yet. Create your first product from Design Studio.</div>
            ) : (
              <div className="space-y-4">
                {designs.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={toUrl(p.design_preview || p.image) || 'https://via.placeholder.com/600x600'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{p.name}</h3>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500 block text-xs">Buy Price</span>
                            <span className="font-semibold text-gray-900">৳{Number(p.admin_buy_price ?? p.buy_price)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-xs">Sell Price</span>
                            <span className="font-semibold text-emerald-600">৳{Number(p.price)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-xs">Stock</span>
                            <span className="font-semibold text-gray-900">{Number(p.available_stock ?? p.stock ?? 0)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-xs">Profit/unit</span>
                            <span className="font-semibold text-green-600">৳{Number(p.profit_per_unit || 0)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-xs">Views</span>
                            <span className="font-semibold text-blue-600">{Number(p.views || 0)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-xs">Sold</span>
                            <span className="font-semibold text-purple-600">{Number(p.sold || 0)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Badge & Action Button */}
                      <div className="flex flex-col items-end gap-3">
                        <span className={`inline-block text-xs px-3 py-1.5 rounded-full font-semibold ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {p.is_published ? 'Published' : 'Pending'}
                        </span>
                        <Link
                          to={`/products/${p.id}`}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm whitespace-nowrap"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default SellerDashboard
