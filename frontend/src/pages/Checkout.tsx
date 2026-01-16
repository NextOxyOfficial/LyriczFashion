import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, ChevronRight, Shield, Truck, CreditCard } from 'lucide-react'
import { ordersAPI } from '../services/api'
import { useCartStore } from '../store/cartStore'

const Checkout = () => {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [isPlacing, setIsPlacing] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const subtotal = useMemo(() => items.reduce((sum, x) => sum + x.unitPrice * x.quantity, 0), [items])
  const shipping = subtotal > 2000 ? 0 : items.length > 0 ? 100 : 0
  const total = subtotal + shipping

  const placeOrder = async () => {
    setError('')
    const token = localStorage.getItem('token')
    
    if (!shippingAddress.trim()) {
      setError('Please enter your shipping address')
      return
    }
    if (items.length === 0) {
      setError('Your cart is empty')
      return
    }

    setIsPlacing(true)
    try {
      const payload = {
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
        shipping_address: shippingAddress,
        payment_method: 'cod' as const,
        items: items.map((x) => ({ product_id: x.productId, quantity: x.quantity })),
      }
      
      // Use guest API if not logged in, otherwise use authenticated API
      const data = token 
        ? await ordersAPI.createOrder(token, payload)
        : await ordersAPI.createGuestOrder(payload)
      
      setOrderId(data.id)
      clear()
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Order failed')
    } finally {
      setIsPlacing(false)
    }
  }

  if (orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-6">Your order #{orderId} has been confirmed.</p>
          <div className="flex flex-col gap-3">
            <Link to="/orders" className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
              View Orders
            </Link>
            <Link to="/" className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some products to checkout.</p>
          <Link to="/products" className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/cart" className="hover:text-emerald-600">Cart</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Checkout</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        {!localStorage.getItem('token') && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Checking out as Guest</h3>
                <p className="text-blue-800 text-sm mb-3">
                  You're placing an order without an account. This is totally fine! But if you create an account, you'll get:
                </p>
                <ul className="text-blue-800 text-sm space-y-1 mb-3">
                  <li>• Order history and tracking</li>
                  <li>• Faster checkout next time</li>
                  <li>• Exclusive member discounts</li>
                  <li>• Save your favorite designs</li>
                </ul>
                <div className="flex gap-2">
                  <Link 
                    to="/register" 
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Account
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-4 py-2 border border-blue-300 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>
              {!localStorage.getItem('token') && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Guest Checkout
                </span>
              )}
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address <span className="text-red-500">*</span></label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Full delivery address"
                  rows={3}
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Cash On Delivery</div>
                  <div className="text-sm text-gray-500">Pay when you receive</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                    <span className="font-medium">৳{item.unitPrice * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 mt-1">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-emerald-600' : ''}>{shipping === 0 ? 'Free' : `৳${shipping}`}</span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-emerald-600">৳{total}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={isPlacing}
                className="w-full mt-5 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacing ? 'Placing Order...' : 'Place Order'}
              </button>

              <Link to="/cart" className="block text-center mt-3 text-sm text-emerald-600 hover:underline">
                ← Back to Cart
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>Fast delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
