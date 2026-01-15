import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'

const cartItems = [
  {
    id: 1,
    name: 'Classic White T-Shirt',
    price: 999,
    quantity: 2,
    size: 'M',
    color: 'White',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
  },
  {
    id: 2,
    name: 'Denim Jacket',
    price: 3500,
    quantity: 1,
    size: 'L',
    color: 'Blue',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200',
  },
]

const Cart = () => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 2000 ? 0 : 100
  const total = subtotal + shipping

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl shadow-md">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        Size: {item.size} | Color: {item.color}
                      </p>
                    </div>
                    <button className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button className="p-2 hover:bg-gray-100">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-semibold">{item.quantity}</span>
                      <button className="p-2 hover:bg-gray-100">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold text-primary-600">৳{item.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
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
              {shipping === 0 && (
                <p className="text-sm text-green-600">You qualify for free shipping!</p>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary-600">৳{total}</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
              Proceed to Checkout
            </button>

            <Link
              to="/products"
              className="block text-center mt-4 text-primary-600 hover:text-primary-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any items yet.</p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  )
}

export default Cart
