import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingCart, Heart, Minus, Plus, Star, Truck, Shield, RefreshCw } from 'lucide-react'

const ProductDetail = () => {
  const { id } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('Black')

  const product = {
    id: Number(id),
    name: 'Classic White T-Shirt',
    price: 1200,
    discountPrice: 999,
    description: 'A comfortable and stylish classic white t-shirt made from 100% premium cotton. Perfect for everyday wear.',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Gray', 'Navy'],
    rating: 4.5,
    reviews: 128,
    stock: 50,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer hover:ring-2 hover:ring-primary-500">
                <img
                  src={product.imageUrl}
                  alt={`${product.name} ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          {/* Rating */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-gray-600">({product.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4 mb-6">
            {product.discountPrice ? (
              <>
                <span className="text-3xl font-bold text-primary-600">৳{product.discountPrice}</span>
                <span className="text-xl text-gray-400 line-through">৳{product.price}</span>
                <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded">
                  {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-primary-600">৳{product.price}</span>
            )}
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Color Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Color: {selectedColor}</h3>
            <div className="flex space-x-3">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 ${
                    selectedColor === color ? 'border-primary-600' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Size: {selectedSize}</h3>
            <div className="flex space-x-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-lg ${
                    selectedSize === size
                      ? 'border-primary-600 bg-primary-50 text-primary-600'
                      : 'border-gray-300 hover:border-primary-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Quantity</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-gray-500">{product.stock} items available</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 mb-8">
            <button className="flex-1 flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
            <button className="p-4 border border-gray-300 rounded-xl hover:bg-gray-50">
              <Heart className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex flex-col items-center text-center">
              <Truck className="w-6 h-6 text-primary-600 mb-2" />
              <span className="text-sm text-gray-600">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield className="w-6 h-6 text-primary-600 mb-2" />
              <span className="text-sm text-gray-600">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <RefreshCw className="w-6 h-6 text-primary-600 mb-2" />
              <span className="text-sm text-gray-600">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
