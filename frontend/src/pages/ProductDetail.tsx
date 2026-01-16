import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Heart, Minus, Plus, Star, Truck, Shield, RefreshCw, Share2, ChevronLeft, ChevronRight, Check } from 'lucide-react'
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
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const data = await productsAPI.getById(Number(id))
        setProduct(data)
        const allProducts = await productsAPI.getFeed()
        setRelatedProducts(allProducts.filter((p: any) => p.id !== Number(id)).slice(0, 4))
        
        // Check if product is in favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
        setIsWishlisted(favorites.includes(Number(id)))
      } catch {
        setProduct(null)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  const toggleWishlist = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    const productId = Number(id)
    
    if (isWishlisted) {
      const newFavorites = favorites.filter((fav: number) => fav !== productId)
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      setIsWishlisted(false)
    } else {
      const newFavorites = [...favorites, productId]
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      setIsWishlisted(true)
    }
    
    // Dispatch custom event to update navbar
    window.dispatchEvent(new CustomEvent('favoritesUpdated'))
  }

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const colors = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#111827' },
    { name: 'Gray', hex: '#9CA3AF' },
    { name: 'Navy', hex: '#1E3A8A' },
    { name: 'Red', hex: '#EF4444' },
  ]
  const rating = 4.5

  const productImages = product ? [
    toUrl(product.design_preview_front || product.design_preview || product.image || product.image_url) || 'https://via.placeholder.com/600',
    toUrl(product.design_preview_back),
  ].filter(Boolean) : []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <Link to="/products" className="text-emerald-600 hover:underline">Browse all products</Link>
        </div>
      </div>
    )
  }

  const imageUrl = productImages[selectedImage] || 'https://via.placeholder.com/600'
  const unitPrice = product.discount_price ? Number(product.discount_price) : Number(product.price)

  const handleAddToCart = () => {
    addItem({
      productId: Number(product.id),
      name: product.name,
      unitPrice,
      imageUrl,
      quantity,
      options: { size: selectedSize, color: selectedColor },
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-emerald-600">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((selectedImage - 1 + productImages.length) % productImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((selectedImage + 1) % productImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {productImages.length > 1 && (
                <div className="flex gap-3">
                  {productImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-emerald-600' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${star <= Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                {product.discount_price ? (
                  <>
                    <span className="text-3xl font-bold text-emerald-600">৳{Number(product.discount_price)}</span>
                    <span className="text-lg text-gray-400 line-through">৳{Number(product.price)}</span>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded">
                      {Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-emerald-600">৳{Number(product.price)}</span>
                )}
              </div>

              <div className="mb-4">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
                    <Check className="w-4 h-4" /> In Stock ({product.stock})
                  </span>
                ) : (
                  <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">Out of Stock</span>
                )}
              </div>

              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Color: {selectedColor}</label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === c.name ? 'border-emerald-600 scale-110' : 'border-gray-200'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Size: {selectedSize}</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${selectedSize === size ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-300'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-50">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-50">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">{product.stock} available</span>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${addedToCart ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'} disabled:bg-gray-300 disabled:cursor-not-allowed`}
                >
                  {addedToCart ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                </button>
                <button
                  onClick={toggleWishlist}
                  className={`p-3 rounded-xl border-2 transition-colors ${isWishlisted ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
                  title={isWishlisted ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
                </button>
                <button className="p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors">
                  <Share2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-base font-semibold text-gray-900 mb-3">Description</div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {product.description?.trim() ? product.description : 'This product has no description available at the moment. Contact us for more details about this item.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-5 border-t">
                <div className="flex flex-col items-center text-center p-3 bg-emerald-50 rounded-lg">
                  <Truck className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">Free Shipping</span>
                  <span className="text-xs text-gray-500">Over ৳2000</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-emerald-50 rounded-lg">
                  <Shield className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">Secure</span>
                  <span className="text-xs text-gray-500">Payment</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-emerald-50 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">Easy Return</span>
                  <span className="text-xs text-gray-500">7 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={Number(p.price)}
                  discountPrice={p.discount_price ? Number(p.discount_price) : undefined}
                  imageUrl={p.image_url || p.design_preview || p.image || 'https://via.placeholder.com/300'}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {addedToCart && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>Added to cart</span>
          <Link to="/cart" className="text-emerald-400 hover:underline text-sm">View Cart</Link>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
