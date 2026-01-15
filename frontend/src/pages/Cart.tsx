import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingBag, ChevronRight, Truck, Shield, Tag, Gift, ArrowRight } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

const Cart = () => {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const clearCart = useCartStore((s) => s.clear)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponDiscount, setCouponDiscount] = useState(0)

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const shipping = items.length > 0 ? (subtotal > 2000 ? 0 : 100) : 0
  const discount = couponDiscount
  const total = subtotal + shipping - discount
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const freeShippingProgress = Math.min((subtotal / 2000) * 100, 100)

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE10') {
      setCouponDiscount(Math.round(subtotal * 0.1))
      setAppliedCoupon('SAVE10')
    } else if (couponCode.toUpperCase() === 'FLAT100') {
      setCouponDiscount(100)
      setAppliedCoupon('FLAT100')
    } else {
      alert('Invalid coupon code')
    }
    setCouponCode('')
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponDiscount(0)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Shopping Cart</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500 mt-1">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => clearCart()}
              className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          )}
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free Shipping Progress */}
              {subtotal < 2000 && (
                <div className="bg-emerald-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">
                      Add ৳{2000 - subtotal} more for FREE shipping!
                    </span>
                  </div>
                  <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Cart Items List */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                </div>

                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`p-6 ${index !== items.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Product Info */}
                      <div className="col-span-6 flex gap-4">
                        <Link to={`/products/${item.productId}`}>
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-xl border border-gray-100"
                          />
                        </Link>
                        <div className="flex flex-col justify-center">
                          <Link 
                            to={`/products/${item.productId}`}
                            className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
                          >
                            {item.name}
                          </Link>
                          <div className="flex gap-3 mt-2 text-sm text-gray-500">
                            {item.options?.size && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded">
                                Size: {item.options.size}
                              </span>
                            )}
                            {item.options?.color && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded">
                                Color: {item.options.color}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-600 text-sm mt-2 flex items-center gap-1 w-fit"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-center">
                        <span className="font-semibold text-gray-900">৳{item.unitPrice}</span>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex items-center border-2 border-gray-200 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="px-4 py-2 font-semibold text-gray-900 min-w-[50px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="col-span-2 text-right">
                        <span className="font-bold text-emerald-600 text-lg">
                          ৳{item.unitPrice * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mt-4"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Coupon Code */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">Apply Coupon</h3>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium text-emerald-700">{appliedCoupon}</span>
                      <span className="text-sm text-emerald-600">(-৳{couponDiscount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">Try: SAVE10 or FLAT100</p>
              </div>

              {/* Order Summary Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-medium">৳{subtotal}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : ''}`}>
                      {shipping === 0 ? 'FREE' : `৳${shipping}`}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span className="font-medium">-৳{discount}</span>
                    </div>
                  )}

                  <div className="border-t-2 border-gray-100 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-emerald-600">৳{total}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">Including VAT</p>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="flex items-center justify-center gap-2 w-full mt-6 px-6 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </Link>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">We Accept</h3>
                <div className="flex gap-3">
                  <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">bKash</div>
                  <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">Nagad</div>
                  <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">COD</div>
                  <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">Card</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart */
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-16 h-16 text-emerald-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping and discover amazing products!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
