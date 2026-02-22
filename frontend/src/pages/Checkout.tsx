import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, ChevronRight, Shield, Truck, CreditCard, MapPin, Trash2 } from 'lucide-react'
import { ordersAPI } from '../services/api'
import { useCartStore } from '../store/cartStore'

type AddressItem = {
  id: string
  name: string
  phone: string
  address: string
}

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
  const [savedAddresses, setSavedAddresses] = useState<AddressItem[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [showAddressBook, setShowAddressBook] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'card'>('cod')

  const subtotal = useMemo(() => items.reduce((sum, x) => sum + x.unitPrice * x.quantity, 0), [items])
  const shipping = subtotal > 2000 ? 0 : items.length > 0 ? 100 : 0
  const total = subtotal + shipping

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const raw = localStorage.getItem('addressBook')
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          setSavedAddresses(Array.isArray(parsed) ? parsed : [])
          setShowAddressBook(Array.isArray(parsed) && parsed.length > 0)
        } catch {
          setSavedAddresses([])
        }
      }
    }
  }, [])

  const handleSelectAddress = (addressItem: AddressItem) => {
    setSelectedAddressId(addressItem.id)
    setCustomerName(addressItem.name)
    setCustomerPhone(addressItem.phone)
    setShippingAddress(addressItem.address)
  }

  const handleRemoveAddress = (id: string, name: string) => {
    setDeleteConfirm({ id, name })
  }

  const confirmRemoveAddress = () => {
    if (!deleteConfirm) return
    
    const updatedAddresses = savedAddresses.filter(addr => addr.id !== deleteConfirm.id)
    setSavedAddresses(updatedAddresses)
    localStorage.setItem('addressBook', JSON.stringify(updatedAddresses))
    
    if (selectedAddressId === deleteConfirm.id) {
      setSelectedAddressId('')
      setCustomerName('')
      setCustomerPhone('')
      setShippingAddress('')
    }
    
    if (updatedAddresses.length === 0) {
      setShowAddressBook(false)
    }
    
    setDeleteConfirm(null)
  }

  const cancelRemoveAddress = () => {
    setDeleteConfirm(null)
  }

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
        payment_method: 'cod' as const, // Currently only COD is supported, will be dynamic when other gateways are added
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-full mb-4 shadow-lg animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-lg text-gray-600">Thank you for your purchase</p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div>
                <div className="text-sm text-gray-600">Order Number</div>
                <div className="text-2xl font-bold text-gray-900">#{orderId}</div>
              </div>
              <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-semibold text-sm">
                Confirmed
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-700">
                <Truck className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-semibold">Estimated Delivery</div>
                  <div className="text-sm text-gray-600">3-5 business days</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-semibold">Payment Method</div>
                  <div className="text-sm text-gray-600">Cash on Delivery</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-semibold">Delivery Address</div>
                  <div className="text-sm text-gray-600 line-clamp-2">{shippingAddress}</div>
                </div>
              </div>
            </div>

            {/* What's Next Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-100">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600">✓</span> What's Next?
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  <span>You'll receive an order confirmation email shortly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  <span>Track your order status in the Orders page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  <span>Our team will contact you before delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  <span>Pay in cash when you receive your order</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/orders" 
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Shield className="w-5 h-5" />
              Track My Order
            </Link>
            <Link 
              to="/" 
              className="inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact us at{' '}
              <a href="tel:19008188" className="text-emerald-600 hover:underline font-medium">19008188</a>
              {' '}or{' '}
              <a href="mailto:support@lyriczfashion.com" className="text-emerald-600 hover:underline font-medium">support@lyriczfashion.com</a>
            </p>
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
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              {showAddressBook && savedAddresses.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Saved Addresses</label>
                    <Link to="/address-book" className="text-xs text-emerald-600 hover:underline">
                      Manage Addresses
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300 bg-white'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectAddress(addr)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start gap-3">
                            <MapPin className={`w-5 h-5 mt-0.5 ${
                              selectedAddressId === addr.id ? 'text-emerald-600' : 'text-gray-400'
                            }`} />
                            <div className="flex-1 pr-8">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{addr.name}</span>
                                {selectedAddressId === addr.id && (
                                  <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">Selected</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{addr.phone}</p>
                              <p className="text-sm text-gray-700 mt-1">{addr.address}</p>
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveAddress(addr.id, addr.name)
                          }}
                          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddressId('')
                        setCustomerName('')
                        setCustomerPhone('')
                        setShippingAddress('')
                      }}
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      + Use a different address
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value)
                    setSelectedAddressId('')
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value)
                    setSelectedAddressId('')
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address <span className="text-red-500">*</span></label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => {
                    setShippingAddress(e.target.value)
                    setSelectedAddressId('')
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Full delivery address"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method <span className="text-red-500">*</span></label>
                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'cod' ? 'border-emerald-600' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'cod' && (
                          <div className="w-3 h-3 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <CreditCard className={`w-5 h-5 ${
                        paymentMethod === 'cod' ? 'text-emerald-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay when you receive your order</div>
                      </div>
                      {paymentMethod === 'cod' && (
                        <span className="px-2 py-1 bg-emerald-600 text-white text-xs rounded-full font-medium">Selected</span>
                      )}
                    </div>
                  </button>

                  {/* bKash - Coming Soon */}
                  <div className="relative">
                    <button
                      type="button"
                      disabled
                      className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-left opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        <div className="w-5 h-5 bg-pink-600 rounded flex items-center justify-center text-white text-xs font-bold">bK</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">bKash</div>
                          <div className="text-sm text-gray-600">Mobile payment</div>
                        </div>
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full font-medium">Coming Soon</span>
                      </div>
                    </button>
                  </div>

                  {/* Nagad - Coming Soon */}
                  <div className="relative">
                    <button
                      type="button"
                      disabled
                      className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-left opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        <div className="w-5 h-5 bg-orange-600 rounded flex items-center justify-center text-white text-xs font-bold">N</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Nagad</div>
                          <div className="text-sm text-gray-600">Mobile payment</div>
                        </div>
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full font-medium">Coming Soon</span>
                      </div>
                    </button>
                  </div>

                  {/* Credit/Debit Card - Coming Soon */}
                  <div className="relative">
                    <button
                      type="button"
                      disabled
                      className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-left opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Credit/Debit Card</div>
                          <div className="text-sm text-gray-600">Visa, Mastercard, Amex</div>
                        </div>
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full font-medium">Coming Soon</span>
                      </div>
                    </button>
                  </div>
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Address</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove the address for <span className="font-semibold">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelRemoveAddress}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveAddress}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Checkout
