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
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-[1480px] mx-auto px-2 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders Received</h1>
          <p className="text-gray-600 mt-1">Manage and track your customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.orders_count}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Items Sold</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.items_sold}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">৳{Number(stats.seller_revenue).toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Profit</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">৳{Number(stats.seller_profit).toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">When customers purchase your products, orders will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-lg font-bold text-gray-900">৳{Number(order.seller_total).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Profit</p>
                        <p className="text-lg font-bold text-emerald-600">৳{Number(order.seller_profit).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-16 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Customer:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {order.customer_name || order.buyer_email}
                        </span>
                      </div>
                      {order.customer_phone && (
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <span className="ml-2 font-medium text-gray-900">{order.customer_phone}</span>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="ml-2 font-medium text-gray-900">{order.shipping_address}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Payment:</span>
                        <span className="ml-2 font-medium text-gray-900">{order.payment_method}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Items:</p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
                            <div>
                              <span className="font-medium text-gray-900">{item.product_name}</span>
                              <span className="text-gray-600 ml-2">× {item.quantity}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-600">৳{Number(item.price)} each</span>
                              <span className="font-semibold text-gray-900">৳{Number(item.line_total)}</span>
                              <span className="text-emerald-600 font-semibold">+৳{Number(item.line_profit)} profit</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
