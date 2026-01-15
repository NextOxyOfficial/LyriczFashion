import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sellerAPI, storeAPI, designAPI, ordersAPI } from '../services/api'

type Me = {
  id: number
  email: string
  full_name: string
  is_admin: boolean
  is_seller: boolean
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

const API_BASE_URL = 'http://localhost:8000'

const toUrl = (path?: string | null) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path}`
}

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

  const [designs, setDesigns] = useState<Product[]>([])
  const [sellerOrders, setSellerOrders] = useState<SellerOrderSummary | null>(null)

  const token = localStorage.getItem('token')

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
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!me) return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your store and designs</p>
        </div>
        {store?.slug && (
          <Link
            to={`/store/${store.slug}`}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
          >
            View Store
          </Link>
        )}
      </div>

      {!me.is_seller ? (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Become a Seller</h2>
          <p className="text-gray-600 mb-6">Join as a seller to create your store and publish your T-shirt designs.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            onClick={onBecomeSeller}
            className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
          >
            Become Seller
          </button>
        </div>
      ) : !store ? (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Create Your Store</h2>
          <p className="text-gray-600 mb-6">Add store name and logo to start selling your designs.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Your Brand Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setStoreLogo(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Tell customers about your store"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setStoreBanner(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
              />
            </div>
          </div>

          <button
            onClick={onCreateStore}
            className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
          >
            Create Store
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            {store.banner && (
              <div className="h-48 bg-gray-100">
                <img src={toUrl(store.banner)} alt={store.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center">
                  {store.logo ? (
                    <img src={toUrl(store.logo)} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400">Logo</div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{store.name}</h2>
                  <p className="text-gray-600 text-sm">Store URL: /store/{store.slug}</p>
                </div>
              </div>

              <Link
                to="/seller/designs/new"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
              >
                Create New Design
              </Link>
            </div>
          </div>

          {sellerOrders && (
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Earnings Summary</h3>
                <span className="text-sm text-gray-500">Store #{sellerOrders.store_id || '-'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-2xl p-4">
                  <div className="text-sm text-gray-500">Orders</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{sellerOrders.stats.orders_count}</div>
                </div>
                <div className="border border-gray-200 rounded-2xl p-4">
                  <div className="text-sm text-gray-500">Revenue</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">৳{Number(sellerOrders.stats.seller_revenue || 0)}</div>
                </div>
                <div className="border border-gray-200 rounded-2xl p-4">
                  <div className="text-sm text-gray-500">Profit</div>
                  <div className="text-2xl font-bold text-green-700 mt-1">৳{Number(sellerOrders.stats.seller_profit || 0)}</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Recent Orders</h4>
                  <span className="text-sm text-gray-500">{sellerOrders.orders.length} orders</span>
                </div>

                {sellerOrders.orders.length === 0 ? (
                  <div className="text-gray-600">No orders yet.</div>
                ) : (
                  <div className="space-y-4">
                    {sellerOrders.orders.slice(0, 6).map((o) => (
                      <div key={o.id} className="border border-gray-200 rounded-2xl p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <div className="font-semibold text-gray-900">Order #{o.id}</div>
                            <div className="text-sm text-gray-600 mt-1">Buyer: {o.buyer_email || '-'}</div>
                            <div className="text-sm text-gray-600">Status: {o.status}</div>
                          </div>
                          <div className="text-sm">
                            <div className="text-gray-600">Seller Total: <span className="font-semibold text-gray-900">৳{Number(o.seller_total || 0)}</span></div>
                            <div className="text-gray-600">Profit: <span className="font-semibold text-green-700">৳{Number(o.seller_profit || 0)}</span></div>
                          </div>
                        </div>

                        <div className="mt-4 border-t pt-4 space-y-2">
                          {o.items.map((it) => (
                            <div key={it.id} className="flex items-center justify-between text-sm">
                              <div className="text-gray-700">
                                {it.product_name} x {it.quantity}
                              </div>
                              <div className="text-gray-600">
                                ৳{Number(it.line_total || 0)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">My Designs</h3>
              <span className="text-sm text-gray-500">{designs.length} items</span>
            </div>

            {designs.length === 0 ? (
              <div className="text-gray-600">No designs yet. Create your first design.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs.map((p) => (
                  <div key={p.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={toUrl(p.design_preview || p.image) || 'https://via.placeholder.com/600x600'}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900 line-clamp-1">{p.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Buy: ৳{Number(p.buy_price)} | Sell: ৳{Number(p.price)}
                          </div>
                          <div className="text-sm text-green-700 mt-1">
                            Profit/unit: ৳{Number(p.profit_per_unit || 0)}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {p.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      <Link
                        to={`/products/${p.id}`}
                        className="mt-4 inline-flex w-full items-center justify-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerDashboard
