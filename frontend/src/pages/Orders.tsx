import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { ordersAPI } from '../services/api'

interface Order {
  id: number
  created_at: string
  status: string
  total_amount: string | number
  items: Array<{
    id: number
    product: number
    product_name: string
    quantity: number
    price: string | number
    buy_price: string | number
    total_profit?: string | number
  }>
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all')
  const navigate = useNavigate()

  useEffect(() => {
    const loadOrders = async () => {
      setError('')
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const ordersData = await ordersAPI.listMyOrders(token)
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      } catch (error) {
        console.error('Failed to load orders:', error)
        setError('Failed to load orders. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [navigate])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatMoney = (value: string | number) => {
    const n = typeof value === 'number' ? value : Number(value)
    if (Number.isFinite(n)) return n
    return 0
  }

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeFilter)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl lg:max-w-[1480px] mx-auto px-2 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 text-xs sm:text-base mt-0.5">Track and manage your orders</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Filter Tabs - single scrollable row */}
        <div className="bg-white rounded-xl shadow-sm px-2 py-2.5 mb-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {([
              { key: 'all', label: 'All', color: 'bg-emerald-600', count: orders.length },
              { key: 'pending', label: 'Pending', color: 'bg-yellow-500', count: orders.filter(o => o.status === 'pending').length },
              { key: 'processing', label: 'Processing', color: 'bg-blue-600', count: orders.filter(o => o.status === 'processing').length },
              { key: 'shipped', label: 'Shipped', color: 'bg-purple-600', count: orders.filter(o => o.status === 'shipped').length },
              { key: 'delivered', label: 'Delivered', color: 'bg-green-600', count: orders.filter(o => o.status === 'delivered').length },
              { key: 'cancelled', label: 'Cancelled', color: 'bg-red-500', count: orders.filter(o => o.status === 'cancelled').length },
            ] as const).map(({ key, label, color, count }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === key ? `${color} text-white` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet</p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-3 sm:px-5 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="text-[10px] text-gray-400">Order</div>
                        <div className="text-sm font-bold text-gray-900">#{order.id}</div>
                      </div>
                      <div className="h-6 w-px bg-gray-200 flex-shrink-0"></div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-gray-400">Date</div>
                        <div className="text-xs font-medium text-gray-800 truncate">{formatDate(order.created_at)}</div>
                      </div>
                      <div className="h-6 w-px bg-gray-200 flex-shrink-0"></div>
                      <div className="flex-shrink-0">
                        <div className="text-[10px] text-gray-400">Total</div>
                        <div className="text-sm font-bold text-emerald-600">৳{formatMoney(order.total_amount)}</div>
                      </div>
                    </div>
                    <div className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize hidden sm:inline">{order.status}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-3 sm:px-5 py-3">
                  <div className="space-y-2.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/products/${item.product}`}
                            className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors truncate block"
                          >
                            {item.product_name}
                          </Link>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 flex-shrink-0">৳{formatMoney(item.price)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
