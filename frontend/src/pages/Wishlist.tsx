import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, ArrowRight, Check, Sparkles } from 'lucide-react'
import { productsAPI, toApiUrl } from '../services/api'
import { useCartStore } from '../store/cartStore'

const toUrl = toApiUrl

const Wishlist = () => {
  const [favorites, setFavorites] = useState<number[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addedIds, setAddedIds] = useState<number[]>([])
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true)
      try {
        const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]')
        setFavorites(favoriteIds)

        if (favoriteIds.length > 0) {
          const allProducts = await productsAPI.getFeed()
          const favoriteProducts = allProducts.filter((p: any) => favoriteIds.includes(p.id))
          setProducts(favoriteProducts)
          // Clean stale IDs (products no longer available) from localStorage
          const validIds = favoriteProducts.map((p: any) => p.id)
          if (validIds.length !== favoriteIds.length) {
            localStorage.setItem('favorites', JSON.stringify(validIds))
            setFavorites(validIds)
            window.dispatchEvent(new CustomEvent('favoritesUpdated'))
          }
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error('Failed to load favorites:', error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()

    // Listen for favorites updates
    const handleFavoritesUpdate = () => {
      loadFavorites()
    }

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate)
    window.addEventListener('storage', handleFavoritesUpdate)

    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate)
      window.removeEventListener('storage', handleFavoritesUpdate)
    }
  }, [])

  const removeFromFavorites = (productId: number) => {
    const newFavorites = favorites.filter(id => id !== productId)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
    setFavorites(newFavorites)
    setProducts(products.filter(p => p.id !== productId))
    window.dispatchEvent(new CustomEvent('favoritesUpdated'))
  }

  const clearAllFavorites = () => {
    if (window.confirm('Are you sure you want to remove all items from your wishlist?')) {
      localStorage.setItem('favorites', JSON.stringify([]))
      setFavorites([])
      setProducts([])
      window.dispatchEvent(new CustomEvent('favoritesUpdated'))
    }
  }

  const handleAddToCart = (product: any) => {
    const unitPrice = product.discount_price ? Number(product.discount_price) : Number(product.price)
    const imageUrl = toUrl(product.image_url || product.design_preview || product.image) || 'https://via.placeholder.com/300'
    addItem({ productId: product.id, name: product.name, unitPrice, imageUrl, quantity: 1 })
    setAddedIds((prev) => [...prev, product.id])
    setTimeout(() => setAddedIds((prev) => prev.filter((i) => i !== product.id)), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1480px] mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-2 py-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 sm:w-7 sm:h-7 text-red-500 fill-red-500 flex-shrink-0" />
                My Wishlist
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5 pl-7 sm:pl-9">
                {products.length} {products.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            {products.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200 text-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 text-sm mb-6 sm:mb-8 max-w-md mx-auto">
              Start adding products you love to your wishlist. Click the heart icon on any product to save it here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors text-sm sm:text-base"
            >
              Browse Products
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {products.map((product) => {
                const unitPrice = product.discount_price ? Number(product.discount_price) : Number(product.price)
                const imgUrl = toUrl(product.image_url || product.design_preview || product.image) || 'https://via.placeholder.com/300x400'
                const isAdded = addedIds.includes(product.id)
                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="relative">
                      <Link to={`/products/${product.id}`}>
                        <img src={imgUrl} alt={product.name} className="w-full h-36 sm:h-52 object-cover" />
                      </Link>
                      {product.discount_price && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">SALE</span>
                      )}
                      <button
                        onClick={() => removeFromFavorites(product.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:bg-red-50 transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                    {/* Info */}
                    <div className="p-2.5 sm:p-3">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 hover:text-emerald-600 line-clamp-1 mb-1">{product.name}</h3>
                      </Link>
                      {product.designer_name && (
                        <div className="flex items-center gap-1 mb-1.5">
                          <Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0" />
                          <span className="text-[10px] text-purple-600 font-medium truncate">{product.designer_name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-sm sm:text-base font-bold text-emerald-600">৳{unitPrice}</span>
                          {product.discount_price && (
                            <span className="text-[10px] text-gray-400 line-through">৳{Number(product.price)}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg text-white text-xs font-semibold transition-all ${
                            isAdded ? 'bg-green-500' : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isAdded ? 'Added' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-0.5">Love these products?</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">Add them to your cart and complete your purchase</p>
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <Link
                    to="/products"
                    className="flex-1 sm:flex-none text-center px-4 py-2.5 sm:px-6 sm:py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    to="/cart"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    View Cart
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Wishlist
