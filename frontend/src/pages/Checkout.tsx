import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

  const subtotal = useMemo(() => items.reduce((sum, x) => sum + x.unitPrice * x.quantity, 0), [items])
  const shipping = subtotal > 2000 ? 0 : items.length > 0 ? 100 : 0
  const total = subtotal + shipping

  const placeOrder = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    if (!shippingAddress.trim()) {
      alert('Shipping address is required')
      return
    }

    if (items.length === 0) {
      alert('Your cart is empty')
      return
    }

    setIsPlacing(true)
    try {
      const payload = {
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
        shipping_address: shippingAddress,
        payment_method: 'cod',
        items: items.map((x) => ({
          product_id: x.productId,
          quantity: x.quantity,
        })),
      }

      const data = await ordersAPI.createOrder(token, payload)
      setOrderId(data.id)
      clear()
    } catch (error: any) {
      alert('Order failed: ' + (error.response?.data?.detail || error.message))
    } finally {
      setIsPlacing(false)
    }
  }

  if (orderId) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900">Order placed!</h1>
          <p className="text-gray-600 mt-2">Your order id is #{orderId}</p>
          <div className="mt-6">
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Your cart is empty.</p>
          <div className="mt-6">
            <Link to="/products" className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-6">Shipping Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name (optional)</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Full address"
                rows={4}
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="font-semibold text-gray-900">Payment Method</div>
              <div className="text-gray-600 text-sm mt-1">Cash On Delivery (COD)</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `৳${shipping}`}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-600">৳{total}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={placeOrder}
            disabled={isPlacing}
            className="w-full mt-6 px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlacing ? 'Placing order...' : 'Place Order (COD)'}
          </button>

          <Link
            to="/cart"
            className="block text-center mt-4 text-primary-600 hover:text-primary-700"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Checkout
