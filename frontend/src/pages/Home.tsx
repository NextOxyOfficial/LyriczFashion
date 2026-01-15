import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsAPI } from '../services/api'

const API_BASE_URL = 'http://localhost:8000'

const toUrl = (path?: string | null) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path}`
}

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productsAPI.getFeed()
        setFeaturedProducts(data)
      } catch {
        setFeaturedProducts([])
      }
    }
    load()
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    // Move in opposite direction (multiply by negative value)
    setMousePosition({ x: -x * 0.05, y: -y * 0.05 })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 })
  }

  return (
    <div>
      {/* Hero Section - TeeSpace Style */}
      <section className="py-4 bg-white">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="relative overflow-hidden rounded-3xl"
            style={{ backgroundColor: '#86efac' }}
          >
            {/* Decorative dots pattern - top left */}
            <div className="absolute top-16 left-16 w-20 h-20 opacity-30 hidden lg:block">
              <div className="grid grid-cols-5 gap-2">
                {[...Array(25)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                ))}
              </div>
            </div>

            {/* Decorative dots pattern - bottom left */}
            <div className="absolute bottom-24 left-24 w-16 h-16 opacity-25 hidden lg:block">
              <div className="grid grid-cols-4 gap-2">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[460px] py-12 lg:py-16">
              {/* Left Content */}
              <div className="relative z-10 pl-8 lg:pl-16">
                <h1 className="text-[40px] md:text-[48px] lg:text-[52px] font-bold text-gray-900 mb-4 leading-[1.15] tracking-tight">
                  T-shirt printing<br />
                  made easy.
                </h1>
                <p className="text-[15px] text-gray-700 mb-6 font-normal">
                  Print shirts for yourself or your online business
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  Shop now
                </Link>
              </div>

              {/* Right Content - Hero Image */}
              <div 
                className="relative h-[450px] lg:h-[500px] flex items-center justify-center lg:justify-end pr-8"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div 
                  ref={imageRef}
                  className="relative"
                  style={{
                    transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                    transition: 'transform 0.2s ease-out'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop"
                    alt="TeeSpace Custom T-Shirts"
                    className="w-full max-w-[500px] h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-100 rounded-full mb-4">
                <Truck className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Free Shipping</h3>
              <p className="text-sm text-gray-500">On orders over ৳2000</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Cash On Delivery</h3>
              <p className="text-sm text-gray-500">Pay when you receive</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-100 rounded-full mb-4">
                <RefreshCw className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Easy Returns</h3>
              <p className="text-sm text-gray-500">7 days return policy</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-100 rounded-full mb-4">
                <Headphones className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800">24/7 Support</h3>
              <p className="text-sm text-gray-500">Dedicated support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/design-studio" className="group relative overflow-hidden rounded-2xl h-80">
              <img
                src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600"
                alt="Design Studio"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white">Design Studio</h3>
                <p className="text-white/80">Upload logo + place on mockup</p>
              </div>
            </Link>
            <Link to="/products" className="group relative overflow-hidden rounded-2xl h-80">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
                alt="Explore Designs"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white">Explore Designs</h3>
                <p className="text-white/80">Browse seller-made designs</p>
              </div>
            </Link>
            <Link to="/seller" className="group relative overflow-hidden rounded-2xl h-80">
              <img
                src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600"
                alt="Start Selling"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white">Start Selling</h3>
                <p className="text-white/80">Create store + earn profit</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Designs</h2>
            <Link to="/products" className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center">
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                discountPrice={p.discount_price ? Number(p.discount_price) : undefined}
                imageUrl={toUrl(p.design_preview || p.image) || 'https://via.placeholder.com/600x600'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Get the latest updates on new designs, special offers, and exclusive deals.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Home
