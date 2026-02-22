import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { ordersAPI } from '../services/api'

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

const SellerOrdersReceived = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [orderData, setOrderData] = useState<SellerOrderSummary | null>(null)

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      setIsLoading(true)
      try {
        const data = await ordersAPI.getSellerOrders(token)
        setOrderData(data)
      } catch (error) {
        console.error('Failed to load orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [navigate])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'processing':
      case 'shipped':
        return <Package className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  const stats = orderData?.stats || {
    orders_count: 0,
    items_sold: 0,
    seller_revenue: '0',
    seller_profit: '0',
  }

  const orders = orderData?.orders || []

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-6">
      <div className="max-w-2xl lg:max-w-[1480px] mx-auto px-2 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Orders Received</h1>
          <p className="text-gray-500 text-xs sm:text-base mt-0.5">Manage and track your customer orders</p>
        </div>

        {/* Stats Cards - 2x2 on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total Orders', value: stats.orders_count, icon: <Package className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-100', text: 'text-gray-900' },
            { label: 'Items Sold', value: stats.items_sold, icon: <TrendingUp className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-100', text: 'text-gray-900' },
            { label: 'Revenue', value: `৳${Number(stats.seller_revenue).toFixed(2)}`, icon: <TrendingUp className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-100', text: 'text-gray-900' },
            { label: 'Profit', value: `৳${Number(stats.seller_profit).toFixed(2)}`, icon: <TrendingUp className="w-5 h-5 text-green-600" />, bg: 'bg-green-100', text: 'text-emerald-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium truncate">{s.label}</p>
                  <p className={`text-lg sm:text-2xl font-bold mt-0.5 ${s.text}`}>{s.value}</p>
                </div>
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-10 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">No orders yet</h3>
              <p className="text-sm text-gray-500">When customers purchase your products, orders will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="p-3 sm:p-5 hover:bg-gray-50 transition-colors">
                  {/* Order top row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-gray-900">Order #{order.id}</span>
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">Revenue</p>
                        <p className="text-sm font-bold text-gray-900">৳{Number(order.seller_total).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">Profit</p>
                        <p className="text-sm font-bold text-emerald-600">৳{Number(order.seller_profit).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer info */}
                  <div className="text-xs text-gray-500 space-y-0.5 mb-3">
                    <div><span className="font-medium text-gray-700">{order.customer_name || order.buyer_email}</span>{order.customer_phone && <span className="ml-2 text-gray-400">{order.customer_phone}</span>}</div>
                    <div className="truncate">{order.shipping_address}</div>
                    <div>Payment: <span className="font-medium text-gray-700">{order.payment_method}</span></div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <div className="min-w-0">
                          <span className="font-medium text-gray-900 truncate block">{item.product_name}</span>
                          <span className="text-gray-400">×{item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="font-semibold text-gray-900">৳{Number(item.line_total)}</span>
                          <span className="text-emerald-600 font-semibold">+৳{Number(item.line_profit)}</span>
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
    </div>
  )
}

export default SellerOrdersReceived
