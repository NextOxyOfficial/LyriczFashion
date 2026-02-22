import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsAPI } from '../services/api'

const Wishlist = () => {
  const [favorites, setFavorites] = useState<number[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-2">
                {products.length} {products.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            {products.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding products you love to your wishlist. Click the heart icon on any product to save it here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Browse Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {products.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={Number(product.price)}
                    discountPrice={product.discount_price ? Number(product.discount_price) : undefined}
                    imageUrl={product.image_url || product.design_preview || product.image || 'https://via.placeholder.com/300x400'}
                    designerName={product.designer_name}
                    storeSlug={product.creator_store_slug || product.store_slug}
                  />
                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => removeFromFavorites(product.id)}
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Love these products?</h3>
                  <p className="text-gray-600 text-sm">Add them to your cart and complete your purchase</p>
                </div>
                <div className="flex gap-3">
                  <Link
                    to="/products"
                    className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    to="/cart"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
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
