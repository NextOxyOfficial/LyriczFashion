import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Heart, Minus, Plus, Star, Truck, Shield, RefreshCw, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { productsAPI } from '../services/api'
import { useCartStore } from '../store/cartStore'
import ProductCard from '../components/ProductCard'

const API_BASE_URL = 'http://localhost:8000'

const toUrl = (path?: string | null) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path}`
}

const ProductDetail = () => {
  const { id } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('Black')
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'specifications'>('description')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const data = await productsAPI.getById(Number(id))
        setProduct(data)
        
        // Load related products
        const allProducts = await productsAPI.getFeed()
        setRelatedProducts(allProducts.filter((p: any) => p.id !== Number(id)).slice(0, 4))
      } catch {
        setProduct(null)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const colors = ['White', 'Black', 'Gray', 'Navy', 'Red']
  const rating = 4.5
  const reviewsCount = 128
  
  const productImages = [
    toUrl(product?.design_preview || product?.image) || 'https://via.placeholder.com/800x800',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop',
  ]
  
  const mockReviews = [
    { id: 1, name: 'John Doe', rating: 5, comment: 'Excellent quality! Love the design and fit.', date: '2024-01-10' },
    { id: 2, name: 'Jane Smith', rating: 4, comment: 'Great product, fast shipping. Highly recommend!', date: '2024-01-08' },
    { id: 3, name: 'Mike Johnson', rating: 5, comment: 'Perfect! Exactly what I was looking for.', date: '2024-01-05' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Link to="/products" className="text-emerald-600 hover:text-emerald-700">Browse all products</Link>
        </div>
      </div>
    )
  }

  const imageUrl = productImages[selectedImage]
  const unitPrice = product.discount_price ? Number(product.discount_price) : Number(product.price)

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-emerald-600">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-2xl p-8 shadow-sm">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 group">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {/* Navigation Arrows */}
              <button
                onClick={() => setSelectedImage((selectedImage - 1 + productImages.length) % productImages.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedImage((selectedImage + 1) % productImages.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer transition-all ${
                    selectedImage === i ? 'ring-2 ring-emerald-600' : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
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
                  className={`w-5 h-5 ${star <= Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-gray-600">({reviewsCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4 mb-6">
            {product.discount_price ? (
              <>
                <span className="text-4xl font-bold text-emerald-600">৳{Number(product.discount_price)}</span>
                <span className="text-xl text-gray-400 line-through">৳{Number(product.price)}</span>
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                  {Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100)}% OFF
                </span>
              </>
            ) : (
              <span className="text-4xl font-bold text-emerald-600">৳{Number(product.price)}</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                ✓ In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          {/* Color Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Color: {selectedColor}</h3>
            <div className="flex space-x-3">
              {colors.map((color) => (
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
              {sizes.map((size) => (
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
            <button
              type="button"
              onClick={() =>
                addItem({
                  productId: Number(product.id),
                  name: product.name,
                  unitPrice,
                  imageUrl,
                  quantity,
                  options: {
                    size: selectedSize,
                    color: selectedColor,
                  },
                })
              }
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`p-4 border-2 rounded-xl transition-colors ${
                isWishlisted
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`w-6 h-6 ${
                isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-600'
              }`} />
            </button>
            <button className="p-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              <Share2 className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex flex-col items-center text-center p-4 bg-emerald-50 rounded-lg">
              <Truck className="w-6 h-6 text-emerald-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Free Shipping</span>
              <span className="text-xs text-gray-500">On orders over ৳2000</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-emerald-50 rounded-lg">
              <Shield className="w-6 h-6 text-emerald-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Secure Payment</span>
              <span className="text-xs text-gray-500">100% protected</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-emerald-50 rounded-lg">
              <RefreshCw className="w-6 h-6 text-emerald-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Easy Returns</span>
              <span className="text-xs text-gray-500">7 days policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'description'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'specifications'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'reviews'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews ({reviewsCount})
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'No description available.'}
                </p>
                <h3 className="text-lg font-semibold mt-6 mb-3">Product Features:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Premium quality fabric for maximum comfort</li>
                  <li>Durable and long-lasting construction</li>
                  <li>Available in multiple sizes and colors</li>
                  <li>Easy to care for - machine washable</li>
                  <li>Perfect for casual and everyday wear</li>
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 font-semibold text-gray-700">Material</td>
                      <td className="py-3 text-gray-600">100% Cotton</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-gray-700">Available Sizes</td>
                      <td className="py-3 text-gray-600">XS, S, M, L, XL, XXL</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-gray-700">Available Colors</td>
                      <td className="py-3 text-gray-600">White, Black, Gray, Navy, Red</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-gray-700">Care Instructions</td>
                      <td className="py-3 text-gray-600">Machine wash cold, tumble dry low</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-gray-700">Country of Origin</td>
                      <td className="py-3 text-gray-600">Bangladesh</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Rating Summary */}
                <div className="flex items-center gap-8 pb-6 border-b">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900">{rating}</div>
                    <div className="flex items-center justify-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{reviewsCount} reviews</div>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600 w-8">{stars}★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{ width: `${stars === 5 ? 70 : stars === 4 ? 20 : 10}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-12">
                          {stars === 5 ? 70 : stars === 4 ? 20 : 10}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-emerald-600">
                              {review.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{review.name}</div>
                            <div className="text-sm text-gray-500">{review.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                id={relatedProduct.id}
                name={relatedProduct.name}
                price={Number(relatedProduct.price)}
                discountPrice={relatedProduct.discount_price ? Number(relatedProduct.discount_price) : undefined}
                imageUrl={relatedProduct.image_url || relatedProduct.design_preview || relatedProduct.image || 'https://via.placeholder.com/300x400'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  )
}

export default ProductDetail
