import { Link } from 'react-router-dom'
import { ShoppingCart, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '../store/cartStore'

interface ProductCardProps {
  id: number
  name: string
  price: number
  discountPrice?: number
  imageUrl: string
}

const ProductCard = ({ id, name, price, discountPrice, imageUrl }: ProductCardProps) => {
  const addItem = useCartStore((s) => s.addItem)
  const unitPrice = discountPrice ?? price
  const [isFavorited, setIsFavorited] = useState(false)

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
            onClick={() =>
              addItem({
                productId: id,
                name,
                unitPrice,
                imageUrl,
                quantity: 1,
              })
            }
            className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
