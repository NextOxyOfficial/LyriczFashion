import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Sparkles, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '../store/cartStore'

interface ProductCardProps {
  id: number
  name: string
  price: number
  discountPrice?: number
  imageUrl: string
  designerName?: string
  storeSlug?: string
}

const ProductCard = ({ id, name, price, discountPrice, imageUrl, designerName, storeSlug }: ProductCardProps) => {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const unitPrice = discountPrice ?? price
  const [isFavorited, setIsFavorited] = useState(false)
  const [showAddedToast, setShowAddedToast] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  useEffect(() => {
    // Check if product is in favorites on mount
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setIsFavorited(favorites.includes(id))
  }, [id])

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if clicked inside Link
    e.stopPropagation()
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    
    if (isFavorited) {
      const newFavorites = favorites.filter((fav: number) => fav !== id)
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      setIsFavorited(false)
    } else {
      const newFavorites = [...favorites, id]
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      setIsFavorited(true)
    }
    
    // Dispatch custom event to update navbar
    window.dispatchEvent(new CustomEvent('favoritesUpdated'))
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative overflow-hidden bg-gray-50">
        <Link to={`/products/${id}`}>
          <img
            src={imageUrl || 'https://via.placeholder.com/300x400'}
            alt={name}
            className="w-full h-84 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {discountPrice && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            SALE
          </span>
        )}
        <button 
          onClick={toggleFavorite}
          className={`absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 ${
            isFavorited ? 'hover:bg-red-50' : 'hover:bg-red-50'
          }`}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-5 h-5 transition-colors ${
            isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'
          }`} />
        </button>
      </div>
      
      <div className="p-4">
        <Link to={`/products/${id}`}>
          <h3 className="text-base font-semibold text-gray-800 hover:text-emerald-600 transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>
        {designerName && (
          <div className="mt-2 mb-2">
            <div
              className="inline-flex flex-wrap items-center gap-x-1 gap-y-0.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border border-purple-100 rounded-lg group-hover:shadow-sm transition-all cursor-pointer hover:border-purple-300"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (storeSlug) navigate(`/store/${storeSlug}`)
              }}
            >
              <Sparkles className="w-3 h-3 text-purple-500 flex-shrink-0" />
              <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide whitespace-nowrap">Designed by</span>
              <span className="text-xs font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent hover:underline">
                {designerName}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            {discountPrice ? (
              <>
                <span className="text-lg font-bold text-emerald-600">৳{discountPrice}</span>
                <span className="text-sm text-gray-400 line-through">৳{price}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">৳{price}</span>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => {
              addItem({
                productId: id,
                name,
                unitPrice,
                imageUrl,
                quantity: 1,
              })
              // Show toast notification and change icon
              setShowAddedToast(true)
              setIsAddedToCart(true)
              setTimeout(() => {
                setShowAddedToast(false)
                setIsAddedToCart(false)
              }, 2000)
            }}
            className={`p-2 rounded-full transition-all duration-300 ${
              isAddedToCart 
                ? 'bg-green-500 hover:bg-green-600 scale-110' 
                : 'bg-emerald-500 hover:bg-emerald-600'
            } text-white`}
          >
            {isAddedToCart ? (
              <Check className="w-5 h-5" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Added to Cart Toast */}
      {showAddedToast && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold">Added to Cart!</p>
              <p className="text-sm text-emerald-100">{name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductCard
